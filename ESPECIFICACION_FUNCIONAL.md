# ESPECIFICACIÓN FUNCIONAL — Hasta la Vuelta

> Documento fuente para desarrollo. Fuente de verdad en funcionalidad (reglas de negocio, API, base de datos).
> Complemento UI/visual: `ESPECIFICACION_FRONTEND.md`. Referencias visuales detalladas: `UI-especificaciones/*.md`.
> Última actualización: 2026-09-06 · Consolidado de `ESPECIFICACION_FUNCIONAL.md` + `INSTRUCCIONES_OPENCODE_FUNCIONALIDAD_SEED.md`.

---

## 1. Dominios y separación de perfiles

**Tres dominios de navegación (modelo Buenplan):**

| Dominio | App | Puerto | Usuarios |
|---|---|---|---|
| **Usuario** | `frontend/` (Next.js) | 3001 | Invitados y usuarios |
| **Organizador** | `frontend/` — route group `host/[slug]` (otra pestaña) | 3001 | Organizadores y miembros |
| **Admin** | `frontend/admin/` | 3002 | Superadmin (`rol = 'admin'`) |

Backend: `api/` (NestJS 11 + TypeORM + PostgreSQL 15/PostGIS, puerto 3000, prefix `/api/`).
Reportes: `reportes/` (ASP.NET, genera PDF/Excel/QR).

**Separación 100% por URL:** cada dominio vive en su propia pestaña. El cambio usuario ↔ organizador = abrir `/host/[slug]` en otra pestaña.

**Roles:** `admin` · `organizador` · `usuario`. `perfilActivo` indica el modo activo del usuario (`'usuario'` | `'organizador'`) y se persiste en la BD.

---

## 2. Glosario

| Término | Significado |
|---|---|
| **usuario** | Rol normal. Nunca "usuario común". |
| **perfilActivo** | Modo de navegación del usuario: `'usuario'` (dominio `/`) o `'organizador'` (`/host/[slug]`). Se persiste en BD. |
| **ticket** | Antiguamente "reserva/reservación". |
| **organizador** | Usuario con `rol = 'organizador'`. No existe tabla `organizaciones`. |
| **miembro** | Usuario con permisos limitados sobre eventos de un organizador (`editor` o `moderador`). |
| **slug** | Dominio público del organizador: `/host/<slug>`. Editable. |

---

## 3. Modelo de datos (fuente: `schema.sql`)

### 3.1 Tablas principales

| Tabla | Notas |
|---|---|
| `usuarios` | `id` (cuid2), `email`, `password_hash`, `nombre`, `apellido`, `telefono`, `cedula`, `rol` (enum), `estado` (enum), `perfil_activo` (enum, default `'usuario'`), `slug` (varchar único), `foto_perfil_url`, `portada_url`, `bio`, `redes_sociales` (jsonb), `etiqueta`, `preferencias_usuario` (jsonb), `deleted_at`, `fecha_eliminacion` |
| `eventos` | `id`, `organizador_id` → `usuarios(id)`, `categoria_id` → `categorias(id)`, `ubicacion_id` → `ubicaciones(id)`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `aforo`, `estado_evento` (enum), `visibilidad` (enum), `online` (bool), `link_online`, `imagenes` (jsonb), `localidades` (jsonb), `usuarios_cartelera` (jsonb), `informacion_pago` (jsonb), `preguntas_frecuentes` (jsonb), `etiquetas` (jsonb), `restriccion_acceso`, `es_destacado` |
| `reservas` (→ tickets) | `id`, `evento_id`, `usuario_id`, `localidad_nombre` (varchar), `cantidad_tickets`, `codigo_ticket`, `qr_payload`, `estado_ticket` (enum), `datos_comprador` (jsonb), `verificado_por`, `motivo_intervencion`, `fecha_verificacion` |
| `resenas` | `id`, `evento_id`, `autor_id` → `usuarios(id)`, `puntuacion` (1–5), `comentario`, `estado_resena` (enum) |
| `seguidores` | `seguidor_id` → `usuarios`, `seguido_id` → `usuarios`, `creado_en`. Constraint: no auto-seguir. |
| `favoritos` | `usuario_id`, `evento_id` |
| `categorias` | `id`, `nombre`, `icono`, `color`, `descripcion` |
| `ubicaciones` | `id`, `nombre`, `direccion`, `ciudad`, `lat`, `lng`, `created_at` |
| `email_verification_codes` | `id`, `usuario_id`, `codigo_hash` (bcrypt), `expires_at`, `intentos` (default 0), `created_at` |
| `miembros_organizacion` | `id`, `organizador_id` → `usuarios`, `usuario_id`, `rol` (enum: editor/moderador), `estado` (enum) |
| `bitacora_auditoria` | `id`, `usuario_id`, `accion`, `descripcion`, `created_at` |
| `event_visitas` | `evento_id`, `fecha`, `vistas` |

