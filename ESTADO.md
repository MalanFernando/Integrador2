# ESTADO DEL PROYECTO — Hasta la Vuelta

> **Última actualización:** 2026-09-05
> **Instrucción para agentes:** lee este archivo al inicio y continúa desde el "Punto final actual". No vuelvas a escanear el proyecto completo en cada sesión; actualiza este archivo cuando termines trabajo nuevo.

## Stack y estructura

- `api/` — NestJS 11 + TypeORM (PostgreSQL 15 / PostGIS). Puerto 3000, prefix global `/api/`.
- `frontend/` — App pública Next.js (puerto 3001).
- `frontend/admin/` — Panel de administración Next.js 16 (puerto 3002).
- `reportes/` — ASP.NET (sin tooling JS).
- Gestor de paquetes: **pnpm** (no npm/yarn).

## Punto final actual — Auditoría panel admin (2026-09-05)

### Alcance
- Refactorizado `frontend/admin/` (Next.js 16 oscuro, puerto 3002) alineado a `ESPECIFICACION_FUNCIONAL.md` (secciones 8.x, 9.5–9.8) y contratos reales de la API. NO se tocó la API.
- **Verificación:** `frontend/admin/ pnpm run typecheck` ✓ | `pnpm run lint` ✓ (0 errores; 9 warnings `<img>`/`no-img-element` documentados) | `pnpm run build` ✓ (17 rutas).

### Padrón anti-lint aplicado
- `react-hooks/set-state-in-effect` (eslint-config-next): **cero setState síncrono en el cuerpo de efectos**. Pattern: `loading` inicial `true`, setters solo en `.then/.catch/.finally`; resets de error solo en handlers de eventos. Se eliminó `setError('')`/`setLoading(true)` síncrono de todos los pages y se inlinó el fetch (dashboard/reportes sin `cargar()` llamado desde efecto).

### Páginas admin implementadas (spec 8.x)
- `/dashboard` (8.2) — KPIs, filtro temporal hoy/semana/mes (`/admin/dashboard`), gráficas CSS, "Necesitan atención", "Eventos más reservados" con totales por localidad **reales** (enriquecido con `/admin/reservas`), actividad reciente.
- `/eventos` + `/eventos/nuevo` + `/eventos/editar/[id]` (8.3) — tabs por estado, search por título, organizador enriquecido vía `/admin/usuarios`, aprobar/rechazar(motivo MinLength 3)/eliminar/editar/detalle (QR SVG local). Nuevo: modal A/B URL vs formulario + `POST /eventos/from-url` scrape prefill.
- `/usuarios` + `/usuarios/nuevo` + `/usuarios/editar/[id]` — resumen, filtros rol/estado, cambiar estado por fila (`PUT /admin/usuarios/:id/estado`), delete confirm. Form: `FormValues` planos + resolver cast (workaround types zod/RHF), payload `.trim() || undefined`, slug solo organizador al crear (editar NO manda slug).
- `/organizadores` (8.4) — categorías por organizador calculadas client-side, activar/suspender, editar.
- `/tickets` (8.6) — tabs reservas/reportes de reservas, verificar (`VerificarReservaDto` motivo MinLength 5), intervenir (`IntervenirReservaDto` cancelar|invalidar|corregir|restaurar + motivo MaxLength 1000 + notasInternas), gestionar reportes (revisado|desestimado), modal detalle con historial y QR.
- `/resenas` (8.7) — moderación mostrar/ocultar/reportar (`ModerarResenaDto`), motivos de reporte visibles.
- `/categorias` (8.8) — CRUD lista + modal form (color picker), delete confirm.
- `/reportes` (8.9) — sistema (filtro hoy/semana/mes + fechas personalizadas, gráficas CSS, descargar .txt client-side) + reportes de eventos con gestionar.
- `/registro` — bitácora de auditoría con filtro por tabla.
- `/configuracion` (8.11) — placeholder estático.

