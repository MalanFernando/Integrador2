# AGENTS.md — Hasta la Vuelta

## Estado del proyecto

**Read `ESTADO.md` first.** Start work from there and update it when you finish.

## Reglas obligatorias

- **pnpm only** (`api/`, `frontend/`, `frontend/admin/`). Never npm/yarn.
- **Solo versiones LTS / 2026** (NestJS 11, Next.js 16, React 19, Node LTS). Verificar con `pnpm outdated` antes de instalar.
- **Schema source of truth:** `schema.sql`. `synchronize: false` — changes only via SQL.
- Relative imports **must** use `.js` extension (nodenext).
- `bigint` → `string` in TypeORM/JS.
- `@nestjs/jwt` v11: `signOptions.expiresIn` must be a **number** (seconds).
- No emojis in UI — only `lucide-react`.
- **Español neutro:** comunicar y documentar con la forma "tú" (nada de voseo rioplatense), vocabulario estándar sin regionalismos ni lunfardo.

## Specs

- **Funcional:** `ESPECIFICACION_FUNCIONAL.md` (~400 líneas) — reglas de negocio, API, BD, auth.
- **Frontend:** `ESPECIFICACION_FRONTEND.md` (~300 líneas) — sistema de diseño, pantallas, responsive.
- **Referencias visuales:** `UI-especificaciones/*.md` (5 anexos).
- Ante conflicto: spec > código; capturas > texto.

## Comandos

```bash
# API
cd api && pnpm run build && pnpm run lint && pnpm run seed:demo

# Frontend
cd frontend && pnpm run typecheck && pnpm run lint && pnpm run build

# Admin
cd frontend/admin && pnpm run typecheck && pnpm run lint && pnpm run build
```

Swagger: http://localhost:3000/api/docs

## Seed

- Admin: `admin@hastalavuelta.com` / `Admin.2026!`
- Demo: `camila.pazmino@demo.com` / `Demo.2026!` (usuario)
- Demo: `valentina@lunacultura.com` / `Demo.2026!` (organizador)

## DB

- Enums via `CREATE TYPE` in `schema.sql`.
- `updated_at` triggers on 5 tables — do NOT set manually.
- `check_max_eventos_organizador` (5) and `check_max_miembros` (2) enforced in DB.
- No `organizaciones` table — organizers are users with `rol = 'organizador'`.
- No `establecimientos` table.
- `eventos.localidades` and `eventos.usuarios_cartelera` are JSONB.
- `reservas.localidad_nombre` is VARCHAR.