### 3.2 Enums

```sql
CREATE TYPE estado_usuario_enum AS ENUM ('pendiente', 'activo', 'inactivo', 'suspendido');
CREATE TYPE rol_enum AS ENUM ('admin', 'organizador', 'usuario');
CREATE TYPE estado_evento_enum AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado', 'cancelado', 'finalizado');
CREATE TYPE estado_ticket_enum AS ENUM ('confirmada', 'verificada', 'cancelada', 'invalidada', 'reportada');
CREATE TYPE estado_resena_enum AS ENUM ('visible', 'reportada', 'oculta');
CREATE TYPE estado_miembro_enum AS ENUM ('pendiente', 'activo', 'inactivo');
CREATE TYPE visibilidad_enum AS ENUM ('publico', 'privado');
CREATE TYPE rol_miembro_enum AS ENUM ('editor', 'moderador');
CREATE TYPE perfil_activo_enum AS ENUM ('usuario', 'organizador');
```

### 3.3 Triggers

- `updated_at` auto en: `usuarios`, `miembros_organizacion`, `eventos`, `reservas`, `resenas`
- `check_max_eventos_organizador`: máx. 5 eventos activos por organizador
- `check_max_miembros`: máx. 2 miembros activos por organizador
- `ck_fechas_validas`: `fecha_fin > fecha_inicio`
- `ck_no_auto_seguir`: un usuario no puede seguirse a sí mismo
- `ck_puntuacion_resena`: `puntuacion BETWEEN 1 AND 5`

---

## 4. Auth

### 4.1 Registro (OTP de 6 dígitos)

```
POST /api/auth/register (nombre, email, password)
   → estado = 'pendiente', rol = 'usuario'
   → email con código de 6 dígitos (TTL 15 min)
   → POST /api/auth/verify-email { email, codigo } → estado = 'activo' + auto-login
```

- El código se hashea con bcrypt (nunca en texto plano).
- TTL: 15 min. Reenvíos: máx. 3 (cooldown 60s). Intentos: máx. 5.
- Google OAuth exento de OTP.

### 4.2 Login

`POST /api/auth/login { email, password }` → `{ access_token, user: { id, email, nombre, rol, perfilActivo, slug } }`

- Cuenta `pendiente` → error → frontend redirige a `/verificar-correo`.
- Google OAuth: `POST /api/auth/google { token }`.

### 4.3 Endpoints

| Método | Ruta | Notas |
|---|---|---|
| POST | `/api/auth/register` | Crea cuenta pendiente, envía código |
| POST | `/api/auth/verify-email` | Verifica código, auto-login |
| POST | `/api/auth/re-send-code` | Reenvía código (cooldown 60s, máx 3) |
| POST | `/api/auth/login` | Login con credenciales |
| POST | `/api/auth/google` | OAuth Google, auto-registra |
| POST | `/api/auth/forgot-password` | Envía token de reseteo |
| POST | `/api/auth/reset-password` | Resetea contraseña |
| GET | `/api/auth/me` | Devuelve usuario completo (incluye `perfilActivo`) |

### 4.4 Cambiar perfil (usuario ↔ organizador)

`PUT /api/usuarios/cambiar-perfil { perfilActivo: 'organizador' | 'usuario' }`

- Valida que el usuario tenga `rol = 'organizador'` para cambiar a `'organizador'`.
- **Persiste en BD** (`perfil_activo` column).
- Devuelve `{ perfilActivo, rol, slug }`.

---

## 5. API endpoints (catálogo completo)

