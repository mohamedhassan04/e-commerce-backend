# 🚨 Security Audit — Critical & High Vulnerabilities

> **Date:** September 1, 2026
> **Scope:** Only Critical (P0) and High (P1) severity findings
> **Total:** 4 Critical + 6 High = 10 vulnerabilities

---

## CRITICAL VULNERABILITIES (Fix Immediately)

---

### [CRITICAL] #1 — CORS Misconfiguration Allows Credential Theft

**Location:** `src/main.ts:49-53`

**Problem:** `origin: true` reflects the requesting origin back in `Access-Control-Allow-Origin`. Combined with `credentials: true`, any website can make authenticated API requests using the user's cookies.

**Attack Scenario:**
1. Attacker creates `evil.com`
2. User visits `evil.com` while logged into your API
3. `evil.com` runs: `fetch('http://your-api/api/order/my-orders', {credentials: 'include'})`
4. Browser attaches the HTTP-only cookie → attacker gets the user's order data

**Impact:** Full account compromise, data theft, unauthorized actions on behalf of any user.

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
  origin: ['http://localhost:3000'], // whitelist only your actual frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});
```

**Priority:** P0 — Fix before any deployment

---

### [CRITICAL] #2 — IDOR on Order Details

**Location:**
- `src/modules/order/order.controller.ts:51-54`
- `src/modules/order/order.service.ts:246-266`

**Problem:** `GET /api/order/:id` does NOT verify that the requesting user owns the order. Any authenticated user can access any order by UUID.

**Attack Scenario:**
```
GET /api/order/<target-order-uuid>
Authorization: Bearer <attacker-token>
```
The attacker can view any order including shipping addresses, phone numbers, and item details.

**Impact:** Full exposure of PII (addresses, phone numbers), order data, and business information.

**Current Code:**
```typescript
// order.controller.ts
@UseGuards(JwtAuthGuard)
@Get(':id')
findOrderById(@Param('id') id: string) {
  return this.orderService.findOrderById(id);
}

