# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start here

**Read `ESTADO.md` first, every session.** It records the current end-state, what was just finished, and the backlog. Update it when you finish work — don't re-scan the whole project from scratch each time.

Spec hierarchy (source of truth, in order): `ESPECIFICACION_FUNCIONAL.md` (business rules, API, DB, auth) > `ESPECIFICACION_FRONTEND.md` (design system, screens, responsive) > `UI-especificaciones/*.md` (visual reference annexes) > code. On conflict, spec wins over code; screenshots win over text.

## Project shape

"Hasta la Vuelta" — an events/social discovery platform (Quito, Ecuador), three independently deployed apps sharing one Postgres database:

- `api/` — NestJS 11 + TypeORM, Postgres 15/PostGIS. Port 3000, global prefix `/api/`. Swagger at `/api/docs` (dev only).
- `frontend/` — public Next.js 16 app (React 19) for end users. Port 3001. Also hosts the **organizador** (organizer) domain under the `host/[slug]` route group — same app, different route tree, no separate deploy.
- `frontend/admin/` — admin panel, Next.js 16. Port 3002. Superadmin only (`rol = 'admin'`).
- `reportes/` — ASP.NET (C#) service for PDF/Excel/QR report generation. No JS tooling; not part of the pnpm workspace.

Three navigation domains are separated **entirely by URL**, not by a runtime flag: usuario (`frontend/`), organizador (`frontend/host/[slug]`), admin (`frontend/admin/`). Switching between usuario and organizador means opening `/host/[slug]` in another tab. `perfilActivo` (`'usuario' | 'organizador'`) tracks which mode a user is in and is persisted in the DB (`usuarios.perfil_activo`), not localStorage — read it from `user.perfilActivo` after `/auth/me` or login.

## Commands

```bash
# API (from api/)
pnpm run build          # typecheck + compile (nest build)
pnpm run lint            # eslint --fix
pnpm run start:dev       # dev server on :3000
pnpm test                # jest (rootDir src, *.spec.ts) — currently no spec files exist
pnpm run seed             # creates admin@hastalavuelta.com / Admin.2026!
pnpm run seed:demo        # demo usuario + organizador accounts

# Frontend public (from frontend/)
pnpm run typecheck && pnpm run lint && pnpm run build
pnpm run dev              # :3001

# Admin panel (from frontend/admin/)
pnpm run typecheck && pnpm run lint && pnpm run build
pnpm run dev              # :3002
```

Always **pnpm**, never npm/yarn, in any of the three packages. Only LTS/2026-current major versions (NestJS 11, Next.js 16, React 19, Node LTS) — check `pnpm outdated` before adding or bumping a dependency.

## Backend architecture (`api/`)

Modular NestJS structure under `api/src/`, one directory per domain (`auth`, `usuarios`, `eventos`, `reservas`, `resenas`, `social`, `favoritos`, `categorias`, `geo`, `organizaciones`, `admin`, `auditoria`, `planes`, `reportes`, `reportes-reservas`, `preferencias`, `tareas`, `upload`, `scraping`), each with its own `dto/` and `entities/`. All entities are registered centrally in `app.module.ts` — a new entity must be added there for TypeORM to see it.

- **Schema is not TypeORM-managed**: `synchronize: false`. `schema.sql` at the repo root is the single source of truth for the DB; any schema change is a manual SQL edit there (and a real migration against the running DB), never an entity-driven auto-sync.
- Enums live in Postgres via `CREATE TYPE ... AS ENUM` in `schema.sql`, mirrored in `api/src/common/enums.ts`.
- `updated_at` triggers exist in the DB on `usuarios`, `miembros_organizacion`, `eventos`, `reservas`, `resenas` — never set `updated_at` manually in code.
- DB-enforced business rules (Postgres triggers/constraints, not just app-level validation): max 5 active eventos per organizador, max 2 active miembros per organizador, `fecha_fin > fecha_inicio`, no self-follow, review puntuacion 1–5.
- There is no `organizaciones` table and no `establecimientos` table. An "organizador" is just a `usuarios` row with `rol = 'organizador'`; `miembros_organizacion` links additional users to an organizador with limited roles (`editor`/`moderador`).
- `eventos.localidades` and `eventos.usuarios_cartelera` are JSONB (not normalized child tables) — max 4 localidades, max 5 artistas in cartelera.
- `reservas` are the "tickets" concept in the product (UI says "ticket", DB/code still says `reserva`/`codigo_ticket`/`qr_payload`).
- Relative imports **must** use the `.js` extension — `tsconfig` is `nodenext`/`nodenext`, so `import { X } from './x.js'` is required even though the source file is `x.ts`.
- `bigint` DB columns are surfaced as `string` in TypeORM/JS, not `number`.
- `@nestjs/jwt` v11: `signOptions.expiresIn` must be a plain **number** of seconds, not a string like `'1h'`.
- Global request pipeline (`main.ts`): `helmet`, CORS restricted to `FRONTEND_URL`/`ADMIN_FRONTEND_URL`, global `ValidationPipe` (whitelist + forbidNonWhitelisted + transform), global exception filter + response transform interceptor + security logging interceptor, `ThrottlerModule` at 60 req/60s. Standard success envelope is `{ success, data, message }`; errors are `{ success: false, statusCode, message, timestamp }`.
- Auth: JWT bearer (`passport-jwt`), plus Google OAuth. Registration is OTP-based — 6-digit code, bcrypt-hashed, 15 min TTL, max 3 resends (60s cooldown), max 5 verify attempts; account stays `estado = 'pendiente'` (cannot log in) until verified. Google OAuth registration skips OTP.
- Seed scripts are plain `.cjs` (not TS) under `api/scripts/`, run directly with `node`.

## Frontend architecture (`frontend/` and `frontend/admin/`)

Next.js App Router in both apps. `frontend/src/app/(usuario)/...` is the usuario domain route group (eventos, explorar, favoritos, mapa, mis-reservas, perfil, login/register, etc.); `frontend/src/app/host/[slug]/...` is the organizador domain sharing the same deploy. `frontend/admin/src/app/(panel)/...` holds the admin screens (categorias, eventos, organizadores, reportes, resenas, tickets, usuarios, dashboard).

- Both apps talk to the same backend via `src/lib/api.ts`; auth/session state lives in `src/lib/auth-context.tsx` in each app (a React context wrapping the JWT + current user, including `perfilActivo`/`slug` from `/auth/me`).
- Styling: Tailwind. No emoji anywhere in UI — icons only via `lucide-react`.
- Entities and most identifiers throughout the stack (DB columns, API routes, DTOs) are Spanish (`usuarios`, `eventos`, `reservas`), matching the domain language — keep new code consistent with that rather than translating to English.
- Admin lists render as `<ol>`/`<ul>`, not `<table>`, per the design spec.
- There are no filler/stock images checked in (`frontend/public/images/` was deliberately emptied) — event cards without a real image use `EventImagePlaceholder` (initials + solid color by category) rather than a placeholder photo.

## Known gaps (see `ESPECIFICACION_FUNCIONAL.md` §8 / `ESTADO.md` for the current list)

Several features are spec'd but intentionally unimplemented as of the last session: miembros CRUD endpoints, reseñas moderation actions in `/host/[slug]`, organizer's own configuracion form, per-event attendee list, OSRM route detail on the map, real Cloudinary upload. Don't assume an endpoint exists just because the frontend spec describes the screen — check `api/src/*/*.controller.ts` first.
