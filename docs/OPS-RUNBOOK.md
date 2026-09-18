# Syscend-HRM Operations Runbook

Reference for provisioning, deploying, securing, and operating a client installation.

## 1. Requirements

- PHP 8.3+ (`php:8.3-fpm-alpine` is what the supplied Dockerfile uses; dev box uses PHP 8.5 for tooling).
- MySQL 8+ (5.7 not tested). Redis optional.
- Composer 2, Node 20+ for building the frontend.
- The repo layout for CI is `app/` as the Laravel application root (see `.github/workflows/ci.yml`).

## 2. Environment

Copy templates and fill values:

```
cp .env.example .env          # or cp .env.production .env  (live installs)
php artisan key:generate
```

Key variables:

| Variable | Purpose |
|---|---|
| `APP_ENV` / `APP_DEBUG` | `production` / `false` on live installs. `APP_DEBUG=true` leaks stack traces — never in client prod. |
| `APP_MODE` | `demo` or `live` (default `demo`). `EnsureMode` returns 404 when the mode doesn't match a route's requirement. |
| `APP_URL` | Canonical URL; also used for URLs in generated emails. |
| `DB_*` | MySQL credentials. Use a dedicated user, not `root`. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API. No wildcard in production. |
| `SANCTUM_STATEFUL_DOMAINS` | Your domain (+ `localhost,127.0.0.1` in dev) for SPA cookie/CSRF convenience. |
| `SANCTUM_TOKEN_EXPIRATION` | Token lifetime in minutes (default `1440`). |
| `MAIL_*` | SMTP driver, host, credentials, `MAIL_FROM_ADDRESS = hire@yourdomain.com`. |
| `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` | Used by `ProductionSeeder` for the initial admin (password must be >= 12 chars). |
| `TELESCOPE_ENABLED` | `false` in production (Telescope is dev-only). |
| `ERROR_WEBHOOK_URL` | Optional Slack/Teams/Discord webhook; production exceptions are posted there (see §6). |
| `SENTRY_LARAVEL_DSN` | Optional Sentry DSN (`sentry/sentry-laravel` is not installed — wire the package if you use it). |
| `APP_KEY` | Generate per install: `php artisan key:generate`. Never share across clients. |

## 3. Database

```
php artisan migrate --seed --class=ProductionSeeder   # roles, catalog, initial admin
```

`ProductionSeeder` seeds roles/permissions + the purchase catalog + one admin from
`ADMIN_EMAIL`/`ADMIN_INITIAL_PASSWORD`. It seeds **no demo data** — use `DatabaseSeeder`
(dev only) when you need sample data.

Cache warm after first deploy:
```
php artisan config:cache route:cache view:cache
```
Run once then re-run `php artisan optimize` on schedule (see §5).

## 4. Deploy (Docker)

From the app root:

```
cp .env.production .env          # then fill APP_KEY, DB_PASSWORD, DB_ROOT_PASSWORD
docker compose up -d --build
```

`DB_PASSWORD` and `DB_ROOT_PASSWORD` are mandatory — `docker compose` refuses to start
without them. Generate `APP_KEY` with `docker compose run --rm app php artisan key:generate --show`
or locally with `php artisan key:generate --show`, then paste it into `.env`.

Services:
- `mysql` — MySQL 8.4, named volume `mysql_data`.
- `app` — FPM runtime; installs composer deps (`--no-dev`) and builds assets at image build time.
  On boot it runs `migrate --force` then caches config/routes, then starts FPM.
- `worker` — same image running supervisord (`queue:work` + `schedule:work`).
- `nginx` — serves the built `public/` (shared `public_data` volume), port `8080:80`,
  `/build/*` immutable cache, security headers.

Only MySQL has a healthcheck; `app` and `worker` wait for it (`service_healthy`) before starting.
Named volumes: `mysql_data` (database), `storage_data` (logs/uploads), `public_data`
(built assets shared between `app` and `nginx`).

Scale the worker with `docker compose up -d --scale worker=N` if queue throughput grows.

