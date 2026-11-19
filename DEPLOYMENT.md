# VPS deployment

This setup builds the Mamolej NestJS API with Node.js 26.12.1 and PostgreSQL in Docker. Nginx runs directly on the VPS, proxies API requests to the loopback-only API port, and serves uploaded images from the VPS host.

## 1. Prepare the VPS

Install Docker Engine and the Docker Compose plugin. Clone this repository to a directory such as `/srv/mamolej/app` and create the persistent upload directory. The API container runs as the `node` user (UID/GID 1000), so grant it write access:

```sh
sudo mkdir -p /srv/mamolej/uploads
sudo chown 1000:1000 /srv/mamolej/uploads
sudo chmod 0755 /srv/mamolej/uploads
```

Copy `.env.example` to `.env`, then replace all sample credentials and URLs. Keep `.env` private (`chmod 600 .env`). Keep `UPLOADS_HOST_PATH` set to `/srv/mamolej/uploads` to match the Nginx `alias` path below. If you choose another uploads path, update both settings. `POSTGRES_HOST` must remain `postgres`, the Compose service name. Use a long random password for PostgreSQL and independent random values for both JWT secrets.

The app requires SMTP settings at startup. Fill in the values for your mail provider even if you are not testing email yet. Make sure `FRONTEND_PATH` matches the browser origin exactly, including the scheme. Host Nginx needs read access to the public image files, hence the uploads directory's readable mode.

Install Nginx and Certbot on the VPS. Install the site config and enable it:

```sh
sudo cp deploy/nginx/default.conf /etc/nginx/sites-available/mamolej
sudo ln -s /etc/nginx/sites-available/mamolej /etc/nginx/sites-enabled/mamolej
sudo nginx -t
sudo systemctl reload nginx
```

Make sure the `www.mamolej.cz` DNS record points to this VPS and TCP port 80 is reachable, then obtain and configure TLS:

```sh
sudo certbot --nginx -d www.mamolej.cz --redirect
```

Certbot adds the HTTPS listener and HTTP-to-HTTPS redirect. Keep its certificate renewal enabled and allow TCP ports 80 and 443 in the VPS firewall.

## 2. Start the stack

From the repository directory:

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f api
```

The API routes are reachable through host Nginx at `https://www.mamolej.cz/api/...`. Nginx serves uploaded files directly at `/uploads/...` from `UPLOADS_HOST_PATH`. Docker publishes the API only at `127.0.0.1:8080`; PostgreSQL has no published port and its data persists in the `postgres_data` Docker volume.

This stack does not contain the frontend: the Nginx site's `/` route returns 404 until the frontend is configured there or routed to its own upstream.

## 3. Update and back up

```sh
git pull
docker compose up -d --build
```

Back up both PostgreSQL and the host uploads directory. A database backup can be made with:

```sh
docker compose exec -T postgres pg_dump -U mamolej mamolej > backup.sql
```

If you changed `POSTGRES_USER` or `POSTGRES_DATABASE`, use those values instead. Protect database backups as sensitive data.

## Operational notes

- TypeORM is currently configured with `synchronize: true`. That lets a new empty database receive the entity schema automatically, but schema synchronization can alter production tables during deployment. Before evolving a live database, switch to reviewed TypeORM migrations and disable synchronization.
- PostgreSQL's Compose image initializes its data directory only on first startup. Changing `POSTGRES_USER`, `POSTGRES_PASSWORD`, or `POSTGRES_DATABASE` later does not update an existing database; update roles/database deliberately and keep backups.
- `deploy/nginx/default.conf` is the host Nginx site config. It proxies `/api/` to the loopback-only API port and serves `/uploads/` directly from the VPS directory.
