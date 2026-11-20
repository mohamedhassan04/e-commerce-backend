# VPS deployment

This setup builds the Mamolej NestJS API with Node.js 26.12.1 and PostgreSQL in Docker. Nginx runs directly on the VPS, proxies API requests to the loopback-only API port, and serves uploaded images from the VPS host.

## 1. Prepare the VPS

Install Docker Engine, the Docker Compose plugin, Nginx, and Certbot on the VPS. Create directories for the backend source, built frontend, and persistent uploads. The API container runs as the `node` user (UID/GID 1000), so grant it write access to uploads:

```sh
sudo mkdir -p /srv/mamolej/uploads
sudo chown 1000:1000 /srv/mamolej/uploads
sudo chmod 0755 /srv/mamolej/uploads
sudo mkdir -p /srv/mamolej/app /srv/mamolej/frontend/dist
sudo chown -R "$USER":"$USER" /srv/mamolej/app /srv/mamolej/frontend
```

Prepare `.env.prod` locally from `.env.example` and replace all sample credentials and URLs. Upload this file separately with SCP; do not include it in the source sync. On the VPS, set its permissions to `600`. Docker Compose reads `.env.prod` for the API and PostgreSQL; it does not use `.env`. The uploads bind mount uses `/srv/mamolej/uploads`, which must match the Nginx `alias` path. `POSTGRES_HOST` must remain `postgres`, the Compose service name. Set `POSTGRES_DB` to the same database name as `POSTGRES_DATABASE`; the first is used by PostgreSQL and the second by NestJS. Use strong independent secrets for PostgreSQL and JWT.

The app requires SMTP settings at startup. Fill in the values for your mail provider even if you are not testing email yet. Make sure `FRONTEND_PATH` matches `https://www.mamolej.cz` exactly. Host Nginx needs read access to public image files, hence the uploads directory's readable mode.

## 2. Upload and deploy without Git on the VPS

From Windows, use WSL for `rsync`. Replace `deploy` and `VPS_HOST` with your SSH username and VPS IP or hostname. Sync backend source while excluding Git metadata, dependencies, build output, uploads, and all env files. The remote `.env.prod` and host uploads folder stay out of the sync:

```sh
rsync -az --delete \
  --exclude='.git/' --exclude='node_modules/' --exclude='dist/' \
  --exclude='uploads/' --exclude='.env*' \
  /mnt/n/mamolej/e-commerce-backend/ \
  deploy@VPS_HOST:/srv/mamolej/app/
```

Build the Vite frontend locally with its production API URL, then upload the static build:

```sh
cd /mnt/n/mamolej/e-commerce
npm ci
VITE_API_URL=https://www.mamolej.cz/api npm run build
rsync -az --delete dist/ deploy@VPS_HOST:/srv/mamolej/frontend/dist/
```

Upload the secrets file separately from PowerShell, in the backend project directory:

```powershell
scp .env.prod deploy@VPS_HOST:/srv/mamolej/app/.env.prod
ssh deploy@VPS_HOST "chmod 600 /srv/mamolej/app/.env.prod"
```

If you do not use WSL, install `rsync` on Windows or package the backend source and frontend `dist` into archives and transfer them with `scp`. Exclude `node_modules`, `.git`, local `dist`, uploads, `.env`, and `.env.prod` from the backend archive. Always send `.env.prod` separately over SSH.

For a direct SCP upload from PowerShell, run this from the backend directory to send only the Docker build inputs and source:

```powershell
scp -r .\src .\docker .\deploy .\Dockerfile .\docker-compose.yml .\.dockerignore .\package.json .\package-lock.json .\nest-cli.json .\tsconfig.json .\tsconfig.build.json deploy@VPS_HOST:/srv/mamolej/app/
```

After building the frontend locally, upload its `dist` directory:

```powershell
Set-Location N:\mamolej\e-commerce
$env:VITE_API_URL = "https://www.mamolej.cz/api"
npm ci
npm run build
scp -r .\dist deploy@VPS_HOST:/srv/mamolej/frontend/
Remove-Item Env:VITE_API_URL
```

Install the Nginx site config after syncing the backend files:

```sh
sudo cp /srv/mamolej/app/deploy/nginx/default.conf /etc/nginx/sites-available/mamolej
sudo ln -s /etc/nginx/sites-available/mamolej /etc/nginx/sites-enabled/mamolej
sudo nginx -t
sudo systemctl reload nginx
```

Make sure DNS for `www.mamolej.cz` points to the VPS and TCP port 80 is reachable, then obtain TLS:

```sh
sudo certbot --nginx -d www.mamolej.cz --redirect
```

Certbot adds HTTPS and the HTTP-to-HTTPS redirect. Keep certificate renewal enabled and allow ports 80 and 443 in the VPS firewall. Nginx serves the frontend from `/srv/mamolej/frontend/dist`.

After each upload, run on the VPS:

```sh
cd /srv/mamolej/app
docker compose up -d --build
docker compose ps
docker compose logs -f api
```

Nginx serves the frontend from `/srv/mamolej/frontend/dist`, the API at `https://www.mamolej.cz/api/...`, and uploaded images at `/uploads/...`. Docker publishes the API only at `127.0.0.1:8080`; PostgreSQL has no published port. PostgreSQL data persists in the `mamolej_postgres_data` local Docker volume.

## 3. Back up

Back up both PostgreSQL and the host uploads directory. A database backup can be made with:

```sh
docker compose exec -T postgres pg_dump -U mamolej mamolej > backup.sql
```

If you changed `POSTGRES_USER` or `POSTGRES_DATABASE`, use those values instead. Protect database backups as sensitive data.

## Operational notes

- TypeORM schema synchronization is disabled. Ensure reviewed migrations exist and run successfully before deploying an empty database.
- PostgreSQL's Compose image initializes its data directory only on first startup. Changing `POSTGRES_USER`, `POSTGRES_PASSWORD`, or `POSTGRES_DATABASE` later does not update an existing database; update roles/database deliberately and keep backups.
- `deploy/nginx/default.conf` is the host Nginx site config. It proxies `/api/` to the loopback-only API port and serves `/uploads/` directly from the VPS directory.