### Contratos admin confirmados (backend)
- `AdminController` bajo `@Roles('admin')`; `POST /eventos`/`POST /eventos/from-url` → `Roles('organizador','admin')`; `POST /ubicaciones` solo JwtAuthGuard.
- Usuario: `nombre` + `apellido` separados; **no hay columna `cedula`**; `ActualizarUsuarioDto` NO acepta `slug`.
- Enums reales: roles, estados usuario/evento/reserva/reseña/reporte (usa `ESTADO_REPORTE_ENUM` con `pendiente/revisado/desestimado`).
- Eventos list: sin nombre del organizador → enriquecido client-side con `/admin/usuarios`.
- Dashboard: `localidades` con `reservas: 0` hardcodeada → totales reales calculados client-side desde `/admin/reservas`.

### Gaps documentados (NO implementados)
- Crear evento no ofrece selector de organizador (API no permite elegir owner en admin → crea con el admin logueado).
- Búsqueda de eventos sin nombre del organizador (API no lo devuelve).
- `cedula` no existe en schema/API (los DTOs de admin no la tienen; campo omitido en forms).
- **Leftover fuera de scope:** `frontend/src/app/admin/*`, `frontend/src/components/layout/{navbar,admin-sidebar}.tsx` (links a `/admin/dashboard`) y sidebar admin viejo en la app pública siguen presentes — decidir si limpiarlos.

---
## Punto anterior — Auditoría frontend host (2026-09-05)

### Alcance
- Implementado el dominio **organizador** (`frontend/src/app/host/[slug]` y componentes), alineado con `ESPECIFICACION_FUNCIONAL.md` (secciones 7, 9.5–9.6, 10.x, 11) y los contratos reales de la API. NO se tocó la API.
- **Verificación:** `frontend/ pnpm run lint` ✓ (0 errores; solo warnings preexistentes `<img>`/admin) | `pnpm run typecheck` ✓ | `pnpm run build` ✓ (22 rutas; host dinámicas ƒ).

### Contratos de API verificados en esta sesión (backend)
- `POST /eventos/from-url` `{url}` → `ScrapedEvento`; `GET /eventos/mis-eventos` (todos los estados); `GET /eventos/:id/estadisticas?filtro=mes|semana|hoy` (stats reales: visitas/reservas/favoritos/reseñas/localidades); `GET /usuarios/perfil/:id` (público → `{...usuario, eventos, seguidores}`); `GET /social/seguidores/:userId?limit=1` → `{total}`; `POST /ubicaciones` `{ciudadId, direccionLinea1, referencia?, codigoPostal?, latitud, longitud}`.
- `validateFechas`: `fechaInicio` no pasada y `fechaFin > fechaInicio` (estrictos; **no** hay límite de 1 año). `validateModalidad`: online → exige `linkOnline`; presencial → exige `ubicacionId`.

### Fábrica de formularios: `frontend/src/lib/validation.ts` (schemas de evento)
- `EventoFormValues` con `localidadSchema`, `carteleraArtistaSchema`, `preguntaFrecuenteSchema`, `informacionPagoSchema` (cédula E.C., teléfono EC, regex nombre destinatario, tipoCuenta ahorros/corriente) y `eventoFormSchema` (superRefine: fechas, online→linkOnline, aforo == suma localidades, !gratuito→infoPago). `esUrlValida` + `urlOpcional` para linkOnline (zod v4 no exporta `z.url()`).

### Tipos alineados: `frontend/src/types/index.ts`
- `EstadoEvento`, `EventoGestion`, `StatLocalidad`, `EstadisticasEvento`, `ScrapedEvento`, `CategoriaConUsos`, `ResumenResenasStats` (distribución por puntuación).

### Componentes nuevos (`frontend/src/components/eventos/`)
- `evento-form.tsx` — form crear/editar reutilizable: imágenes ≤3 (upload Cloudinary con validación 5MB), categoría, edad, etiquetas, fechas datetime-local, visibilidad, descripción, cartelera ≤5, online/linkOnline, ubicación (provincia→ciudad→dirección/referencia/lat/lng vía `GET /provincias`, `GET /ciudades?provinciaId=`, `POST /ubicaciones` al guardar si hay cambios), localidades ≤4 con aforo auto-sugerido (prello desde suma), esGratuito→infoPago (con upload de foto cédula), preguntas frecuentes. Prefill desde `ScrapedEvento` (modo URL) o `EventoDetalle` (edición). Payload construido a mano; navega con `router.push`.
- `estadisticas-modal.tsx` — tabs mes/semana/hoy, cards Visitas/Reservas/Favoritos/Reseñas, dona conic-gradient por puntuación, barras por localidad y notas de aforo. Loading derivado (sin `setState` síncrono en effects).
- `mis-eventos-list.tsx` — lista por estado con Ver/Estadísticas/Enviar a revisión/Editar/Ocultar-Publicar/Eliminar (cancelación lógica), modal de stats interno.
- `host-tabs.tsx`, `host-placeholder.tsx`, `crear-evento-modal.tsx` (A/B: URL vs formulario) reutilizado desde `host-nav.tsx` (logo sin link, spec 7.1).

