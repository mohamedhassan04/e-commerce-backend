# 🔐 NestJS E-Commerce Backend — Security Audit Report

> **Date:** September 1, 2026
> **Auditor:** opencode Security Audit
> **Scope:** Full backend codebase (NestJS + TypeORM + PostgreSQL)
> **Overall Score:** 42/100 — Risk Level: **High**

---

## Table of Contents

1. [Security Rating](#-security-rating)
2. [Architecture Overview](#1--general-security-map)
3. [Authentication Security](#2--authentication-security)
4. [Authorization / Access Control](#3--authorization--access-control)
5. [Input Validation](#4--input-validation)
6. [SQL / Database Security](#5--sql--database-security)
7. [E-Commerce Business Logic](#6--e-commerce-business-logic-security)
8. [CORS / HTTP Security](#7--cors--http-security)
9. [Rate Limiting / DOS Protection](#8--rate-limiting--dos-protection)
10. [CSRF](#9--csrf)
11. [File Upload Security](#10--file-upload-security)
12. [Secrets & Environment Variables](#11--secrets--environment-variables)
13. [Error Handling](#12--error-handling)
14. [Logging & Monitoring](#13--logging--monitoring)
15. [Dependency Security](#14--dependency-security)
16. [Swagger / API Security](#15--swagger--api-security)
17. [Race Conditions](#16--race-conditions)
18. [Transactions & Data Consistency](#17--transactions--data-consistency)
19. [Sensitive Data Exposure](#18--sensitive-data-exposure)
20. [API Enumeration](#19--api-enumeration)
21. [Vulnerability Report](#20--vulnerability-report)
22. [Fix Plan](#21--fix-plan)

---

## 🏆 Security Rating

| Category | Score |
|----------|-------|
| Authentication | 5/10 |
| Authorization | 4/10 |
| Input Validation | 7/10 |
| Database Security | 7/10 |
| Payment Security | N/A |
| Business Logic | 7/10 |
| API Security | 4/10 |
| Infrastructure | 3/10 |
| Secrets Management | 2/10 |
| Logging/Monitoring | 3/10 |

```
Overall Security Score: 42/100
Risk Level: High
```

---

## 1. 🔎 GENERAL SECURITY MAP

### Endpoint Security Map

| Endpoint | Method | Auth | Role | Risk |
|----------|--------|------|------|------|
| `POST /api/auth/register` | POST | None | Public | HIGH |
| `POST /api/auth/login` | POST | None | Public | HIGH |
| `POST /api/auth/logout` | POST | None | Public | LOW |
| `GET /api/auth/current` | GET | JWT | Any | MEDIUM |
| `GET /api/users/get-user-by-email` | GET | **NONE** | **Public** | **CRITICAL** |
| `PUT /api/users/addresses` | PUT | JWT | USER | MEDIUM |
| `PATCH /api/users/addresses/:id` | PATCH | JWT | USER | MEDIUM |
| `PUT /api/users/phone-numbers` | PUT | JWT | USER | MEDIUM |
| `PATCH /api/users/phone-numbers/:id` | PATCH | JWT | USER | MEDIUM |
| `GET /api/product/all` | GET | None | Public | LOW |
| `POST /api/product` | POST | JWT+Roles | ADMIN | MEDIUM |
| `PATCH /api/product/:id/rating` | PATCH | JWT | Any | MEDIUM |
| `DELETE /api/product/:id` | DELETE | JWT+Roles | ADMIN | MEDIUM |
| `GET /api/category/all` | GET | None | Public | LOW |
| `POST /api/category` | POST | JWT+Roles | ADMIN | LOW |
| `GET /api/category/:id` | GET | JWT+Roles | ADMIN | LOW |
| `PATCH /api/category/:id` | PATCH | JWT+Roles | ADMIN | LOW |
| `DELETE /api/category/:id` | DELETE | JWT+Roles | ADMIN | LOW |
| `POST /api/order` | POST | JWT | Any | HIGH |
| `GET /api/order/my-orders` | GET | JWT | Any | MEDIUM |
| `GET /api/order/all` | GET | JWT+Roles | ADMIN | MEDIUM |
| `GET /api/order/:id` | GET | JWT | Any | **HIGH (IDOR)** |
| `PATCH /api/order/:id/status` | PATCH | JWT+Roles | ADMIN | MEDIUM |
| `PATCH /api/order/:id/cancel` | PATCH | JWT | Any | MEDIUM |

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 10 |
| Language | TypeScript 5.1 |
| Database | PostgreSQL (TypeORM 0.3) |
| Auth | Passport-JWT, HTTP-only cookies |
| Validation | class-validator + ValidationPipe |
| Rate Limiting | @nestjs/throttler (global) |
| Security Headers | Helmet |
| Logging | Winston (console only) |

---

## 2. 🔑 AUTHENTICATION SECURITY

### Passwords

**✅ Password not returned in responses**
The `validateUser` method in `auth.service.ts:20` correctly strips password before returning.

**✅ Password hashing in registration**
Passwords are properly hashed with bcrypt before storage (`users.service.ts:33`).

**[HIGH] Weak bcrypt cost factor**
`src/modules/users/users.service.ts:32` — salt rounds set to 10. Modern recommendations suggest 12-14.

```typescript
// Current
const salt = await bcrypt.genSalt(10);

// Recommended
const salt = await bcrypt.genSalt(12);
```

**[INFO] Argon2 installed but unused**
`@node-rs/argon2` is in `package.json` but never imported. Dead dependency.

### JWT

**[HIGH] JWT_SECRET and JWT_REFRESH_SECRET are identical**
`.env` — both secrets have the same value. Additionally, `JWT_REFRESH_SECRET` is defined but never used (no refresh token implementation).

**[HIGH] No refresh token implementation**
Only access tokens are issued. No refresh token, no token rotation, no token revocation.

**[MEDIUM] JWT secret exposed in .env**
The `.env` file with JWT secrets is in the project root. If committed to git, all secrets are compromised.

**✅ JWT algorithm**
Uses default HMAC SHA-256 (HS26). Acceptable.

**✅ Token expiration**
`ACCESS_TOKEN_TTL=15m` is reasonable.

### Cookies

**[HIGH] Cookie maxAge mismatches JWT expiry**
JWT expires in 15m but cookie lives for 60m (`JWT_EXPIRATION_MS=3600000`). 45-minute window of broken auth.

```typescript
// Current (auth.controller.ts:60)
maxAge: this.configService.get<number>('JWT_EXPIRATION_MS', 3600000),
```

**[MEDIUM] SameSite is 'lax'**
`sameSite: 'lax'` allows cookies on top-level GET navigations. For API-only backend, `'strict'` is better.

**[MEDIUM] Logout doesn't clear cookie with matching options**
`res.clearCookie('access_token')` without `httpOnly`, `secure`, `sameSite` options may not work in all browsers.

**✅ HttpOnly flag** — Set correctly.

**✅ Secure flag** — `true` in production only. Correct.

---

## 3. 🛡️ AUTHORIZATION / ACCESS CONTROL

### [CRITICAL] IDOR — Order access without ownership check

`GET /api/order/:id` (`findOrderById`) does NOT verify that the requesting user owns the order. Any authenticated user can access any order.

```typescript
// order.controller.ts — no userId check
@UseGuards(JwtAuthGuard)
@Get(':id')
findOrderById(@Param('id') id: string) {
  return this.orderService.findOrderById(id);
}
```

### [HIGH] Unauthenticated user lookup by email

`GET /api/users/get-user-by-email` is completely unauthenticated and returns user data. Enables full user enumeration.

```typescript
// users.controller.ts — no guard
@Get('get-user-by-email')
findOne(@Body() email: string) {
  return this.usersService.findOneUser(email);
}
```

### [HIGH] Admin role only checked via JWT payload

`RolesGuard` reads role from JWT payload. If JWT secret is compromised, attacker can forge admin tokens. No server-side DB re-verification.

### [MEDIUM] Order status update — no state transition validation

Admin can set ANY status including backwards transitions (e.g., DELIVERED → PENDING).

---

## 4. 🚨 INPUT VALIDATION

**✅ Global ValidationPipe** configured with `transform`, `whitelist`, `forbidNonWhitelisted`.

**[MEDIUM] Pagination limit has no maximum cap**
`?limit=999999999` could cause memory exhaustion.

**[MEDIUM] No UUID validation on path parameters**
`:id` params are typed as `string` but never validated with `@IsUUID()`.

**✅ Strong password validation** — `@IsStrongPassword` with min 8 chars, uppercase, lowercase, numbers.

**✅ Product creation DTOs** — All fields properly validated.

**✅ Order item quantity** — `@IsInt()` and `@Min(1)`.

---

## 5. 💉 SQL / DATABASE SECURITY

**✅ No raw SQL with string interpolation** — All queries use parameterized QueryBuilder or find methods.

**✅ Parameterized queries in create-database.ts**

**[MEDIUM] `synchronize: true` in database config**
Auto-syncs entity schemas. Dangerous in production — could cause data loss on entity changes.

**[MEDIUM] Database name with hyphen** (`e-commerce`) — Handled with quoting but fragile.

---

## 6. 🛒 E-COMMERCE BUSINESS LOGIC SECURITY

**✅ Server-side price calculation (Orders)**
Order creation fetches variant from DB and uses `variant.price`. Never trusts client prices.

**✅ Stock validation with pessimistic locking**
Uses `setLock('pessimistic_write')` on ProductVariant queries. Prevents overselling.

**✅ Stock restoration on cancel** — Properly restores stock using same locking pattern.

**✅ Address/phone ownership verification** — Address and phone number IDs are verified against the authenticated user.

**[MEDIUM] No maximum quantity limit per order item**
`@Min(1)` prevents zero/negative, but no upper bound (e.g., `quantity: 999999`).

---

## 7. 🌐 CORS / HTTP SECURITY

### [CRITICAL] CORS allows any origin with credentials

```typescript
// main.ts
app.enableCors({
  origin: true,        // reflects ANY requesting origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});
```

`origin: true` + `credentials: true` = any website can make authenticated requests to your API.

**✅ Helmet enabled** — `app.use(helmet())` applied globally.

**[MEDIUM] No explicit CSP configuration** — Helmet defaults used. For API, acceptable.

**✅ Request body size limits** — 20MB for JSON and URL-encoded.

---

## 8. 🚦 RATE LIMITING / DOS PROTECTION

**[MEDIUM] Rate limit is too permissive for auth endpoints**
300 requests per 60 seconds per IP. ~5 login attempts/second enables brute force.

**✅ Global ThrottlerGuard** registered as APP_GUARD.

**[MEDIUM] No IP detection behind reverse proxy**
When behind Nginx/Cloudflare, all requests may appear from same proxy IP.

---

## 9. 🛡️ CSRF

**[MEDIUM] Cookie-based auth without explicit CSRF tokens**
`SameSite: 'lax'` provides reasonable CSRF protection for this architecture (cookies not sent on cross-origin POST). However, implementing CSRF tokens would provide defense-in-depth.

---

## 10. 📁 FILE UPLOAD SECURITY

**✅ File type filtering** — MIME type validation for image types only (jpg, jpeg, png, gif, webp).

**[MEDIUM] MIME-only validation is insufficient**
MIME types come from client and can be spoofed. File extension not validated against content.

**✅ File size limit** — 5MB max.

**✅ Randomized filenames** — UUID-based, prevents path traversal.

**[MEDIUM] Uploads served as static assets without auth**
`/uploads` prefix serves files publicly.

---

## 11. 🔐 SECRETS & ENVIRONMENT VARIABLES

**[HIGH] Hardcoded personal email in mail service**
`src/shared/send-mail/mail.service.ts:61` — `to: 'farouk.abdelkrim@gmail.com'` hardcoded.

**[HIGH] .env file with all secrets at project root**
Contains JWT secrets, DB credentials (`postgres`/`123456789`), SMTP credentials, PGAdmin credentials.

**[MEDIUM] Weak database password** — `123456789` is trivially guessable.

**[MEDIUM] Same password for PGAdmin**

---

## 12. ⚠️ ERROR HANDLING

**[MEDIUM] Error message leakage in auth controller**
`error.message` returned to client in login error handler.

**✅ Service-level error handling** — Services throw generic `NotFoundException` / `BadRequestException`.

**✅ Transaction rollback on errors** — Order create/cancel properly rollback.

---

## 13. 📊 LOGGING & MONITORING

**[MEDIUM] Console.error instead of Winston logger** in mail service.

**[MEDIUM] Logger only outputs to console** — No file or external log aggregation.

**[LOW] Logger level 'debug'** — Could log sensitive data in production.

**[INFO] No security event logging** — Failed logins, unauthorized access not logged.

---

## 14. 📦 DEPENDENCY SECURITY

**[INFO] `@node-rs/argon2` unused** — Installed but never imported. Remove.

**✅ Dependencies appear current** — All packages at recent versions.

**Recommendation:** Run `npm audit` for known vulnerability scan.

---

## 15. 📚 SWAGGER / API SECURITY

**✅ Swagger disabled in production** — `if (process.env.NODE_ENV === 'production') return;`

**[MEDIUM] Swagger accessible in dev without auth** — If dev servers are internet-accessible, full API surface is exposed.

---

## 16. 🧠 RACE CONDITIONS

**✅ Order stock handling uses pessimistic locking** — `setLock('pessimistic_write')`.

**[MEDIUM] Rating calculation is not atomic**
Read-modify-write cycle without locking. Two simultaneous ratings could lose one update.

```typescript
// Current (product.service.ts:155-180)
const product = await this._productRepo.findOne({ where: { id } });
const newRatingCount = product.ratingCount + 1;
// ... read, modify, write — no lock
```

---

## 17. 🔄 TRANSACTIONS & DATA CONSISTENCY

**✅ Order creation uses transactions** — QueryRunner with start/commit/rollback.

**✅ Order cancellation uses transactions** — Same pattern.

**[LOW] User registration doesn't use transactions** — Single INSERT, not strictly needed.

---

## 18. 🔒 SENSITIVE DATA EXPOSURE

**[HIGH] User entity returns all fields including password**
`findOneUser` returns full entity with `password` hash. The unauthenticated endpoint exposes this.

**[MEDIUM] No `@Exclude()` on password field** — Any serialization of User entity leaks the hash.

**✅ Order responses don't expose user password** — Uses `addSelect` with specific fields.

---

## 19. 🔍 API ENUMERATION

**[HIGH] User enumeration via registration** — Different error for existing vs non-existing emails.

**[HIGH] User enumeration via get-user-by-email** — Unauthenticated, returns user data or 404.

**✅ Order 404 messages are generic**

---

## 20. 🚨 VULNERABILITY REPORT

### [CRITICAL] #1 — CORS misconfiguration allows credential theft

**Location:** `src/main.ts:49-53`

**Problem:** `origin: true` with `credentials: true` allows ANY website to make authenticated API requests.

**Attack Scenario:** Attacker creates `evil.com` that uses `fetch('http://your-api/api/order/my-orders', {credentials: 'include'})` to steal order data from any logged-in user who visits the attacker's page.

**Impact:** Full account compromise, data theft, unauthorized actions.

**Current Code:**
```typescript
app.enableCors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});
```

**Recommended Fix:**
```typescript
app.enableCors({
  origin: ['http://localhost:3000'], // your actual frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});
```

**Priority:** P0

---

### [CRITICAL] #2 — IDOR on order details

**Location:** `src/modules/order/order.controller.ts:51-54`, `src/modules/order/order.service.ts:246-266`

**Problem:** Any authenticated user can view any order by ID. No ownership check.

**Attack Scenario:** Attacker enumerates order UUIDs and views other users' orders including PII.

**Impact:** Full exposure of order data, shipping addresses, phone numbers.

**Recommended Fix:**
```typescript
async findOrderById(orderId: string, userId: string) {
  const order = await this._orderRepo
    .createQueryBuilder('order')
    .where('order.id = :orderId', { orderId })
    .andWhere('order.user.id = :userId', { userId })
    .getOne();
```

**Priority:** P0

---

### [CRITICAL] #3 — Unauthenticated user enumeration endpoint

**Location:** `src/modules/users/users.controller.ts:22-25`

**Problem:** `GET /api/users/get-user-by-email` is public and returns user data.

**Attack Scenario:** Attacker sends requests with known emails to enumerate accounts and retrieve user information.

**Impact:** User enumeration, potential data leakage.

**Recommended Fix:** Remove this endpoint entirely, or add authentication + restrict to own profile.

**Priority:** P0

---

### [CRITICAL] #4 — .env with secrets in project root

**Location:** `.env`

**Problem:** Contains JWT secrets, database passwords, SMTP credentials, PGAdmin credentials.

**Impact:** If committed to git, all secrets are compromised. Repository history contains them forever.

**Recommended Fix:**
1. Add `.env` to `.gitignore`
2. Rotate ALL secrets immediately
3. Use environment variable injection in production

**Priority:** P0

---

### [HIGH] #5 — User entity password hash exposed via public endpoint

**Location:** `src/modules/users/users.controller.ts:22-25`, `src/modules/users/users.service.ts:53-58`

**Problem:** `findOneUser` returns full entity including `password` field. Called by unauthenticated endpoint.

**Impact:** bcrypt password hash exposed to attackers.

**Recommended Fix:**
```typescript
async findOneUser(email: string) {
  const user = await this._userRepo.findOne({
    where: { email },
    relations: ['addresses', 'phoneNumbers'],
  });
  if (user) {
    const { password, ...result } = user;
    return result;
  }
  return null;
}
```

**Priority:** P0

---

### [HIGH] #6 — Cookie maxAge mismatches JWT expiry

**Location:** `src/modules/auth/auth.controller.ts:60`

**Problem:** JWT expires in 15m but cookie lives for 60m. 45-minute window of broken auth.

**Impact:** Silent authentication failures, poor UX.

**Priority:** P1

---

### [HIGH] #7 — Logout doesn't clear cookie with matching attributes

**Location:** `src/modules/auth/auth.controller.ts:130`

**Problem:** `clearCookie` without options may not actually clear the cookie in some browsers.

**Impact:** Logged-out users may still have a valid-looking (but expired) cookie.

**Priority:** P1

---

### [HIGH] #8 — No refresh token / token revocation mechanism

**Location:** `src/modules/auth/`

**Problem:** Once a JWT is issued, it's valid until expiry. No way to revoke compromised tokens.

**Impact:** Stolen tokens remain valid for 15 minutes with no recourse.

**Priority:** P1

---

### [HIGH] #9 — Hardcoded personal email in mail service

**Location:** `src/shared/send-mail/mail.service.ts:61`

**Problem:** Order emails always go to `farouk.abdelkrim@gmail.com`.

**Impact:** Order notifications go to wrong person, personal email exposed in source code.

**Priority:** P1

---

### [HIGH] #10 — Weak rate limits on authentication endpoints

**Location:** `.env` — `THROTTLER_LIMIT=300` per 60s

**Problem:** No per-endpoint throttling. Login allows ~5 attempts/second.

**Impact:** Brute force attacks on login are feasible.

**Priority:** P1

---

### [MEDIUM] #11 — `synchronize: true` in database config

**Location:** `src/config/config.service.ts:93`

**Problem:** Auto-syncs schema in all environments including production.

**Impact:** Data loss on entity changes in production.

**Priority:** P0 (before production)

---

### [MEDIUM] #12 — Unbounded pagination limit

**Location:** `src/modules/product/product.service.ts:101`

**Problem:** No max limit on `?limit=` query parameter.

**Impact:** Memory exhaustion via `?limit=999999999`.

**Priority:** P1

---

### [MEDIUM] #13 — File upload MIME-only validation

**Location:** `src/shared/multer/multer.config.ts:13-16`

**Problem:** Only checks Content-Type header, not actual file content.

**Impact:** Malicious files disguised as images could be uploaded and served.

**Priority:** P1

---

### [MEDIUM] #14 — No order status state machine

**Location:** `src/modules/order/order.service.ts:270-287`

**Problem:** Admin can set any status including backwards transitions.

**Impact:** Business logic corruption (e.g., DELIVERED → PENDING).

**Priority:** P2

---

### [MEDIUM] #15 — Rating calculation race condition

**Location:** `src/modules/product/product.service.ts:155-180`

**Problem:** Read-modify-write without locking.

**Impact:** Lost ratings under concurrent access.

**Priority:** P2

---

### [MEDIUM] #16 — Error message leakage in auth login

**Location:** `src/modules/auth/auth.controller.ts:68-71`

**Problem:** `error.message` returned to client.

**Impact:** Internal error details exposed.

**Priority:** P1

---

### [MEDIUM] #17 — No security event logging

**Problem:** Failed logins, unauthorized access not logged.

**Impact:** Cannot detect or investigate attacks.

**Priority:** P2

---

### [MEDIUM] #18 — Admin role from JWT not DB-verified

**Location:** `src/modules/auth/guards/roles.guard.ts`

**Problem:** Role comes from JWT payload, never re-checked against database.

**Impact:** If JWT secret compromised, attacker gets persistent admin access.

**Priority:** P2

---

### [LOW] #19 — SameSite 'lax' should be 'strict' for API-only backend

**Location:** `src/modules/auth/auth.controller.ts:59`

**Priority:** P2

---

### [LOW] #20 — Logger level 'debug' in all environments

**Location:** `src/shared/logger/logger.config.ts:27`

**Priority:** P3

---

## 21. 🛠️ FIX PLAN

### P0 — Fix Immediately (Before Any Deployment)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | CORS allows any origin | `main.ts:49` | Whitelist specific origins |
| 2 | IDOR on order details | `order.service.ts:246` | Add userId ownership check |
| 3 | Unauthenticated user enumeration | `users.controller.ts:22` | Remove or protect endpoint |
| 4 | .env secrets in repo | `.env` | Add to .gitignore, rotate secrets |
| 5 | Password hash in user responses | `users.service.ts:53` | Strip password field |
| 6 | `synchronize: true` | `config.service.ts:93` | Disable in production |
| 7 | Weak DB password | `.env` | Use strong password |

### P1 — Fix Soon

| # | Issue | File | Fix |
|---|-------|------|-----|
| 8 | Cookie/JWT expiry mismatch | `auth.controller.ts:60` | Align TTLs |
| 9 | Logout cookie clear | `auth.controller.ts:130` | Pass matching options |
| 10 | No refresh tokens | `auth.service.ts` | Implement refresh token flow |
| 11 | Weak rate limits | `.env` / config | Add per-endpoint throttling |
| 12 | Hardcoded email | `mail.service.ts:61` | Use config |
| 13 | Unbounded pagination | `product.service.ts` | Cap limit at 100 |
| 14 | MIME-only upload validation | `multer.config.ts` | Validate content/magic bytes |
| 15 | Error message leakage | `auth.controller.ts:68` | Remove error.message |

### P2 — Hardening

| # | Issue | Fix |
|---|-------|-----|
| 16 | Order status state machine | Add transition validation |
| 17 | Rating race condition | Use atomic updates |
| 18 | Security event logging | Add audit log events |
| 19 | DB role verification | Re-check role on sensitive ops |
| 20 | SameSite strict | Change cookie SameSite |
| 21 | File upload content validation | Use file-type library |
| 22 | Swagger in dev | Add basic auth |
| 23 | Logger configuration | Add file/external transport |

### P3 — Nice to Have

| # | Issue | Fix |
|---|-------|-----|
| 24 | Remove unused argon2 | Remove from package.json |
| 25 | Logger level | Set to 'info' in production |
| 26 | CSP headers | Configure explicit CSP |
| 27 | UUID validation on params | Add @IsUUID() decorators |
| 28 | Security tests | Add IDOR/auth tests |

---

## ✅ Security Audit Summary

### Vulnerabilities Found
- **Critical:** 4
- **High:** 6
- **Medium:** 9
- **Low:** 2

### Strongest Parts
1. Order price calculation — server-side, never trusts client
2. Stock handling — pessimistic locking prevents race conditions
3. Input validation — global ValidationPipe with whitelist + forbidNonWhitelisted
4. Transaction handling — order create/cancel use proper transactions with rollback
5. Password hashing — bcrypt used correctly
6. Swagger disabled in production
7. Helmet enabled
8. Address/phone ownership verified in order creation

### Biggest Remaining Risks
1. CORS `origin: true` — any website can steal user data
2. IDOR on orders — any user can view any order
3. Unauthenticated user endpoint — full user enumeration and data leak
4. Secrets in `.env` — likely committed to version control
5. Password hash exposure — via unauthenticated endpoint

### Top 10 Actions Before Production
1. Fix CORS — whitelist only your frontend origin
2. Fix IDOR — add ownership checks to `findOrderById`
3. Remove/protect `get-user-by-email` endpoint
4. Add `.env` to `.gitignore` and rotate all secrets
5. Strip password from all user responses
6. Set `synchronize: false` in production
7. Implement refresh tokens with proper rotation
8. Strengthen rate limits for auth endpoints (10/min for login)
9. Fix logout cookie clearing with matching attributes
10. Add security event logging for failed logins and unauthorized access