### Eventos

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| GET | `/api/eventos` | — | Búsqueda con filtros (ver §5.1) |
| GET | `/api/eventos/:id` | — | Detalle |
| POST | `/api/eventos` | Organizador | Crea evento (pendiente por defecto) |
| PUT | `/api/eventos/:id` | Organizador/Miembro | Edita |
| DELETE | `/api/eventos/:id` | Organizador | Eliminación lógica |

### Reservas (Tickets)

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| GET | `/api/reservas/mis-tickets` | Usuario | Tickets del usuario logueado |
| POST | `/api/reservas` | Usuario | Crea reserva (genera código + QR) |
| DELETE | `/api/reservas/:id` | Usuario/Admin | Cancela |
| PUT | `/api/reservas/:id/reportar` | Usuario | Reporta con motivo |

### Reseñas

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| GET | `/api/resenas/evento/:eventoId` | — | Reseñas de un evento |
| POST | `/api/resenas` | Usuario | Crea reseña (1 por usuario/evento) |

### Social

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| POST | `/api/social/seguir/:usuarioId` | Usuario | Seguir |
| DELETE | `/api/social/seguir/:usuarioId` | Usuario | Dejar de seguir |
| GET | `/api/social/seguidores/:usuarioId` | — | Followers |
| GET | `/api/social/siguiendo/:usuarioId` | — | Following |

### Usuarios

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| GET | `/api/usuarios/profile/:id` | — | Perfil público |
| PUT | `/api/usuarios/me` | Usuario | Editar perfil propio |
| PUT | `/api/usuarios/cambiar-perfil` | Usuario | Cambiar perfilActivo |
| POST | `/api/usuarios/habilitar-organizador` | Usuario | Habilita como organizador |

### Categorías

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| GET | `/api/categorias` | — | Lista todas |

### 5.1 Búsqueda de eventos — `GET /api/eventos`

**Query params:**

| Parámetro | Tipo | Notas |
|---|---|---|
| `q` | string | Búsqueda ILIKE (nombre, descripción) |
| `categoriaId` | string | Filtrar por categoría |
| `estado` | string | Valor por defecto: `aprobado` |
| `fechaDesde` | date | |
| `fechaHasta` | date | |
| `precioMin` | number | >= precio mínimo de localidad |
| `precioMax` | number | <= precio máximo de localidad |
| `gratis` | boolean | `true` = precioMin=0 |
| `lat` | number | Latitud para radio |
| `lng` | number | Longitud para radio |
| `radioKm` | number | Radio en km (default 5) |
| `sort` | string | `nombre_asc`, `nombre_desc`, `fecha_asc`, `fecha_desc` |
| `page` | number | Default 1 |
| `limit` | number | Default 20 |

> **Bug crítico (G3):** `precioMin=0` se trata como falsy y se ignora. Fix: `params.precioMin !== undefined && params.precioMin !== ''`.

---

## 6. Reglas de negocio

| # | Regla |
|---|---|
| R1 | No crear tickets a nombre de usuarios (excepción: fallo de sistema documentado). |
| R2 | No modificar arbitrariamente la cantidad de tickets. |
| R3 | No marcar tickets como verificados sin justificación (`motivo_intervencion` obligatorio). |
| R4 | No administrar entrada de asistentes como actividad cotidiana. |
| R5 | Máx. 5 eventos activos por organizador (trigger `check_max_eventos_organizador`). |
| R6 | Máx. 2 miembros activos por organizador (trigger `check_max_miembros`). |
| R7 | Máx. 5 artistas en cartelera, máx. 4 localidades por evento. |
| R8 | Todo evento nuevo pasa a `pendiente` (revisión admin). |
| R9 | Las localidades se muestran solo si el evento es pagado y tiene `informacion_pago` completa. |
| R10 | Eliminación de tickets exige motivo obligatorio. |
| R11 | Una reseña por usuario por evento (constraint `uk_autor_evento`). Puntuación 1–5. |
| R12 | `fecha_fin > fecha_inicio`. |
| R13 | No auto-seguir (constraint `ck_no_auto_seguir`). |
| R14 | Slug del organizador único y personalizable. |
| R15 | Cuenta `pendiente` no puede iniciar sesión ni interactuar. |
| R16 | Eliminaciones son lógicas; borrado físico tras 90 días con reporte previo. |

---

## 7. Decisiones (D1–D13)