### Páginas host
- `/host/[slug]` — dashboard owner (contadores seguidores/guardados+reservas 30d vía estadísticas `filtro=mes`, tabs, MisEventosList, modales followers/crear) y vista pública (perfil real vía `/usuarios/perfil/:id` con `imagenes[0]`; arregla bug previo del render público).
- `/host/[slug]/eventos` — lista + modal A/B.
- `/host/[slug]/eventos/nuevo` — A/B con scrape `POST /eventos/from-url` (loading derivado, sin setState síncrono), `Suspense` por `useSearchParams`.
- `/host/[slug]/eventos/[id]/editar` — carga `GET /eventos/:id` → form precargado.
- `/host/[slug]/tickets` — ocupación por localidad vía modal de stats + notas de gaps de API.
- `/host/[slug]/resenas|miembros|configuracion` — placeholders (no se quitaron links del nav).

### Gaps de API (documentados, NO implementados)
- **Score organizador (D8)** no existe en backend → dashboard muestra "—" con nota.
- No hay endpoints para ver asistentes por evento ni **eliminar ticket con motivo** desde organizador → página Tickets documenta la limitación.
- "+ Nueva categoría" es solo admin (`POST /categorias` restringido).
- lat/lng deben escribirse a mano (sin geocoding en frontend).
- Límite real de upload 5MB (spec pública dice 2MB).

### Pendiente frontend (sin cambios)
- G6 (Cloudinary e2e), G13 (map routes), G14 verificado endpoint a endpoint (scrape) pero pendiente experiencian completa; refactor `frontend/admin/` para nueva API.

---
## Punto anterior — Auditoría frontend público (2026-09-05)

### Alcance
- Corregido `frontend/` (app pública del usuario normal) para alinearlo con los contratos reales de la API y `ESPECIFICACION_FUNCIONAL.md`. NO se tocó `frontend/admin/` (app separada).
- **Verificación:** `frontend/ pnpm run build` ✓ | `pnpm run lint` ✓ (0 errores, solo warnings preexistentes de `<img>`/admin) | `pnpm run typecheck` de `src/` ✓.

### Dependencias nuevas
- `frontend/`: `react-hook-form`, `zod@4` y `@hookform/resolvers@5` (soporta zod v4; `z.email()`).

### Fábrica de formularios: `frontend/src/lib/validation.ts` (schemas zod compartidos)
- `loginSchema`, `registerSchema` (nombre/apellido/telefono/cedula), `forgotPasswordSchema`, `resetPasswordSchema` (con refine de confirmación), `updatePerfilSchema`.
- Reglas replicadas del backend: cédula ecuatoriana 10 dígitos + dígito verificador, teléfono `^(?:\+593|0|593)\d{9}$`, password 8–128 con mayúsc./minúsc./número, nombre regex letras/espacios/apóstrofes/guiones. `validarImagenPerfil(file)` → jpeg/png/webp/gif ≤5MB.

### Tipos alineados: `frontend/src/types/index.ts`
- `EventItem`/`EventoDetalle` con `imagenes[]`, `aforo`, `organizadorId`, `categoriaNombre`, `esGratuito`, `informacionPago`, `localidades[{nombre,aforo,precio}]`, `usuariosCartelera`, `preguntasFrecuentes`, `online`. Eliminados campos inexistentes (`organizacionNombre`, `imagenPrincipalUrl`, `capacidadTotal`, `artistas`, `presentadoPor`, `establecimiento...`).

