# AWS EC2 deployment

## 1. Install Node.js

Use Node.js 22.5 or newer on the EC2 instance (uses the built-in `node:sqlite` module, no native compilation needed), then copy this directory to the server.

```bash
npm install
cp .env.example .env
nano .env
npm start
```

Set `JWT_SECRET` to a long random value. The SQLite database is created at `data/app.db`; keep this directory on persistent storage and back it up.

## 2. Keep the service running

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Open TCP port 3000 in the EC2 security group, or put Nginx/HTTPS in front of the app and expose only ports 80/443.

## 3. Verify

```bash
curl http://127.0.0.1:3000/api/health
```

Expected response: `{"ok":true}`.

## 4. Security checklist

- **HTTPS**: set `FORCE_HTTPS=1` in `.env` and terminate TLS with Nginx/Caddy in front of the app (recommended), or use an ALB/ACM. Never expose plain HTTP on port 3000 to the public internet.
- **Secret**: `JWT_SECRET` must be a random string >=16 chars. In `NODE_ENV=production` the app refuses to start without it.
- **Dependency audit**: run `npm audit` after every `npm install`. Fix or document any high/CVSS>=7 vulnerability before deploy.
- **Rate limiting**: auth endpoints are rate limited (20 req/min/IP) and login is locked after 5 failures for 15 min (in-memory; resets on restart).
- **Token revocation**: logout revokes the token; changing password invalidates all old tokens immediately.
- **Sensitive files**: `server.js`, `package*.json`, `.env*`, `start-server.*`, `*.bak`, `data/`, `node_modules/`, `.git/` are blocked from static serving.

## 5. Backup & restore

SQLite database lives at `data/app.db`. On the Windows dev machine use the provided scripts; on EC2 use `sqlite3` or file copy after `pm2 stop`.

```bash
# EC2: stop, copy db + WAL/SHM, restart
pm2 stop cet-learning-site
cp data/app.db backups/app-$(date +%Y%m%d-%H%M%S).db
pm2 start cet-learning-site
```

Verify a restore at least once (see `backup.ps1` / `restore.ps1` on Windows). Audit logs are written to `data/audit.log` (JSON lines, no passwords).

## 6. Privacy (PIPL)

- Minimal collection: only username + password hash are stored; no phone/email.
- Registration requires explicit consent checkbox.
- Audit log records register/login/logout/password-change events with timestamp, IP and username (no secrets).