| # | Decisión | Estado |
|---|---|---|
| D1 | Renombrar "reservas" → "tickets" en UI | Pendiente en código (schema ya tiene `codigo_ticket`, `qr_payload`) |
| D2 | Puntuación reseñas 1–5 (no 0–5) | ✅ Implementado en DB |
| D5 | Separación por URL, no por flag `modo_activo` | ✅ (salvo `perfilActivo` que ahora se persiste en BD) |
| D6 | WhatsApp como canal de confirmación (no pasarela) | ✅ Implementado |
| D8 | Score = AVG(puntuacion) reseñas visibles, redondeado 1 decimal | ✅ Implementado |
| D12 | Registro con OTP (6 dígitos, bcrypt, 15min TTL, 3 reenvíos, 5 intentos) | ✅ Implementado |
| D13 | Solo versiones LTS 2026 | ✅ Regla obligatoria |

---

## 8. Gaps documentados (no implementados en esta sesión)

| # | Gap | Razón |
|---|---|---|
| G1 | Gestión de miembros endpoints (CRUD) | Requiere backend nuevo (3-4h) |
| G2 | Reseñas en `/host/[slug]` con acciones | Requiere endpoints nuevos (2-3h) |
| G3 | Configuración propia del organizador (`/host/[slug]/configuracion`) | Requiere form dedicado (1.5h) |
| G4 | Lista de asistentes por evento (`/host/[slug]/tickets/[eventoId]`) | Requiere endpoint nuevo (3h) |
| G5 | Admin configuracion (placeholder) | No crítico para demo |
| G6 | Redirect `/organizaciones/[id]` → `/perfil/[id]` | 5 min, opcional |
| G7 | Paginación en admin usuarios | Tiene filtros, funcionalmente suficiente |
| G8 | Rutas OSRM (OpenStreetMap) detalladas | Pendiente, ya existe mapa básico |
| G9 | Cloudinary (subida real de imágenes) | Pendiente de credenciales |

---

## 9. Convenciones de código

- Entidades y endpoints en **español** (`usuarios`, `eventos`, `reservas`).
- Imports relativos con `.js` (nodenext).
- `bigint` → `string` en TypeORM/JS.
- `synchronize: false` — cambios solo por `schema.sql`.
- No emojis en UI: solo iconos `lucide-react`.
- Listas del admin con `<ol>`/`<ul>`, no `<table>`.
- Respuestas: `{ success, data, message }` / errores: `{ success, false, statusCode, message, timestamp }`.

---

## Apéndice A — Seed y operación

### Cuentas seed (`pnpm run seed` en `api/`)

| Email | Password | Rol |
|---|---|---|
| `admin@hastalavuelta.com` | `Admin.2026!` | admin |

### Seed demo (`pnpm run seed:demo`)

| Email | Password | Rol |
|---|---|---|
| `camila.pazmino@demo.com` | `Demo.2026!` | usuario |
| `valentina@lunacultura.com` | `Demo.2026!` | organizador (slug: `lunacultura`) |
| Más cuentas en `api/scripts/seed-demo.cjs` | | |

### Comandos

```bash
# API
cd api && pnpm run build        # typecheck + compile
cd api && pnpm run lint         # ESLint + Prettier
cd api && pnpm run seed         # Crea admin
cd api && pnpm run seed:demo     # Datos demo
cd api && pnpm run start:dev     # Dev server :3000

# Frontend
cd frontend && pnpm run typecheck && pnpm run lint && pnpm run build
cd frontend && pnpm run dev     # :3001

# Admin
cd frontend/admin && pnpm run typecheck && pnpm run lint && pnpm run build
cd frontend/admin && pnpm run dev  # :3002
```

Swagger: `http://localhost:3000/api/docs`

---

## Apéndice B — Cambios en esta sesión (2026-09-06)

- Consolidado de 14 archivos de specs en 2.
- Añadido `perfil_activo_enum` + columna `perfil_activo` en `usuarios` (persistencia entre pestañas).
- Fix bug `precioMin='0'` falsy en búsqueda de eventos.
- Fix score hardcoded en `/host/[slug]`.
- Añadido formulario de reseñas en `/eventos/[id]`.
- Eliminadas imágenes de relleno (`frontend/public/images/`).
- Hero de inicio ahora solo con wordmark (sin fotos decorativas).
- Eliminada página de registro del admin (creación via seed).