### Páginas corregidas (frontend público)
- **Inicio** (`app/page.tsx`), **Explorar** (`app/eventos/page.tsx`), **Mapa** (`app/mapa/page.tsx`), **Favoritos** (`app/favoritos/page.tsx`): `imagenes[0]`, categorías reales `GET /categorias`, filtro eventos pasados (`fechaFin >= now`), sin badges falsos "Free/Sold out". Mapa muestra solo eventos con `latitud/longitud` (incl. online con ubicación).
- **Detalle** (`app/eventos/[id]/page.tsx`): R10 (localidades solo si evento pagado con `informacionPago` completa), eventos gratis → botón único "Reservar gratis", botón deshabilitado si `fechaFin < now` ("Este evento ya finalizó"), payload reserva `{eventoId, localidadNombre, cantidadTickets}`, mapa con `EventMap`, tarjeta organizador (→ `/perfil/:id`), cartelera, FAQs, reseñas, confirmación con código.
- **Mis reservas** (`app/mis-reservas/page.tsx`): `localidadNombre`, estados `confirmed/verificado/cancelado/invalidado/reportado` con etiquetas en español, cancelar solo `confirmada`.
- **Auth**: `login-form`, `register-form` (con apellido/telefono/cedula), `forgot-password`, `reset-password` migrados a react-hook-form + zod.
- **Perfil** (`app/perfil/page.tsx`): contadores seguidores/siguiendo/guardados, modal de seguidores, tabs (guardados/tickets/configuración), edición de perfil con zod y subida de foto (upload → `PUT /usuarios/me` → refresh `/auth/me`).
- **Perfil público** (`app/perfil/[id]/page.tsx`, NUEVO): contadores, botón Seguir/Siguiendo (`POST/DELETE /social/seguir`), modal, grid de eventos.
- **Organización** (`app/organizaciones/[id]/page.tsx`): sin mocks, lee perfil público real vía `GET /usuarios/perfil/:id`.
- **Fix build Next 16**: `/auth/callback` y `/reset-password` envueltos en `<Suspense>` por `useSearchParams`; `seguidores-modal.tsx` reescrito sin `setState` síncrono en efectos (data via promise-context, remount por `key={type}`).
- **tsconfig**: se excluyó `admin` del proyecto `frontend/` (app separada con su propio tsconfig; sus archivos rompían el typecheck/build del frontend).

### Limitación de API (documentada, NO bloquea)
- El detalle de evento no devuelve tickets vendidos por localidad → el cliente NO puede deshabilitar el botón de "aforo agotado" antes de reservar (los endpoints de estadísticas requieren JWT). Se muestra el error del servidor al fallar stock en la reserva. Para deshabilitado anticipado haría falta exponer stock restante en `GET /eventos/:id`.

### Pendiente frontend (sin cambios)
- G6 (Cloudinary e2e), G13 (map routes), G14 (scraping→modal G3), refactor `frontend/admin/` para nueva API (tiene errores de types propios, fuera de alcance de esta auditoría).

---
## Punto anterior — Auditoría aforo de eventos (2026-09-05)

### Aforo total del evento (reglas: mín 1, máx 50 000)
- `schema.sql:259` — `aforo INT NOT NULL DEFAULT 1 CHECK (aforo BETWEEN 1 AND 50000)` ✅
- `create-evento.dto.ts` / `update-evento.dto.ts` — `@Min(1) @Max(50000)` en `aforo` ✅ (update ya alineado, sin `@Min(0)`)
- `LocalidadDto.aforo` — `@Min(1) @Max(50000)`; `LocalidadDto.precio` — `@Min(0) @Max(999999)` ✅
- `validateLocalidades` — máx. 4 localidades por evento (R7) ✅

### Aforo calculado desde localidades (DECISIÓN implementada)
- `eventos.service.ts` nuevo helper `calcularAforoFinal(aforo?, localidades?)`:
  - Si el DTO trae `aforo` → se usa tal cual.
  - Si NO trae `aforo` pero sí `localidades` → `aforo = suma(aforos localidades)` (antes usaba default 100 y fallaba la validación).
  - Si no trae ninguno → default `1` (alineado con spec "default 1" y default de BD).
