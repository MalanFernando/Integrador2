# ESTADO DEL PROYECTO — Hasta la Vuelta (Farrapp)

> **Última actualización:** 2026-08-06
> **Instrucción para agentes:** lee este archivo al inicio y continúa desde el "Punto final actual". No vuelvas a escanear el proyecto completo en cada sesión; actualiza este archivo cuando termines trabajo nuevo.

## Stack y estructura

- `api/` — NestJS 11 + TypeORM (PostgreSQL 15 / PostGIS). Puerto 3000, prefix global `/api/`.
- `frontend/` — App pública Next.js (puerto 3001).
- `frontend/admin/` — Panel de administración Next.js 16 (puerto 3002).
- `reportes/` — ASP.NET (sin tooling JS).
- Gestor de paquetes: **pnpm** (no npm/yarn).

## Punto final actual (todo lo verificado y completado)

### Panel admin (`frontend/admin/`)

- **UX/UI rework completo** (según feedback del usuario): crear/editar en **páginas propias con breadcrumbs** dentro de la sección (no modales); solo la **eliminación** usa modal de confirmación. Campos obligatorios marcados con `*`, errores inline por campo y bordes rojos que se limpian al corregir.
- **CRUDs implementados** con este patrón: **usuarios**, **organizaciones** y **eventos**.
  - Formularios compartidos en `_components/`: `usuario-form.tsx`, `organizacion-form.tsx`, `evento-form.tsx`.
  - Rutas: `/usuarios/nuevo` + `/usuarios/editar/[id]`, `/organizaciones/nuevo` + `/organizaciones/editar/[id]`, `/eventos/nuevo` + `/eventos/editar/[id]`.
  - Listados usan `<Link>` para "Nuevo …" y editar (icono lápiz).
- **Componentes/helpers reutilizables** (`src/components/ui/`, `src/lib/`): `breadcrumb.tsx` (con interfaz `Crumb`), `field.tsx` (label/required/optional/error), `select-field.tsx`, `form.ts` (`inputClasses(hasError)`), `api.ts` (base `http://localhost:3000/api`, envelope `{success,data,message}`, token JWT), `format.ts`, `utils.ts`.
- **Logotipo**: `frontend/admin/public/Logotype.svg` (copiado de `frontend/public/Logotype.svg`), usado en `admin-sidebar.tsx` y `login/page.tsx`.
- **Sidebar**: nav con `overflow-hidden` (sin scrollbar), logo del proyecto en lugar de icono MapPin + texto.
- **Rutas existentes**: `/` (redirect), `/dashboard`, `/login`, `/register`, `/usuarios`(+2), `/organizaciones`(+2), `/eventos`(+2), `/establecimientos`, `/resenas`, `/reportes`, `/configuracion` → **16 rutas, build ✓**.
- **Secciones sin tocar** (estáticas/mock, sin crear/editar):
  - `establecimientos` — listado real (API) + dropdown de cambio de estado, sin crear/editar.
  - `resenas` — mockup estático (datos hardcodeados).
  - `reportes` — placeholder "Próximamente".
  - `configuracion` — toggles estáticos, "Guardar cambios" deshabilitado.
- **Verificaciones**: typecheck ✓, lint ✓ (0 errores; 6 warnings preexistentes `@next/next/no-img-element`), build ✓ (16 rutas).

### API (`api/`)

- **CRUD admin de eventos**: `POST/PUT/DELETE /admin/eventos`, `GET /admin/eventos/:id`, `GET /admin/ubicaciones`, `PUT /admin/eventos/:id/aprobar`, `PUT /admin/eventos/:id/rechazar` (con motivo).
- **Detalle**: `GET /admin/usuarios/:id` (`detalleUsuario`, sin password), `GET /admin/organizaciones/:id` (`detalleOrganizacion`).
- `eventos.service.ts`: `adminCreate` (estado `aprobado`, omite `assertEditor`), `softDelete`, `detail`.
- `admin.service.ts`: `crearEvento`, `actualizarEvento`, `eliminarEvento`, `detalleEvento`, `listUbicaciones` (con ciudad/provincia), `detalleUsuario`, `detalleOrganizacion`, auditoría; `admin.module.ts` registra `Ubicacion`.
- **Verificaciones**: build ✓, lint ✓.

## Falta por hacer (pendiente)

1. Conectar secciones mock al backend (si el usuario lo pide):
   - **Reseñas** (`resenas`): moderación real (listar/ocultar/reportar) — hoy es mockup estático.
   - **Reportes** (`reportes`): generación/exportación — hoy es placeholder.
   - **Configuración** (`configuracion`): toggles persistidos — hoy es estático con guardar deshabilitado.
2. Aplicar a la app pública (`frontend/`) las mismas reglas de UX si aplica (breadcrumbs, `*` obligatorios, logotipo).
3. Nada más pendiente en el alcance actual del panel admin.

## Convenciones (mantener)

- Panel oscuro: bordes `border-white/10`, textos `#848484` (muted) / `#45B46A` (verde) / `#C04C4C` (rojo), títulos `font-clash`, stats grandes `text-[40px] font-medium`.
- **Sin emojis**: solo iconos `lucide-react`.
- Patrón de página `editar/[id]`: client component, carga vía `api.get`, breadcrumb, spinner `Loader2`, estado de error con `AlertCircle` + botón volver.
- Patrón de página `nuevo`: server component; formulario en `_components/<seccion>-form.tsx` con `validar()` → `Record<string,string>` y `setCampo()` que limpia el error al escribir.
- Backend admin: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`, soft-deletes con `deletedAt`/`deletedAt`, auditoría obligatoria.
- TypeScript nodenext: imports relativos con extensión `.js`; `bigint` → `string`.
- Credenciales admin seed: `admin@hastalavuelta.com` / `Admin.2026!`.

## Comandos

- `frontend/admin/`: `pnpm run typecheck` | `lint` | `build` | `dev` (3002).
- `api/`: `pnpm run build` | `lint` | `test` | `start:dev` (3000).