// order.service.ts — no userId filter
async findOrderById(orderId: string) {
  const order = await this._orderRepo
    .createQueryBuilder('order')
    // ... joins ...
    .where('order.id = :orderId', { orderId })
    .getOne();
```

**Recommended Fix:**
```typescript
// controller
@UseGuards(JwtAuthGuard)
@Get(':id')
findOrderById(@Param('id') id: string, @GetUser() user: Users) {
  return this.orderService.findOrderById(id, user.id);
}

// service
async findOrderById(orderId: string, userId: string) {
  const order = await this._orderRepo
    .createQueryBuilder('order')
    // ... joins ...
    .where('order.id = :orderId', { orderId })
    .andWhere('order.user.id = :userId', { userId })
    .getOne();
```

**Priority:** P0 — Fix before any deployment

---

### [CRITICAL] #3 — Unauthenticated User Enumeration Endpoint

**Location:** `src/modules/users/users.controller.ts:22-25`

**Problem:** `GET /api/users/get-user-by-email` is completely unauthenticated. It accepts an email in the request body and returns full user data (including password hash).

**Attack Scenario:**
```
GET /api/users/get-user-by-email
Body: { "email": "admin@example.com" }
```
Returns user object with password hash, or 404 if not found. Attacker can enumerate all accounts.

**Impact:** Full user enumeration, bcrypt password hash exposure, targeted brute force attacks.

**Current Code:**
```typescript
@Get('get-user-by-email')
findOne(@Body() email: string) {
  return this.usersService.findOneUser(email);
}
```

**Recommended Fix:** Remove this endpoint entirely, or add `@UseGuards(JwtAuthGuard)` and restrict to own profile only.

**Priority:** P0 — Fix before any deployment

---

### [CRITICAL] #4 — .env With All Secrets in Project Root

**Location:** `.env`

**Problem:** The `.env` file contains all production secrets:
- JWT secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
- Database credentials (`postgres`/`123456789`)
- SMTP credentials
- PGAdmin credentials (`admin@admin.com`/`123456789`)

**Impact:** If committed to git, all secrets are compromised. Repository history contains them forever, even if removed later.

**Recommended Fix:**
1. Add `.env` to `.gitignore` immediately
2. Rotate ALL secrets (JWT, DB password, SMTP, PGAdmin)
3. Use environment variable injection in production (never commit secrets)
4. Use a secrets manager (AWS Secrets Manager, Vault, etc.)

**Priority:** P0 — Fix immediately, rotate all secrets

---

## HIGH VULNERABILITIES (Fix Soon)

---

### [HIGH] #5 — Password Hash Exposed via Public Endpoint

**Location:**
- `src/modules/users/users.service.ts:53-58`
- `src/modules/users/entities/user.entity.ts:18`

**Problem:** `findOneUser` returns the full entity object including the `password` column. This method is called by the unauthenticated `get-user-by-email` endpoint (#3), exposing bcrypt password hashes.

**Impact:** Attackers can obtain bcrypt hashes for offline brute force.

**Current Code:**
```typescript
async findOneUser(email: string) {
  return await this._userRepo.findOne({
    where: { email },
    relations: ['addresses', 'phoneNumbers'],
  });
}
```

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

**Priority:** P0 (tied to #3)

---

### [HIGH] #6 — Cookie maxAge Mismatches JWT Expiry

**Location:** `src/modules/auth/auth.controller.ts:60`

**Problem:** JWT expires after 15 minutes (`ACCESS_TOKEN_TTL=15m`), but the cookie's `maxAge` is set to 1 hour (`JWT_EXPIRATION_MS=3600000`). For 45 minutes after the JWT expires, the cookie still exists but contains an expired token, causing silent auth failures.

**Impact:** Poor UX, confusing debugging, potential security logic bypass.

**Current Code:**
```typescript
maxAge: this.configService.get<number>('JWT_EXPIRATION_MS', 3600000),
```

**Recommended Fix:** Derive cookie maxAge from JWT TTL:
```typescript
// Parse ACCESS_TOKEN_TTL (e.g., "15m") to milliseconds
const ttlMs = parseJwtTtl(configService.get<string>('ACCESS_TOKEN_TTL', '15m'));
res.cookie('access_token', accessToken, {
  httpOnly: true,
  secure: configService.get<string>('NODE_ENV') === 'production',
  sameSite: 'lax',
  maxAge: ttlMs,
});
```

**Priority:** P1

---

### [HIGH] #7 — Logout Doesn't Clear Cookie With Matching Attributes

**Location:** `src/modules/auth/auth.controller.ts:130`

**Problem:** `res.clearCookie('access_token')` is called without specifying the same `httpOnly`, `secure`, `sameSite`, and `path` options used when setting the cookie. Some browsers may not clear the cookie properly.

**Impact:** Users may appear logged out but still have a valid cookie in their browser.

**Current Code:**
```typescript
res.clearCookie('access_token');
```

**Recommended Fix:**
```typescript
res.clearCookie('access_token', {
  httpOnly: true,
  secure: this.configService.get<string>('NODE_ENV') === 'production',
  sameSite: 'lax',
});
```

**Priority:** P1

---

### [HIGH] #8 — No Refresh Token / Token Revocation Mechanism

**Location:** `src/modules/auth/` (entire auth module)

**Problem:** Only access tokens (15-minute lifetime) are issued. There is no:
- Refresh token
- Token rotation
- Token revocation / blacklisting

Once a JWT is compromised, it's valid for 15 minutes with no recourse.

**Impact:** Stolen tokens remain usable. No way to force-logout a compromised session.

**Recommended Fix:** Implement refresh token flow:
1. Issue a short-lived access token (15m) + long-lived refresh token (7d)
2. Store refresh tokens in DB (hashed)
3. On refresh: validate refresh token, issue new pair, revoke old refresh token
4. On logout: revoke refresh token
5. On suspected compromise: revoke all refresh tokens for user

**Priority:** P1

---

### [HIGH] #9 — Hardcoded Personal Email in Mail Service

**Location:** `src/shared/send-mail/mail.service.ts:61`

**Problem:** Order notification emails are hardcoded to `farouk.abdelkrim@gmail.com`.

**Impact:**
- Order notifications go to the wrong person
- Personal email address exposed in source code
- Cannot be configured per-environment

**Current Code:**
```typescript
async sendOrderEmail(data: any) {
  await this.mailerService.sendMail({
    to: 'farouk.abdelkrim@gmail.com', // hardcoded!
    // ...
  });
}
```

**Recommended Fix:** Use configuration:
```typescript
async sendOrderEmail(data: any) {
  const adminEmail = this.configService.get<string>('ORDER_NOTIFICATION_EMAIL');
  await this.mailerService.sendMail({
    to: adminEmail,
    // ...
  });
}
```

**Priority:** P1

---

### [HIGH] #10 — Weak Rate Limits on Authentication Endpoints

**Location:** `.env` — `THROTTLER_LIMIT=300` per `THROTTLER_TTL=60`

**Problem:** The global rate limit is 300 requests per minute. For login, this allows ~5 attempts per second, making brute force attacks feasible.

**Current Configuration:**
```env
THROTTLER_TTL=60
THROTTLER_LIMIT=300
```

**Impact:** Password brute force, credential stuffing.

**Recommended Fix:** Add per-endpoint throttling:
```typescript
// auth.controller.ts
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 per minute for login
@UseGuards(LocalAuthGuard)
@Post('login')
async login(...) { ... }

@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 per minute for register
@Post('register')
async register(...) { ... }
```

Or reduce the global limit to 100 and add stricter per-endpoint limits.

**Priority:** P1

---

## Summary

| Severity | # | IDs |
|----------|---|-----|
| Critical | 4 | #1, #2, #3, #4 |
| High | 6 | #5, #6, #7, #8, #9, #10 |

### Fix Order

1. **#4** — Rotate secrets, add `.env` to `.gitignore`
2. **#1** — Fix CORS origin whitelist
3. **#3 + #5** — Remove/protect `get-user-by-email`, strip password from responses
4. **#2** — Add ownership check to `findOrderById`
5. **#6** — Align cookie maxAge with JWT expiry
6. **#7** — Fix logout cookie clearing
7. **#9** — Move hardcoded email to config
8. **#10** — Add per-endpoint rate limiting
9. **#8** — Implement refresh tokens (larger effort)