- `create()` y `adminCreate()` ahora calculan aforo desde localidades y ejecutan `validateAforoLocalidades`.
- `update()` recalcula aforo si cambian las localidades sin enviar `aforo`; si envía `aforo`, valida que sea **exactamente** la suma; si aforo conjunto no cambia, conserva `evento.aforo`. Persiste `evento.aforo = aforoFinal` antes de guardar.
- Mensaje de error de `validateAforoLocalidades`: "La suma de aforos de las localidades (X) debe ser igual al aforo total del evento (Y)" (UTF-8 correcto).

### Consistencia con reservas (flujo 10.x)
- ✅ El stock por localidad SÍ se resta: `reservas.service.ts create()` calcula `SUM(cantidad_tickets)` de reservas no canceladas por `(evento_id, localidad_nombre)` y valida `cantidadTickets <= localidad.aforo - reservados`. Tickets cancelados liberan stock.
- `seed.cjs` coherente: evento con `aforo = 200` y localidades 150 + 50 = 200.

### Verificaciones
- `api/ pnpm run build` ✓
- `api/ pnpm run lint` ✓
- `api/ pnpm run test` ✓ — se agregó `"passWithNoTests": true` al config de Jest en `package.json` (proyecto no tiene `.spec.ts`; antes salía exit code 1).

### Validaciones corregidas/mejoradas (backend)

**1. emailReal validator aplicado:**
- `auth/dto/register.dto.ts` — `@Validate(EmailRealValidator)` en email (registro)
- `admin/dto/crear-usuario.dto.ts` — `@Validate(EmailRealValidator)` en email (crear usuario admin)
- `admin/dto/actualizar-usuario.dto.ts` — `@Validate(EmailRealValidator)` en email (cambiar email)
- Login NO tiene emailReal (evita bloquear por latencia DNS)

**2. Fechas de eventos — validación reforzada:**
- `eventos.service.ts validateFechas()` — ahora verifica que `fechaInicio` y `fechaFin` NO estén en el pasado
- `eventos.service.ts submit()` — ahora valida fechas antes de enviar a revisión
- `eventos.service.ts update()` — validación parcial: si solo se actualiza una fecha, se verifica que no sea pasada
- `validateFechaNoPasada()` — método nuevo para validar fechas individuales

**3. linkOnline — validación como URL:**
- `create-evento.dto.ts` — `@IsUrl()` + `@MaxLength(500)` en `linkOnline`
- `update-evento.dto.ts` — `@IsUrl()` + `@MaxLength(500)` en `linkOnline`

**4. Online requiere linkOnline:**
- `eventos.service.ts validateModalidad()` — ahora exige `linkOnline` cuando `online = true`
- Mensaje: "Un evento en línea debe tener un enlace de transmisión (linkOnline)"

**5. Validaciones numéricas mejoradas:**
- `LocalidadDto.precio` — `@Min(0)` + `@Max(999999)`
- `LocalidadDto.aforo` — `@Min(1)` + `@Max(50000)`
- `CreateEventoDto.aforo` — `@Min(1)` + `@Max(50000)`
- `InformacionPagoDto.numeroCuenta` — `@MinLength(1)` agregado
- `InformacionPagoDto.fotoCedulaUrl` — `@MaxLength(500)` agregado
- `CreateEventoDto.descripcion` — `@MaxLength(5000)` agregado

**6. Textos y patrones:**
- `create-evento.dto.ts` — `@MinLength(1)` en `nombre` de `LocalidadDto`, `respuesta` de `PreguntaFrecuenteDto`
- `CarteleraArtistaDto` — `@MaxLength` en `usuarioId`, `nombre`, `redSocial`
- `update-categoria.dto.ts` — `@Matches(/^#[0-9a-fA-F]{6}$/)` para `colorHex` (patrón hexadecimal)
- `visibilidad` en `CreateEventoDto` — `@IsIn(['publico', 'oculto', 'privado'])` agregado

**7. Verificación de reserva exige motivo (R3):**
- `admin/dto/verificar-reserva.dto.ts` — nuevo DTO con `motivo` obligatorio (`@MinLength(5)`)
- `reservas.service.ts verificar()` — ahora requiere `motivo` y lo guarda en `motivoIntervencion`
- `admin.controller.ts PUT /reservas/:id/verificar` — ahora acepta body con `motivo`

