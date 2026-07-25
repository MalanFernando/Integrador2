# AGENTS.md — Hasta la Vuelta (Farrapp)

## Project layout

```
hastaLaVuelta/
├── schema.sql          # PostgreSQL + PostGIS schema (source of truth for DB)
├── README.md           # Full architecture & ERD documentation
├── api/                # NestJS 11 backend (all commands run from here)
│   ├── src/
│   │   ├── main.ts              # Bootstrap, global prefix /api, CORS
│   │   ├── app.module.ts        # TypeORM + ConfigModule + feature modules
│   │   ├── config/configuration.ts
│   │   ├── auth/                # Auth module (register, login, JWT)
│   │   ├── usuarios/            # Usuarios module (entity, service, controller)
│   │   └── common/              # Global filter + interceptor
│   ├── .env                     # DB + JWT config (not committed)
│   └── dist/                    # Build output
```

## Commands

All commands must be run from `api/`:

```bash
npm run build          # Type-check + compile (use this to verify changes)
npm run start:dev      # Dev server with watch
npm run lint           # ESLint + Prettier fix
npm run test           # Jest unit tests
npm run test:e2e       # Jest e2e tests
```

Verify with: `npm run build` — no other typecheck command exists.

## TypeScript quirks (NestJS 11)

- **Module resolution is `nodenext`**, not `node`. All relative imports MUST use `.js` extensions:
  ```ts
  import { AuthService } from './auth.service.js';  // correct
  import { AuthService } from './auth.service';      // WRONG — will fail to compile
  ```
- `bigint` columns map to `string` in TypeORM/JS (e.g., `usuario.id` is `string`, not `number`).
- `@nestjs/jwt` v11 uses branded `StringValue` for `expiresIn`. Pass a number (seconds) instead of a string:
  ```ts
  signOptions: { expiresIn: 86400 }  // correct
  signOptions: { expiresIn: '24h' }  // TS error
  ```

## Database

- **Schema source of truth:** `schema.sql` at repo root. Run it against PostgreSQL 15+ with PostGIS extension.
- `synchronize: false` in TypeORM config — schema changes go through `schema.sql`, not auto-sync.
- Enums are PostgreSQL `CREATE TYPE` — not inline in table definitions. When adding new enum columns, add the TYPE first.
- Triggers handle `updated_at` automatically on 8 tables. Do NOT set `updatedAt` manually.
- Trigger `check_max_establecimientos` enforces max 3 active establishments per org at DB level.

## API conventions

- Global prefix: all routes are under `/api/` (set in `main.ts`).
- `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` — unknown properties in DTOs are stripped/rejected.
- All responses wrapped by `TransformInterceptor` → `{ success: true, data, message }`.
- Errors wrapped by `HttpExceptionFilter` → `{ success: false, statusCode, message, timestamp }`.
- Auth: `POST /api/auth/register` and `POST /api/auth/login` return `{ access_token, user }`.
- Protected routes use `@UseGuards(JwtAuthGuard)`. Role-based: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`.
- Entity names in schema use Spanish: `usuarios`, `organizaciones`, `eventos`, etc. Keep consistent.

## Entity registration

New TypeORM entities must be added to the `entities` array in `app.module.ts` TypeORM config, or use `forFeature()` in their module and register via `TypeOrmModule.forFeature([...])`.

## Environment

Copy `.env.example` → `.env` (or create manually). Required vars:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `JWT_SECRET` (change before production)
- `PORT` (default 3000)
- `FRONTEND_URL` (CORS origin, default `http://localhost:3001`)
