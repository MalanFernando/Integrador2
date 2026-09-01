# AGENTS.md — Hasta la Vuelta

## Estado del proyecto

**Read `ESTADO.md` (repo root) first** — it holds the current state ("Punto final actual"), what's done, and what's pending. Start work from there and update it when you finish something. Do **not** rescan the whole project each session.

## Package manager

**pnpm is the only package manager** across the project: `api/`, `frontend/` and `frontend/admin/` all use `pnpm` (`pnpm-lock.yaml` + `pnpm-workspace.yaml` each). Do **not** use npm/yarn in these folders. `reportes/` is ASP.NET (no JS tooling).

## Commands (run from `api/`)

`pnpm run build` — type-check + compile (primary verification; no separate typecheck command)
`pnpm run format` — Prettier on `src/` and `test/`
`pnpm run lint` — ESLint + Prettier fix (config: `eslint.config.mjs`)
`pnpm run test` — Jest unit tests (`*.spec.ts` under `src/`)
`pnpm run test:e2e` — Jest e2e tests (config: `test/jest-e2e.json`)
`pnpm run start:dev` — dev server with watch
`pnpm run seed` — runs `scripts/seed.cjs` (admin seed: `admin@hastalavuelta.com` / `Admin.2026!`)

Swagger docs available at `http://localhost:3000/api/docs`.

## Commands (run from `frontend/admin/`)

`pnpm run typecheck` — TypeScript check (`tsc --noEmit`)
`pnpm run lint` — ESLint (config: eslint.config.mjs; `@next/next/no-img-element` warnings preexistentes, no errores)
`pnpm run build` — Next.js build (compila + typecheck)
`pnpm run dev` — dev server on port 3002

## TypeScript quirks (nodenext + NestJS 11)

- Relative imports **must** use `.js` extension: `import { X } from './x.js'` (not `'./x'`)
- `noImplicitAny: false` — you *can* omit types; don't rely on it
- `bigint` columns → `string` in TypeORM/JS (e.g. `usuario.id` is `string`, not `number`)
- `@nestjs/jwt` v11: `signOptions.expiresIn` must be a **number** (seconds): `{ expiresIn: 86400 }` ✅

## Database

- **Schema source of truth:** `schema.sql` at repo root (PostgreSQL 15+ / PostGIS)
- `synchronize: false` — schema changes go through `schema.sql` only
- Enums are `CREATE TYPE` — add the TYPE before referencing in column definitions
- `updated_at` triggers on 5 tables (usuarios, miembros_organizacion, eventos, reservas, resenas) — do **not** set manually
- Trigger `check_max_eventos_organizador` enforces max 5 active events per organizer
- Trigger `check_max_miembros` enforces max 2 active members per organizer
- **No `organizaciones` table** — organizers are users with `rol = 'organizador'`
- **No `establecimientos` table** — removed from schema
- **`eventos.localidades`** and **`eventos.usuarios_cartelera`** are JSONB columns (not separate tables)
- **`reservas.localidad_nombre`** is a VARCHAR (not a FK to a localidades table)

## API conventions

- Global prefix: `/api/` (set in `main.ts`)
- `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- Success responses wrapped by global `TransformInterceptor` → `{ success: true, data, message: 'OK' }`
- Errors wrapped by global `HttpExceptionFilter` → `{ success: false, statusCode, message, timestamp }`
- Auth: `POST /api/auth/register` and `POST /api/auth/login` return `{ access_token, user }` (inside `data` above)
- Guard: `@UseGuards(JwtAuthGuard)` for auth; `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')` for RBAC
- Roles: `admin`, `organizador`, `artista`, `usuario`
- Entity names are Spanish: `usuarios`, `eventos`, `reservas`, etc.

## Entity registration

New TypeORM entities: register via `TypeOrmModule.forFeature([EntityClass])` in their feature module.

## Environment

File: `api/.env` (already exists, no `.env.example`). Variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRATION` (default `24h`; **note:** `auth.module.ts` hardcodes `expiresIn: 86400` and ignores this — if you change it here, update the code too)
- `PORT` (default 3000)
- `FRONTEND_URL` (CORS origin, default `http://localhost:3001`)
- `ADMIN_FRONTEND_URL` (CORS origin, default `http://localhost:3002`)