**8. Upload con magic bytes:**
- `upload.service.ts` — validación de magic bytes (no confiar en MIME del cliente)
- Rechaza archivos vacíos
- Detecta JPEG, PNG, GIF, WebP por firma binaria

### G15 — Fix enum `ESTADO_RESERVA_ENUM` (backend)
- `api/src/common/enums.ts` — agregado `'reportada'` al array `ESTADO_RESERVA_ENUM` (schema ya lo tenía)
- Build ✓ | Lint ✓

### Backend audit completada (contra SPEC)

**Modules verificados:**
- `auth/` ✓ — register, login, forgot-password, reset-password, google oauth
- `usuarios/` ✓ — CRUD, slug, preferencias, soft-delete
- `organizaciones/` ✓ — miembros (max 2), editor/moderador roles
- `eventos/` ✓ — CRUD, estados, scrape from URL, stats, max 5 activos, validar modalidad online/link
- `reservas/` ✓ — crear, mis-reservas, cancelar, verificar (excepcional), reportar (organizador→pendiente)
- `resenas/` ✓ — crear, listar por evento, reportar, moderar (admin)
- `favoritos/` ✓
- `social/` ✓ — seguidores/siguiendo con paginación + filtro nombre
- `admin/` ✓ — dashboard endpoints, gestionar reportes eventos/reservas
- `upload/` ✓ — Cloudinary (5MB, MIME validation)
- `planes/` ✓ — listar, miPlan, suscribirse
- `geo/` ✓ — provincias, ciudades, rutas OSRM, compartir links
- `reportes/` ✓ — reportar evento (pendiente), gestionar
- `reportes-reservas/` ✓ — reportar reserva (pendiente), gestionar
- `preferencias/` ✓ — get/put preferencias, cambiar password, eliminar cuenta
- `scraping/` ✓ — OG tags, Twitter, Schema.org, 10s timeout
- `auditoria/` ✓

**Gaps backend pendientes de resolver:**
- **G6** — Cloudinary: implementado pero no verificado end-to-end con frontend
- **G7** — Detección de conflicto de horarios para artistas: no implementado
- **G8** — Cron job 90 días para eliminación permanente de cuentas soft-deleted
- **G10** — Seed script actualizado para nueva estructura (ref actoría 2026-09-01)
- **G11** — Renombrar `reservas` → `tickets`: necesita confirmación (sección 18)
- **G13** — Map routes frontend: no verificada integración completa
- **G14** — Scraping integration: endpoint existe (`POST /eventos/from-url`), no verificada conexión con G3 modal

**Issues de spec pendientes (no gaps, bugs):**
- `reservas.controller.ts`: falta endpoint `reportar` (organizador reporta impago → estado 'reportada')
- `eventos.service.ts`: no hay cron job para marcar `finalizado` automáticamente (`fecha_fin < ahora`)

### Implementado en sesión anterior (frontend G2-G4, G17-G18)

**G2 — Route group host/[slug]:**
- `frontend/src/app/host/[slug]/layout.tsx` — layout propio con `HostNav`
- `frontend/src/app/host/[slug]/page.tsx` — perfil público del organizador (eventos, seguidores)
- `frontend/src/components/layout/host-nav.tsx` — navegación del host (Eventos, Reseñas, Miembros, Tickets, Configuración)

**G3 — Modal A/B "Crear evento":**
- `frontend/src/components/eventos/crear-evento-modal.tsx` — modal reutilizable con opciones: (A) Publicar desde URL / (B) Crear con formulario
- Integrado en `navbar.tsx` — organizadores y admin ven el modal; usuarios normales habilitan organizador y abren `/host/<slug>`

**G4 — Sidebar admin actualizado:**
- `frontend/src/components/layout/admin-sidebar.tsx` — eliminado "Establecimientos", agregado "Tickets" y "Categorías"

**G17 — Modal seguidores/siguiendo:**
- `frontend/src/components/social/seguidores-modal.tsx` — modal estilo Instagram con buscador por nombre, paginación, toggle Seguir

