# ESTADO DEL PROYECTO — Hasta la Vuelta

> **Última actualización:** 2026-09-01
> **Instrucción para agentes:** lee este archivo al inicio y continúa desde el "Punto final actual". No vuelvas a escanear el proyecto completo en cada sesión; actualiza este archivo cuando termines trabajo nuevo.

## Stack y estructura

- `api/` — NestJS 11 + TypeORM (PostgreSQL 15 / PostGIS). Puerto 3000, prefix global `/api/`.
- `frontend/` — App pública Next.js (puerto 3001).
- `frontend/admin/` — Panel de administración Next.js 16 (puerto 3002).
- `reportes/` — ASP.NET (sin tooling JS).
- Gestor de paquetes: **pnpm** (no npm/yarn).

## Punto final actual — Refactorización de base de datos y API (2026-09-01)

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

1. **Frontend**: Refactorizar `frontend/admin/` y `frontend/` para usar la nueva API (cambios en formularios de eventos, usuarios, etc.)
2. **Integrar Cloudinary** para subida de imágenes
3. **Endpoint de scraping de URL** para crear eventos desde link
4. **Detección de conflicto de horarios** para artistas
5. **Flujo de ubicaciones**: mapa → rutas → compartir a Google Maps
6. **Monetización**: planes, reseñas premium, publicidad nativa
7. **Seed script**: Actualizar `scripts/seed.cjs` para nueva estructura
8. **Reportes ASP.NET**: Actualizar consultas SQL para nueva estructura

## Convenciones (mantener)

- Panel oscuro: bordes `border-white/10`, textos `#848484` (muted) / `#45B46A` (verde) / `#C04C4C` (rojo), títulos `font-clash`, stats grandes `text-[40px] font-medium`.
- **Sin emojis**: solo iconos `lucide-react`.
- TypeScript nodenext: imports relativos con extensión `.js`; `bigint` → `string`.
- Credenciales admin seed: `admin@hastalavuelta.com` / `Admin.2026!`.

## Comandos

- `frontend/admin/`: `pnpm run typecheck` | `lint` | `build` | `dev` (3002).
- `api/`: `pnpm run build` | `lint` | `test` | `start:dev` (3000).