First boot: create the admin/seed data (migrations already ran on the container start):
```
docker compose exec app php artisan db:seed --force --class=ProductionSeeder
```

## 5. Background jobs

Run the scheduler every minute — it only executes tasks in the `production` environment:

```
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

Scheduled tasks:
- `02:00` — `db:backup` — `mysqldump` of the configured DB; keeps the 7 most recent dumps (`--keep=N`).
- daily — `telescope:prune --hours=168` — rolling 7-day Telescope window.
- `03:30` — `session:gc` — expire stale DB sessions.
- Mon 04:00 — `optimize` — re-cache config/routes/views.

In Docker these run via supervisord (`schedule:work` + `queue:work`). Manual backup:
```
php artisan db:backup --keep=14
```
Uses `mysqldump` when available; if the binary is missing it transparently falls back to a
PHP/PDO dump (`SHOW CREATE TABLE` + chunked `INSERT`s) so backups never silently fail. The
PDO fallback does not include stored routines/triggers — install `mysqldump` (the Docker image
ships mariadb-client) if you rely on those.

## 6. Monitoring & alerting

- **Error webhook**: with `ERROR_WEBHOOK_URL` set, every production uncaught exception posts a
  JSON notification (404s, validation, authorization, and aborts are skipped). Works with
  Slack/Teams/Discord. If you prefer Sentry, install `sentry/sentry-laravel` and set `SENTRY_LARAVEL_DSN`.
- **Audit logs**: `admin/audit-logs` (API + UI) — admin actions are logged for clients.
- **Backups**: nightly `db:backup` (see §5). Test restores before needing them.

## 7. Security notes

- Login is rate-limited to 5/min per email+IP; the careers apply endpoint to 5/min per IP;
  general API to 300 req/min (authed) / 60 (anon).
- Disabled accounts (`users.is_active = 0`) cannot log in on any channel and are rejected from
  the API (`ApiRoleGate`).
- Tokens expire per `SANCTUM_TOKEN_EXPIRATION`; CORS origins are pinned to `CORS_ALLOWED_ORIGINS`.
- Rotate the admin password after every handover (Profile Settings) and never commit `.env`.

## 8. Client handover checklist

- [ ] `APP_ENV=production`, `APP_DEBUG=false`, unique `APP_KEY`.
- [ ] Admin password set via seeder env vars *and* changed interactively.
- [ ] SMTP verified (`php artisan tinker` → `Mail::raw('hi', fn($m)=>$m->to('you@x.com')->subject('t'));`).
- [ ] `CORS_ALLOWED_ORIGINS` set; TLS enforced at the reverse proxy.
- [ ] Scheduler running (cron or supervisord); `php artisan schedule:list` shows the 4 jobs.
- [ ] Nightly backup observed once (`db:backup`) and a restore tested.
- [ ] `ERROR_WEBHOOK_URL` (or Sentry) configured.
- [ ] Frontend built with production assets (`npm run build`), `public/hot` absent.
- [ ] `APP_MODE=live` for a live (non-demo) install.

## 9. Tests

```
C:\php85\php.exe vendor\bin\phpunit        # dev box
php artisan test                           # CI (sqlite :memory:)
./vendor/bin/pint                          # style fix; pint --test gates CI
cd app && npm run build && npx tsc --noEmit --ignoreDeprecations 6.0   # frontend
```

CI (GitHub Actions, `.github/workflows/ci.yml`): PHP 8.3 + sqlite test suite + Pint + frontend
`tsc` + `npm run build`. Intended home is a repo whose root contains the `app/` directory.

The suite covers auth (web + Sanctum), the API role gate, payroll calculation (fixed /
percentage_of_basic / percentage_of_gross, latest-assignment-wins, inactive exclusion, duplicate
guard), the leave balance lifecycle (apply → approve/reject/cancel, weekend/half-day math,
insufficient-balance guard), and the commerce money paths (server-side price snapshot for
one-time/yearly terms, license issuance with expiry, payment confirmation, invalid transitions),
plus the error webhook. Run it before every release.