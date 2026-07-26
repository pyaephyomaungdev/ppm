# PPM Portfolio

Monorepo: public portfolio (`apps/web`), admin CMS (`apps/admin`), API (`apps/api`) with Postgres + Redis.

## Stack

- **API:** Node.js, Hono, Drizzle, Argon2 sessions, Redis cache
- **Web / Admin:** React, TypeScript, Vite, Tailwind CSS v4
- **Data:** PostgreSQL (content), Redis (sessions + GitHub heatmap cache)

## Local setup

```bash
cp .env.example .env
# edit ADMIN_EMAIL / ADMIN_PASSWORD / GITHUB_TOKEN (optional)

npm install
npm run db:up
npm run db:migrate
npm run db:seed

# three terminals (or use your process manager):
npm run dev:api    # :8787
npm run dev:web    # :5173
npm run dev:admin  # :5174
```

- Portfolio: http://localhost:5173  
- Admin: http://localhost:5174  
- Health: http://localhost:8787/api/health  

Set `VITE_API_BASE=http://localhost:8787` in `.env` (or leave empty and proxy — by default clients call absolute paths on the Vite origin; for local, set `VITE_API_BASE` in each Vite app via env).

Create `apps/web/.env` and `apps/admin/.env`:

```
VITE_API_BASE=http://localhost:8787
```

## Content workflow

1. Log in to Admin with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
2. Fill **Profile**, **Stats**, **Projects**, **Experience** (company → roles), **Education**, **Honors**, **Licenses**
3. Public site reads `GET /api/public/portfolio`
4. Heatmap: `GET /api/public/github/contributions?year=2026` (needs `GITHUB_USERNAME` + `GITHUB_TOKEN`)

## Railway

1. Create project with **Postgres** and **Redis** plugins
2. One service from this repo:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm run start`
   - Root directory: repo root
3. Env vars:

| Key | Notes |
|-----|--------|
| `DATABASE_URL` | From Postgres plugin |
| `REDIS_URL` | From Redis plugin |
| `SESSION_SECRET` | Long random string |
| `COOKIE_SECURE` | `true` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin |
| `GITHUB_USERNAME` / `GITHUB_TOKEN` | Heatmap |
| `CORS_ORIGIN` | Your public URL(s) |
| `SITE_URL` | Public site URL |
| `NODE_ENV` | `production` |
| `PORT` | Railway injects |

Production build copies `web` + `admin` into `apps/api/public` so one service serves API + SPAs (`/` and `/admin/`).

After first deploy, run migrate/seed once (Railway release command or one-off):

```bash
npm run db:migrate -w @ppm/api
npm run db:seed -w @ppm/api
```

Or set Railway **Release Command** to those.

## Workspace layout

```
apps/api      Backend
apps/web      Public Cursor-style portfolio
apps/admin    Email/password CMS
packages/shared  Zod schemas
```