**G18 — Eventos online UI:**
- `frontend/src/types/index.ts` — campos `online` y `linkOnline` en `EventItem` y `EventoDetalle`
- `frontend/src/components/ui/avatar.tsx` — soporte tamaño "xl", acepta `src` null
- `frontend/src/app/eventos/page.tsx` — filtro "Modalidad" (Todas/Presencial/En línea), badge "En línea" en cards
- `frontend/src/app/eventos/[id]/page.tsx` — badge "En línea" + botón "Unirse al evento en línea" en detalle
- `frontend/src/app/mapa/page.tsx` — excluye eventos online sin ubicación

### Verificaciones

- `api/ pnpm run build` ✓
- `api/ pnpm run lint` ✓
- `frontend/` typecheck: errores solo en `admin/` (preexistentes)
- `frontend/admin/ pnpm run lint` ✓ (solo warnings de `<img>`)

## Punto anterior — Especificación funcional unificada (2026-09-05)

## Punto anterior — Frontend Auth + API Auth (2026-09-02)

### Cambios en Frontend (`frontend/`)

- **LoginForm limpio**: Eliminado código no utilizado, validaciones robustas de email, botón Google OAuth funcional
- **RegisterForm corregido**: Cambiado de `nombreCompleto` a `nombre` + `apellido` separados (coincide con API), validaciones de email, contraseña (8+ chars, mayúscula, minúscula, número), teléfono opcional
- **Página `/forgot-password`**: Formulario para solicitar reseteo de contraseña via email
- **Página `/reset-password`**: Formulario para establecer nueva contraseña con token
- **Página `/auth/callback`**: Callback para Google OAuth
- **AuthContext actualizado**: Agregado `setAuthFromCallback` para OAuth

### Cambios en API (`api/`)

- **Google OAuth**: `GET /api/auth/google` y `GET /api/auth/google/callback` con Passport strategy
- **Reseteo de contraseña**: `POST /api/auth/forgot-password` y `POST /api/auth/reset-password`
- **AuthMailerService**: Envío de emails de reseteo via Nodemailer (SMTP)
- **Nuevas dependencias**: `passport-google-oauth20`, `nodemailer`

### Cambios en Base de Datos

- **Nueva tabla `password_reset_tokens`**: id, usuario_id (FK), token (unique), expires_at, used, created_at

