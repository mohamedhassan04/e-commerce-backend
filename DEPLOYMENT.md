# VPS deployment

This setup builds the Mamolej NestJS API with Node.js 26.3 on port 8080, runs PostgreSQL and Nginx in Docker, and stores uploaded images on the VPS host.

## 1. Prepare the VPS

Install Docker Engine and the Docker Compose plugin. Clone this repository to a directory such as `/srv/mamolej/app` and create the persistent upload directory. The API container runs as the `node` user (UID/GID 1000), so grant it write access:

```sh
sudo mkdir -p /srv/mamolej/uploads
sudo chown 1000:1000 /srv/mamolej/uploads
sudo chmod 0750 /srv/mamolej/uploads
```

Copy `.env.example` to `.env`, then replace all sample credentials and URLs. Keep `.env` private (`chmod 600 .env`). Set `UPLOADS_HOST_PATH` to the absolute VPS path created above. `POSTGRES_HOST` must remain `postgres`, the Compose service name. Use a long random password for PostgreSQL and independent random values for both JWT secrets.

The app requires SMTP settings at startup. Fill in the values for your mail provider even if you are not testing email yet. Make sure `FRONTEND_PATH` matches the browser origin exactly, including the scheme.

## 2. Start the stack

From the repository directory:

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f api nginx
```

The API is reachable through Nginx on port 80. PostgreSQL is only available on the private Compose network and its data persists in the `postgres_data` Docker volume. Uploaded files persist at `UPLOADS_HOST_PATH` and Nginx serves them directly at `/uploads/...`.

Point the `www.mamolej.cz` DNS record to the VPS. The API routes use `https://www.mamolej.cz/api/...`; `/uploads/...` serves uploaded images from the persistent VPS folder. This stack does not contain the frontend: other paths return 404 unless your frontend's web server handles them. Open TCP ports 80 and 443 in the VPS firewall and add HTTPS before serving real traffic. One simple arrangement is to terminate TLS with the VPS host's Nginx/Caddy and proxy `/api/` and `/uploads/` to the Docker Nginx while serving the frontend at `/`. If using host Nginx, change the Compose Nginx port mapping from `80:80` to `127.0.0.1:8081:80`, then proxy those paths to port 8081 and forward the original `Host`, `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto` headers. The API listens on port 8080 inside Docker and remains unpublished to the host; PostgreSQL is also unpublished.

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
- The included Nginx config provides HTTP reverse proxying and direct static image delivery. Configure HTTPS at a trusted TLS terminator before exposing the application to real users.