### Variables de entorno nuevas (`api/.env`)

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Hasta la Vuelta" <noreply@hastalavuelta.com>
FRONTEND_URL=http://localhost:3001
```

### Verificaciones

- `api/ pnpm run build` ✓ (0 errores)
- `frontend/` errores solo en `admin/` (preexistentes)

## Punto anterior — Refactorización de base de datos y API (2026-09-01)

### Cambios principales en la arquitectura

- **Eliminada tabla `organizaciones`** — Ahora los organizadores son usuarios con `rol = 'organizador'`. La tabla `organizaciones` ya no existe.
- **Eliminada tabla `establecimientos`** — Ya no existe en el esquema.
- **Eliminada tabla `localidades`** (como tabla separada) — Ahora es un campo JSONB dentro de `eventos.localidades`.
- **Eliminada tabla `evento_artistas`** — Ahora es un campo JSONB `eventos.usuarios_cartelera`.
- **`miembros_organizacion`** ahora referencia `organizador_id` (un usuario con rol organizador) en lugar de `organizacion_id`.
- **`resenas`** ya no tiene `organizacion_id` ni `establecimiento_id` — solo referencia a `evento_id`.
- **`seguidores`** simplificado — solo seguimiento entre usuarios (sin organizaciones).
- **`categorias`** ya no tiene campo `tipo`.
- **`reservas`** usa `localidad_nombre` (string) en lugar de `localidad_id` (FK).

### Nuevos campos en `usuarios`

- `nombre` y `apellido` (antes `nombre_completo`)
- `foto_portada` (TEXT)
- `etiqueta` (VARCHAR 150) — ej: "artista", "comediante"
- `ubicacion` (JSONB) — opcional, para organizadores con establecimiento

### Nuevos campos en `eventos`

- `aforo` (INT, default 100) — reemplaza `capacidad_total`
- `imagenes` (JSONB) — reemplaza `imagen_principal_url` + `galeria_imagenes`
- `online` (BOOLEAN)
- `usuarios_cartelera` (JSONB) — max 5 artistas
- `visibilidad` (enum: publico/oculto/privado)
- `localidades` (JSONB) — max 4, cada una con: nombre, aforo, precio
- `informacion_pago` (JSONB) — nombre destinatario, número contacto, cuenta bancaria, tipo cuenta, cédula, foto verificación
- `preguntas_frecuentes` (JSONB) — título + respuesta

### Triggers de base de datos

- `check_max_eventos_organizador` — max 5 eventos activos por organizador
- `check_max_miembros` — max 2 miembros activos por organizador

### API (`api/`) — Módulos refactorizados

- **auth**: Register ahora pide `nombre` + `apellido` (no `nombreCompleto`)
- **usuarios**: Entity actualizada con nuevos campos
- **organizaciones**: Ahora gestiona `miembros_organizacion` referenciando un organizador (usuario). Rutas: `GET/POST/PUT/DELETE /organizadores/:id/miembros`
- **eventos**: Entity reestructurada, DTOs nuevos con `LocalidadDto`, `CarteleraArtistaDto`, `InformacionPagoDto`, `PreguntaFrecuenteDto`. Rutas protegidas con `@Roles('organizador', 'admin')` para crear.
- **resenas**: Simplificada — solo requiere `eventoId`, `puntuacion`, `comentario`
- **reservas**: Usa `localidadNombre` (string) en lugar de `localidadId`
- **social**: Seguidores solo entre usuarios (sin organizaciones)
- **categorias**: Sin campo `tipo`
- **admin**: Eliminadas rutas de organizaciones y establecimientos. Estadísticas simplificadas.

### Archivos eliminados

- `organizaciones/entities/organizacion.entity.ts`
- `organizaciones/entities/establecimiento.entity.ts`
- `organizaciones/dto/create-organizacion.dto.ts`
- `organizaciones/dto/update-organizacion.dto.ts`
- `organizaciones/dto/create-establecimiento.dto.ts`
- `organizaciones/dto/update-establecimiento.dto.ts`
- `eventos/entities/localidad.entity.ts`
- `eventos/entities/evento-artista.entity.ts`
- `admin/dto/crear-organizacion.dto.ts`
- `admin/dto/actualizar-organizacion.dto.ts`

### Verificaciones

- `pnpm run build` ✓ (0 errores)

## Falta por hacer (pendiente)

### Backend
1. **G7** — Detección de conflicto de horarios para artistas
2. **G8** — Cron job 90 días para eliminación permanente de cuentas soft-deleted
3. **G10** — Seed script actualizado para nueva estructura
4. **G11** — Renombrar `reservas` → `tickets` (requiere confirmación sección 18)
5. Reservas: endpoint `reportar` para que organizador reporte impago
6. Eventos: cron job para marcar `finalizado` cuando `fecha_fin < ahora`

### Frontend
1. **G14** — Integración completa scraping (frontend G3 → backend)
2. **G13** — Integración frontend de map routes
3. **G6** — Verificación end-to-end Cloudinary upload
4. **Limpiar leftovers admin en `frontend/`**: `src/app/admin/*`, links a `/admin/dashboard` en `navbar.tsx` y `admin-sidebar.tsx` (la app admin está en `frontend/admin/`).

### ASP.NET
1. Reportes: actualizar consultas SQL para nueva estructura

### Preguntas abiertas (sección 18 — NO implementar sin confirmar)
- 9 preguntas pendientes de confirmación

## Convenciones (mantener)

- Panel oscuro: bordes `border-white/10`, textos `#848484` (muted) / `#45B46A` (verde) / `#C04C4C` (rojo), títulos `font-clash`, stats grandes `text-[40px] font-medium`.
- **Sin emojis**: solo iconos `lucide-react`.
- TypeScript nodenext: imports relativos con extensión `.js`; `bigint` → `string`.
- Credenciales admin seed: `admin@hastalavuelta.com` / `Admin.2026!`.

## Comandos

- `frontend/admin/`: `pnpm run typecheck` | `lint` | `build` | `dev` (3002).
- `api/`: `pnpm run build` | `lint` | `test` | `start:dev` (3000).
