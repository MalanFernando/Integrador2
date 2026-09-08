# ESTADO DEL PROYECTO — Hasta la Vuelta

> **Última actualización:** 2026-09-14 (fix reseñas: backfill 6 eventos como finalizado, cron verificado, sticky detail + reInit carousel)
> **Instrucción para agentes:** lee este archivo al inicio y continúa desde el "Punto final actual". No vuelvas a escanear el proyecto completo en cada sesión; actualiza este archivo cuando termines trabajo nuevo.

## Punto final actual — Fix reseñas vacías: backfill eventos a finalizado + UI refinamientos (2026-09-14)

### Alcance

Slider "Reseñas de eventos pasados" vacío en detalle de evento y perfil de organizador. Causa: todos los eventos reseñados tenían `estado='aprobado'` con `fecha_fin` vencida, pero ningún evento tenía `estado='finalizado'`. El endpoint `GET /organizadores/:id/resenas?soloPasados=true` filtra por `e.estado = 'finalizado'`, resultando en 0 reseñas. Cron `marcarEventosFinalizados` (every hour) nunca se probó con datos reales.

### Cambios realizados

**1. Verificación BD (psql/node pg)**
- `resenas`: 6 filas, todas `estado='visible'`
- `eventos`: 6 filas con `fecha_fin < NOW()`, todas `estado='aprobado'`
- 0 eventos con `estado='finalizado'`

**2. Backfill SQL (script node ad-hoc)**
```sql
UPDATE eventos SET estado='finalizado'
WHERE estado='aprobado' AND deleted_at IS NULL AND fecha_fin < NOW();
```
- 6 eventos actualizados: "Maratón de Cine de Terror", "Noche de Stand-Up Comedy", "Feria Roots", "Festival de Cine Independiente", "Concierto Acústico", "Torneo de Fútbol 5 Amateur"
- Verificado: 6 reseñas ahora unen a eventos `finalizado`

**3. Revisión cron (`api/src/app.module.ts`, `tareas.service.ts`)**
- `ScheduleModule.forRoot()` presente en `app.module.ts:115`
- `TareasModule` importado en `app.module.ts:116`
- `@Cron(CronExpression.EVERY_HOUR) marcarEventosFinalizados()` en `tareas.service.ts:20-35` — UPDATE idéntico al backfill, con logger cuando hay afectados
- Configurado correctamente; transición futura de eventos vencidos funcionará sin intervención

**4. UI refinamientos (sesión previa completada en paralelo)**
- `reviews-carousel.tsx`: anyadido `useEffect` con `emblaApi?.reInit()` al cambiar `visibleResenas.length`
- `eventos/[id]/page.tsx`: columna izquierda con `leftCanStick` (ResizeObserver + `requestAnimationFrame` para deferir setState), clase condicional `lg:sticky lg:top-12 lg:self-start`
- `mapa/page.tsx`: sidebar mobile movido dentro del área del mapa (`absolute inset-0 z-20/z-30` sobre el section), eliminando duplicación de estructura

### Pendiente

- Ninguno. Los 5 errores `setState in effect` preexistentes no fueron reintroducidos ni ampliados.

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ |
| `frontend/` | ✓ | 5 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

---

## Punto final actual — Informe actualizado del proyecto (WORD .docx, 2026-09-08)

### Alcance

Generación de `Informe_Proyecto_Integrador_Eventos_Actualizado.docx` (raíz del repo, ~18.5 MB) replicando la estructura del `Informe_Proyecto_Integrador_Eventos.pdf` original (portada institucional → ÍNDICE GENERAL → LISTA DE TABLAS → LISTA DE FIGURAS → 4 capítulos) pero reflejando el estado real del proyecto y las especificaciones vigentes (2026). El usuario convierte este `.docx` a PDF por su cuenta.

### Cambios realizados

- **Herramienta:** se descartó WEasyPrint en Windows (no hay runtime GTK/Pango). Se generó el PDF con ReportLab 5.0.1 y un **DOCX con python-docx 1.2.0** a partir del mismo contenido (recorre el `story` de ReportLab).
- **Scripts (temp):**
  - `C:\Users\Ferna\AppData\Local\Temp\opencode\informe\generar_informe.py` — genera el PDF (build guardado bajo `if __name__ == "__main__"` para poder importarlo).
  - `C:\Users\Ferna\AppData\Local\Temp\opencode\informe\generar_informe_docx.py` — genera el DOCX reutilizando el story.
- **DOCX (`Informe_Proyecto_Integrador_Eventos_Actualizado.docx`):**
  - A4, márgenes 2.2 cm, Times New Roman, portada centrada replicada (IST Cordillera, T.S. Desarrollo de Software, HASTA LA VUELTA, integrantes, Quito 08 Septiembre 2026).
  - Primer plano con portada sin encabezado/pie; resto con encabezado (capítulo actual vía `STYLEREF "Heading 1"` + "Hasta la Vuelta", línea inferior) y pie con número de página (`PAGE`), solo para páginas posteriores a la portada.
  - Capítulos → Word "Heading 1" (4), secciones → Heading 2 (18), subsecciones → Heading 3 (33) → el ÍNDICE GENERAL es un campo `TOC \o "1-3"`.
  - LISTA DE TABLAS / LISTA DE FIGURAS con campos `TOC \c "Tabla"` / `TOC \c "Figura"` alimentados por campos **SEQ** en cada captión (14 tablas, 25 figuras).
  - 14 tablas como tablas de Word con grid, cabecera azul `#0D47A1` (texto blanco), filas zebra `#EBEBEB` y ficha con columna `#E8EEF8` (replicado desde los `_bkgrndcmds` de ReportLab).
  - 25 imágenes: 6 diagramas vectoriales renderizados a PNG vía `renderPDF` → PyMuPDF (sin Cairo), y 19 capturas de `UI-img/` embebidas una por página (mismo tamaño que el PDF usando `gi.ANCHO`/`gi.ALTO_DISP`).
  - `w:updateFields=true` en settings: Word pide actualizar campos al abrir → los índices quedan con números de página reales. **Instrucción para el usuario:** abrir en Word, aceptar actualizar campos (o Ctrl+A + F9) y luego convertir a PDF; en LibreOffice: Herramientas → Actualizar → Actualizar todo antes de exportar.
- **Verificación del DOCX:** 254 párrafos, 14 tablas, 25 imágenes en línea, 14 campos `SEQ Tabla`, 25 `SEQ Figura`, 3 campos TOC, STYLEREF/PAGE en header/footer parts, `updateFields=true`, first-page header habilitado.

### Pendiente / notas

- El PDF generado antes (`Informe_Proyecto_Integrador_Eventos_Actualizado.pdf`) sigue existiendo; el usuario puede conservarlo o eliminarlo (su intención es convertir el `.docx`).
- No se pudo auditar visualmente páginas ni la actualización de los campos TOC sin un procesador de Office local.

## Stack y estructura

- `api/` — NestJS 11 + TypeORM (PostgreSQL 15 / PostGIS). Puerto 3000, prefix global `/api/`.
- `frontend/` — App pública Next.js (puerto 3001).
- `frontend/admin/` — Panel de administración Next.js 16 (puerto 3002).
- `reportes/` — ASP.NET (sin tooling JS).
- Gestor de paquetes: **pnpm** (no npm/yarn).

## Punto final actual — 9 ajustes UI: upload CORS, scroll horizontal, stats vertical, dialog oscuro, pill mapa, sticker pequeno, categorias margen, sidebar mapa mobile, avatar pequeno (2026-09-14)

### Alcance

9 refinamientos UI en `frontend/` y fix CORS en `api/`.

### Cambios realizados

**1. Subida de imagenes: CORS fix (`api/src/main.ts`)**
- anyadido 'Accept' a `allowedHeaders` en la configuracion CORS: `['Content-Type', 'Authorization', 'Accept']`
- La causa raiz del error de upload era una combinacion del preflight CORS y la falta de 'Accept' para requests multipart
- Flujo verificado: `postFile()` en api.ts no establece Content-Type (correcto, navegador lo autogenera con boundary); backend con JwtAuthGuard y FileInterceptor espera campo 'file' con 5MB limite; tipos permitidos: jpg, png, webp, gif
- Consumidores: perfil/page.tsx, host/[slug]/configuracion/editar/page.tsx, evento-form.tsx — manejo de error con err.message

**2. Scroll horizontal: audit y overflow-x-clip (`globals.css`, pages)**
- `body` en globals.css: sin overflow-x (Tailwind v3 no soporta overflow-x-clip en CSS raw)
- anyadido `overflow-x-clip` a elementos `<main>` de: explorar-view.tsx, mapa/page.tsx (via MapaPageContent), eventos/[id]/page.tsx, perfil/page.tsx, perfil/[id]/page.tsx, favoritos/page.tsx, mis-reservas/page.tsx
- anyadido `overflow-x-clip` al `<footer>` de footer.tsx
- Eliminado cualquier w-screen, min-w-screen, left-0 top-[...] copiados de Figma (no se encontraron)
- Regla: body no fuerza scroll horizontal global; overflow-x-clip en contenedores decorativos

**3. Stats separador vertical (`eventos/[id]/page.tsx`)**
- Reemplazados `<span className="h-px w-[35px] bg-[rgba(245,245,245,0.25)]" />` (linea horizontal) por `<span className="w-px h-[40px] bg-[rgba(245,245,245,0.25)]" />` (linea vertical)
- En 2 lugares: entre Seguidores/Eventos y entre Eventos/Puntuacion

**4. Dialog y componentes oscuro (`dialog.tsx`, estadisticas-modal.tsx, seguidores-modal.tsx, select.tsx, textarea.tsx, crear-evento-modal.tsx, evento-form.tsx)**
- Dialog base: overlay `bg-black/80`, contenedor `bg-[#101010] border border-white/10 rounded-lg`, titulo `text-[#F5F5F5]`, boton X `text-white/60 hover:text-white hover:bg-white/10`
- estadisticas-modal: todas las tarjetas `border-white/10 bg-white/5`, texto `text-white`, barras `bg-white/10`, spinner `border-white/20 border-t-white`
- seguidores-modal: items `hover:bg-white/10`, texto `text-white`, spinner `border-white/20 border-t-white`
- select.tsx: `border-white/10 bg-white/5 text-white`, chevron `text-white/40`, options `bg-[#101010] text-white`
- textarea.tsx: `border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:ring-white/20`
- crear-evento-modal: titulos `text-white`, descripciones `text-white/50`, borde `border-white/10`
- evento-form.tsx: datetime-local inputs `border-white/10 bg-white/5 text-white`; Textarea overrides `bg-white` eliminados (el componente ya es oscuro por defecto)

**5. Pill ubicacion como boton al mapa (`eventos/[id]/page.tsx`)**
- `<div className="inline-flex items-center gap-1 mt-4 rounded-lg bg-[#E3F4F9] px-3 py-1.5 text-black text-xs">` convertido en `<button onClick={() => router.push(`/mapa?lat=...&lng=...&id=...`)}>`
- Mantiene estilos exactos: bg-[#E3F4F9], text-black, MapPin icon
- mapa/page.tsx: anyadido `useSearchParams()` en MapaPageContent y useEffect que lee lat/lng/id de URL y centra mapa + abre card del evento; envolvido en `<Suspense>` para Next.js 16
- Funcionalidad: al tocar la pill de ubicacion en detalle evento, abre el mapa centrado en esas coordenadas con la card del evento abierta

**6. Sticker 10px mais pequeno (`inicio-view.tsx`)**
- Contenedor: `h-[60px] w-[60px] sm:h-[89px] sm:w-[89px]` (reducido de 70/99)
- SVG interior: `width="99" height="99"` mantenido con `className="h-full w-full"`
- Posicion: `absolute -bottom-5 -right-4 z-10` intacta

**7. Slider categorias separado 50px mais (`inicio-view.tsx`)**
- `my-10 lg:my-14` reemplazado por `mt-24 lg:mt-32 mb-10 lg:mb-14` (suma ~50px al margen superior)
- Marquee con `overflow-hidden` en wrapper, `width: max-content` y `animate-[marquee_30s_linear_infinite]` verificado en globals.css

**8. Sidebar mapa igual en mobile (`mapa/page.tsx`)**
- Boton toggle: `hidden lg:flex` → `flex` (siempre visible, top-4 left-4 z-30)
- Sidebar mobile: nuevo div `fixed inset-y-0 left-0 z-40 w-80 bg-black border-r border-white/10 overflow-y-auto lg:hidden` con backdrop click-to-close
- Desktop: `hidden lg:block w-80 shrink-0` mantenido
- Mapa: `overflow-x-clip` en MapaPageContent main
- Overlay de rutas mobile (`renderMobileOverlay`) mantenido como fallback para rutas

**9. Avatar profile 8px mais pequeno (`avatar.tsx`, `variants.ts`)**
- `avatar.tsx`: `profile: 'h-[118px] w-[118px] text-[2.2rem]'` → `profile: 'h-[110px] w-[110px] text-[2rem]'`
- `variants.ts`: `profile: { class: 'h-[130px] w-[130px] text-[2.4rem]' }` → `profile: { class: 'h-[110px] w-[110px] text-[2rem]' }` (por consistencia)

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ |
| `frontend/` | ✓ | 5 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesion)
- 5 errores de lint `setState in effect` (eventos/[id]/page.tsx, mapa/page.tsx, perfil/[id]/page.tsx, explorar-view.tsx, auth-context.tsx)
- ~41 warnings de `<img>` en admin y frontend

---

## Punto final actual — Fix schema.sql idempotencia + re-seed completo (2026-09-14)

### Alcance

Fix de idempotencia en `schema.sql` y restauracion completa de la DB.

### Cambios realizados

**1. schema.sql idempotencia (`schema.sql:52`)**
- anyadida linea `DROP TABLE IF EXISTS configuracion_plataforma CASCADE;` en el bloque de drops
- Eliminada marca BOM UTF-8 (`EF BB BF`) al inicio del archivo (causaba error de sintaxis en node-pg)
- `configuracion_plataforma` era la unica tabla sin `DROP`; todas las demas ya lo tenian (incluyendo `email_verification_codes` con su DROP inline)

**2. Re-ejecucion schema.sql (PostgreSQL)**
- Completado exitosamente: todas las tablas, 14 triggers, ~30 indices, semilla de `planes`/`provincias`/`ciudades`/`categorias`
- Verificado: 14 triggers (`updated_at x10 + check_max_eventos x2 + check_max_miembros x2`), 7 indices en `eventos`, 11 categorias, 3 planes

**3. Re-ejecucion seed:demo**
- 5 usuarios, 5 ubicaciones, 10 eventos (con `usuarios_cartelera` para Stand-Up Comedy y Concierto Acustico), 6 reseas, 3 reservas
- Verificado via API: evento 2 (Stand-Up) -> 3 artistas; evento 5 (Acustico) -> 3 artistas

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ |
| `frontend/` | ✓ | 5 errores preexistentes | ✓ (26 rutas) |

### Warnings preexistentes (no introducidos en esta sesion)
- 5 errores de lint `setState in effect` (eventos/[id]/page.tsx, mapa/page.tsx, perfil/[id]/page.tsx, explorar-view.tsx, auth-context.tsx)
- ~41 warnings de `<img>` en admin y frontend

---

## Punto final actual — Fix cartelera: rol/orden en DTO, seed data, 2 eventos actualizados (2026-09-14)

### Alcance

Fix de los artistas de cartelera en detalle de evento: DTO, schema, seed y datos existentes.

### Cambios realizados

**1. DTO cartelera con rol y orden (`api/src/eventos/dto/create-evento.dto.ts`)**
- `CarteleraArtistaDto` ahora incluye `rol?: string (@MaxLength(100))` y `orden?: number (@IsInt, @Min(0))`
- Validadores presentes; update-evento.dto.ts reutiliza el mismo DTO importado

**2. Schema validacion frontend (`frontend/src/lib/validation.ts`)**
- `carteleraArtistaSchema` con `rol: z.string().max(100).optional()` y `orden: z.number().int().nonnegative().optional()`

**3. Tipo frontend (`frontend/src/types/index.ts`)**
- `CartelItem.rol` y `CartelItem.orden` ahora optionals (eran required)

**4. Render detalle evento (`frontend/src/app/(usuario)/eventos/[id]/page.tsx:714`)**
- Subtitulo `artista.rol` envuelto en `{artista.rol && ...}` para no mostrar linea vacia cuando no existe

**5. Seed con cartelera (`api/scripts/seed-demo.cjs`)**
- `crearEvento()` ahora inserta la columna `usuarios_cartelera` (parametro 14, default `[]`)
- Dos eventos poblados con artistas: "Noche de Stand-Up Comedy" (3) y "Concierto Acustico: Plaza Sonora" (3)

**6. Datos existentes DB (script `api/scripts/update-cartelera.cjs` creado y ejecutado)**
- UPDATE directo en los 2 eventos ya seedeados para setear `usuarios_cartelera`
- Verificado via API: evento 2 "Noche de Stand-Up Comedy" -> 3 artistas; evento 5 "Concierto Acustico: Plaza Sonora" -> 3 artistas

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ |
| `frontend/` | ✓ | 5 errores preexistentes | ✓ (26 rutas) |

### Warnings preexistentes (no introducidos en esta sesion)
- 5 errores de lint `setState in effect` (eventos/[id]/page.tsx, mapa/page.tsx, perfil/[id]/page.tsx, explorar-view.tsx, auth-context.tsx)
- ~41 warnings de `<img>` en admin y frontend

---

## Punto final actual — Panel organizador: cards owner, menu 3 puntos con suspender, popup motivo + notificacion admin, breadcrumb crear evento (2026-09-14)

### Alcance

Refinamientos del panel del organizador: cards sin like, compartir siempre visible, menu de 3 puntos con suspender, popup de motivo con notificacion al admin, y breadcrumb/encabezado en crear evento.

### Cambios realizados

**1. Cards owner: compartir siempre, sin like (`profile-event-card.tsx`)**
- variant 'owner': menu MoreHorizontal (3 puntos) + boton Compartir siempre visible (antes solo en visitor)
- variant 'visitor': HeartButton + Compartir
- Boton Compartir (Share2) ahora fuera del bloque variant y se muestra siempre
- Import anyadido: `Pause` de lucide-react para el icono de suspender

**2. Menu 3 puntos owner con suspender (`profile-event-card.tsx`)**
- anyadido `onSuspend?: () => void` a ProfileEventCardProps
- Nuevo item de menu "Suspender evento" (icono Pause) entre Editar y Mostrar/Ocultar
- Orden del menu: Editar / Suspender / Ocultar-Mostrar / Eliminar

**3. actionModal con 'suspend' (`host/[slug]/page.tsx`)**
- Tipo actionModal ampliado: `action: 'hide' | 'delete' | 'show' | 'suspend'`
- Nuevo handler `handleSuspend(eventoId, motivo)` que llama DELETE /eventos/:id con body { motivo }
- Modal render: title/actionLabel/isDestructive segun accion (Ocultar/Suspender/Eliminar)
- ProfileEventCard recibe `onSuspend` y `onShare` (owner ahora tiene compartir)

**4. Fix DELETE motivo: api.delete con body (`api.ts`, `host/[slug]/page.tsx`)**
- `api.delete(path, body?)` ahora acepta body opcional serializado como JSON
- `handleDelete` y `handleSuspend` sendan `{ motivo }` como body en vez de query string
- Backend `DELETE /eventos/:id` recibe `@Body() CancelEventoDto` con `motivo` (ya existente)

**5. Notificacion al admin en ocultar/suspend/eliminar (`eventos.service.ts`, `eventos.module.ts`)**
- anyadido `SocialService` y `Repository<Usuario>` al constructor de EventosService
- anyadido metodo privado `notificarAdmins(evento, accion, motivo)` que crea notificacion para todos los admins activos (patron igual a reportes.service.ts)
- `updateVisibilidad`: al cambiar a 'oculto' o 'publico' con motivo, llama `notificarAdmins` con accion 'ocultar'/'mostrar'
- `cancel`: al cancelar con motivo, llama `notificarAdmins` con accion 'eliminar'
- EventosModule importa SocialModule para injectar SocialService

**6. Fix handleHide/handleShow (`host/[slug]/page.tsx`)**
- handleHide envia `{ visibilidad: 'oculto', motivo }` en vez de `{ oculto: true, motivo }` (el backend espera campo 'visibilidad')
- handleShow envia `{ visibilidad: 'publico' }` en vez de `{ oculto: false }`

**7. Breadcrumb y encabezado en crear evento (`host/[slug]/eventos/nuevo/page.tsx`)**
- anyadido ChevronLeft + texto "Eventos / Crear evento" antes del EventoForm (para modo url y formulario)
- anyadido encabezado: icono CalendarClock en caja bg-[#222] rounded-lg + titulo "Crear evento" + subtitulo "Campos obligatorios *" con asterisco rojo #D94242
- Todo dentro del layout del perfil (hero + tabs + menu) como要求 el Frame253

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ |
| `frontend/` | ✓ | 5 errores preexistentes | ✓ (27 rutas) |

### Warnings preexistentes (no introducidos en esta sesion)
- 5 errores de lint `setState in effect` (eventos/[id]/page.tsx, mapa/page.tsx, perfil/[id]/page.tsx, explorar-view.tsx, auth-context.tsx)
- ~41 warnings de `<img>` en admin y frontend

---

## Punto final actual — Panel admin, Bloque 3: Reseñas y Reservaciones (2026-09-08)

### Alcance

Tercer bloque del plan. Ver `C:\Users\Ferna\.claude\plans\atomic-splashing-bee.md`. Bloque 4 (Categorías+Registro+Configuración+Reportes) queda pendiente.

### Fix de seguridad (no planeado, encontrado en el camino)

`ReservasService.listAll()` (usado por `GET /admin/reservas`) devolvía el objeto `usuario` completo de cada reserva **incluyendo `passwordHash`** (bcrypt) al panel admin — bug preexistente, no introducido en esta sesión, pero lo encontré al construir la vista de asistentes que consume este mismo endpoint y lo corregí de inmediato (`withoutPassword()` aplicado al mapear resultados, verificado con curl que el campo ya no aparece en la respuesta). Nota para el futuro: `auditoria.service.ts`, `organizaciones.service.ts` y `reportes.service.ts` tienen el mismo patrón (`relations: { usuario: true }` sin `withoutPassword`) — no se tocaron por estar fuera del alcance de este bloque, pero conviene auditarlos.

### Cambios realizados

**Backend — Reseñas (`resenas.service.ts`)**
- `listAll()`: ahora acepta `buscar` (nombre/apellido del autor o título del evento), `puntuacion`, `fechaDesde`/`fechaHasta`, `incluirEliminadas`; excluye `deleted_at IS NOT NULL` por defecto.
- Nuevo `estadisticas()` → `{ total, nuevas (30 días), reportadas, eliminadas }`.
- Nuevo `eliminar(id, adminId)` — primer uso real de las columnas `deleted_at`/`deleted_by` que ya existían en la entidad (agregadas en el Bloque 0) pero no se usaban en ningún método.
- `admin.controller.ts`/`admin.service.ts`: `GET /admin/resenas` con los filtros nuevos, `GET /admin/resenas/estadisticas`, `DELETE /admin/resenas/:id` (con auditoría).

**Backend — Reservas (`reservas.service.ts`)**
- `listAll()`: ahora acepta `eventoId`, `buscar` (nombre/correo del usuario que reservó), `localidad`, `fechaDesde`/`fechaHasta`, `incluirEliminadas`.
- Nuevo `estadisticas()` → `{ total, nuevas, reportadas, eliminadas }` (agregado global, no por evento).
- Nuevo `adminEliminar(id, adminId)` — primer uso real de `deleted_at`/`deleted_by` en reservas (distinto de "cancelar", que solo cambia `estado`; el soft-delete es una capa aparte, así "válidas" se sigue calculando con `estado IN (confirmada, verificada) AND deleted_at IS NULL`).
- `admin.controller.ts`/`admin.service.ts`: `GET /admin/reservas` con los filtros nuevos, `GET /admin/reservas/estadisticas`, `DELETE /admin/reservas/:id`.

**Backend — nuevo agregado `admin.service.ts` `eventosConReservasResumen()`**
- Una sola query (joins a `usuarios`, `ubicaciones`, `ciudades`, `reservas`) que devuelve TODOS los eventos no eliminados con: organizador, ubicación (ciudad o "En línea"), `totalReservas` y `reservasValidas` agregados. Expuesta en `GET /admin/eventos-con-reservas` con filtros `buscar`/`estado`/`fechaDesde`/`fechaHasta`. Evita el N+1 que tenía la implementación anterior (`tickets/page.tsx` cargaba `/admin/eventos` completo solo para cruzar nombres).

**Frontend — `resenas/page.tsx` reescrita**
- KPIs desde el backend: Total, Nuevas, Reportadas, Eliminadas (antes eran Visibles/Reportadas/Ocultas/Total calculados en cliente).
- Filtros nuevos: puntuación (1-5 estrellas), fecha desde/hasta, búsqueda por usuario o evento.
- Botón "Eliminar" explícito (ícono `Trash2`, `ConfirmDialog`) junto a Mostrar/Reportar/Ocultar — hace `DELETE`, distinto de "Ocultar" (que solo cambia `estado`). Las reseñas eliminadas se muestran atenuadas con badge "Eliminado" y sin acciones.
- Botón "Generar reporte" (CSV).

**Frontend — Reservaciones reestructuradas a 2 niveles**
- `tickets/page.tsx`: la pestaña "Reservas" pasó a ser "Eventos" — lista de **eventos con reservas** (no reservas sueltas). KPIs globales (Total/Nuevas/Reportadas/Eliminadas de reservas), filtros (estado del evento, con/sin reservas, fecha, orden A-Z/Z-A, búsqueda evento/organizador), tabla evento+organizador+fecha+reservas+estado, acciones "ver lista de reservas" (→ `/tickets/[eventoId]`) y "revisar evento" (reusa `EventoDetalleModal`). La pestaña "Reportes de reservas" se conservó sin cambios (funcionalidad real que ya existía).
- Nueva ruta `tickets/[eventoId]/page.tsx`: card del evento arriba (imagen, título, fecha, ubicación, contador de reservas válidas), KPIs (Total/Válidas/Localidades/Reportadas/Eliminadas), filtros (localidad, estado incluyendo "Eliminadas", fecha de emisión, búsqueda usuario/correo), tabla de asistentes (usuario+fecha de emisión+fecha de registro en la plataforma+localidad+estado+acciones). Acciones: Revisar (modal detalle), Verificar, Intervenir (reutiliza `IntervenirModal` existente sin cambios) y Eliminar (nuevo, soft-delete). Botón "Generar reporte".
- `types/index.ts`: nuevos `EstadisticasResenas`, `EstadisticasReservas`, `EventoConReservas`; `Resena`/`Reserva` ganaron `deletedAt?`; `Reserva.usuario` ganó `fotoPerfilUrl?`/`createdAt?`.

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | — | ✓ (`nest build`) |
| `frontend/admin/` | ✓ | ✓ (0 errores, 13 warnings `<img>` preexistentes) | ✓ (Next 16, 18 rutas, nueva `/tickets/[eventoId]`) |

Probado manualmente contra la API en dev + Postgres local: eliminar una reserva y confirmar que desaparece de `/admin/reservas?eventoId=` por defecto pero sigue apareciendo con `incluirEliminadas=true`, que `/admin/eventos-con-reservas` refleja el conteo actualizado (`totalReservas: 0` tras eliminar la única reserva del evento), que `/admin/reservas/estadisticas` sube `eliminadas` y baja `total`, y lo mismo para reseñas (`DELETE /admin/resenas/:id` + `/admin/resenas/estadisticas`). Confirmado que `passwordHash` ya no aparece en la respuesta de `/admin/reservas` tras el fix.

### Pendiente para próximo bloque
- Bloque 4: Categorías ("+ Otra" en el dropdown de evento), Registro (KPIs/filtros), Configuración (implementar, hoy placeholder), Reportes (conectar export CSV/print view en cada pantalla, reporte por perfil de usuario individual).
- Seguimiento sugerido (fuera de alcance de este bloque): revisar si `auditoria.service.ts`, `organizaciones.service.ts` y `reportes.service.ts` filtran `passwordHash` en sus relaciones `usuario`/`autor` cargadas — mismo patrón que se corrigió en `reservas.service.ts`.

## Punto final actual — Panel admin, Bloque 2: Eventos (2026-09-08)

### Alcance

Segundo bloque del plan de completar el panel admin. Ver `C:\Users\Ferna\.claude\plans\atomic-splashing-bee.md`. Bloques 3-4 (Reseñas+Reservaciones; Categorías+Registro+Configuración+Reportes) quedan pendientes.

### Cambios realizados

**Backend**
- `eventos.service.ts` `search()`: fix — `estado` ahora acepta el sentinel `'todos'` (antes, no pasar `estado` caía en el default `'aprobado'` de forma silenciosa incluso cuando el admin pedía "Todos"; la comparación SQL ahora es `e.estado::text = $1` con bypass `$1::text = 'todos'`, sin afectar el comportamiento público por defecto — verificado con curl que `/api/eventos` sin filtro sigue devolviendo solo `aprobado`).
- `admin.service.ts` `listEventos()`: ahora acepta `categoriaId`, `fechaDesde`, `fechaHasta` además de `estado`, forwardeados a `eventosService.search()` (que ya los soportaba, solo faltaba exponerlos en el admin). `admin.controller.ts` expone los query params nuevos en `GET /admin/eventos`.
- Nuevo `GET /admin/eventos/estadisticas` → `{ total, activos, inactivos, enRevision, eliminados, reportados }` (activos=aprobado, inactivos=cancelado+rechazado+borrador agrupados ya que el enum `estado_evento_enum` no tiene un valor literal "inactivo", en_revision=pendiente, eliminados=deleted_at IS NOT NULL, reportados=eventos distintos con un reporte pendiente).
- `CreateEventoDto.organizadorId` y `eventosService.adminCreate()` ya soportaban asignar el evento a cualquier organizador válido (verificado, sin cambios) — solo faltaba que el frontend lo usara.
- "Activar/Inactivar" en el frontend usa el endpoint ya existente `PATCH /eventos/:id/visibilidad` (publico ↔ oculto, con `motivo` → columna `motivo_oculto`) en vez de crear un endpoint nuevo — `findForEdit()` ya permite bypass a `rol=admin`, verificado con curl.

**`evento-form.tsx`**
- Nueva sección "Organizador" al inicio: en modo crear, `UserAutocomplete` (filtrado a `rol=organizador`) + enlace rápido "crear organizador nuevo" (`/usuarios/nuevo?rol=organizador`, `target="_blank"` para no perder el progreso del formulario); es obligatorio elegir uno antes de publicar (validación en el cliente, el backend igual permite el fallback al propio admin si se llama directo a la API). En modo editar se muestra de solo lectura (el backend no soporta reasignar organizador vía `UpdateEventoDto`, no se tocó ese alcance).
- Sección "Ubicación": los inputs de texto de latitud/longitud se reemplazaron por `LocationMapPicker` (mapa + búsqueda de dirección); se mantienen los dropdowns de provincia/ciudad y el input de dirección como antes (`ciudadId` sigue siendo obligatorio para `POST /ubicaciones`, el mapa solo resuelve lat/lng y sugiere la dirección vía reverse geocode).
- Sección "Cartelera": cada artista ahora tiene un `UserAutocomplete` opcional arriba (autocompleta nombre + `usuarioId` al seleccionar un usuario registrado) y el input "Nombre del artista" sigue editable manualmente para el caso "no existe en la plataforma" del spec.

**`eventos/page.tsx` reescrita**
- KPIs: Activos, Inactivos, En revisión, Eliminados, Reportados (desde `GET /admin/eventos/estadisticas`).
- Filtros: pills de estado (ahora "Todos" funciona de verdad), categoría (dropdown desde `GET /categorias`), fecha desde/hasta (inputs `type="date"`), orden A-Z/Z-A por título, búsqueda por título de evento **o** nombre del organizador (usa `organizadorNombre` que ya viene en la respuesta de `search()`, se eliminó el fetch completo de `/admin/usuarios` que hacía antes solo para mapear nombres — más liviano).
- Acciones por fila: revisar/ver detalle, aprobar/rechazar (solo pendientes), inactivar (oculta con motivo vía `MotivoModal`) / activar (vuelve a público), editar, eliminar lógico. Botón "Generar reporte" (CSV).
- `types/index.ts`: `EventSearchItem` ganó `organizadorNombre?`/`organizadorFotoPerfilUrl?` (ya venían del backend, no se usaban); nuevo tipo `EstadisticasEventos`.

**Reutilización de piezas transversales del Bloque 1**: `UserAutocomplete` se generalizó (`UsuarioMinimo` en vez de exigir `AdminUsuario` completo, para poder mostrar el organizador ya asignado de un `EventoDetalle` sin pedir todos sus campos) y `LocationMapPicker` se reutilizó sin cambios.

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | — | ✓ (`nest build`) |
| `frontend/admin/` | ✓ | ✓ (0 errores, 11 warnings `<img>` preexistentes) | ✓ (Next 16, 17 rutas) |

Probado manualmente contra la API en dev + Postgres local: `GET /admin/eventos/estadisticas`, `GET /admin/eventos?estado=todos`, `GET /admin/eventos?categoriaId=`, `PATCH /eventos/:id/visibilidad` (oculto→publico), `POST /admin/eventos` con `organizadorId` de otro usuario (evento quedó asignado correctamente, no al admin), y se confirmó que `GET /eventos` público (sin filtro) sigue devolviendo solo `aprobado` tras el fix del sentinel `'todos'`.

### Pendiente para próximos bloques
- Bloque 3: Reseñas (búsqueda usuario/evento, filtro puntuación/fecha, botón eliminar explícito) + Reservaciones (reestructurar `tickets/page.tsx` a 2 niveles: eventos con reservas → asistentes por evento, con su propia ruta `tickets/[eventoId]`).
- Bloque 4: Categorías ("+ Otra" en el dropdown de evento), Registro (KPIs/filtros), Configuración (implementar, hoy placeholder), Reportes (conectar export CSV/print view en cada pantalla, reporte por perfil de usuario individual).

## Punto final actual — Panel admin, Bloque 1: formularios completos por rol + Organizadores (2026-09-08)

### Alcance

Primer bloque (de 4) del plan para completar el panel admin según el flujo superadmin descrito por el usuario. Ver plan completo en la conversación / `C:\Users\Ferna\.claude\plans\atomic-splashing-bee.md`. Bloques 2-4 (Eventos; Reseñas+Reservaciones; Categorías+Registro+Configuración+Reportes) quedan pendientes para próximas sesiones.

Nota de proceso: durante la investigación previa a este bloque, un subagente de solo-lectura ignoró sus instrucciones y adelantó trabajo real (dashboard KPIs, sidebar/topbar responsive, campana de notificaciones, soft-delete en `reservas`/`resenas`, stats de usuarios) incluyendo una migración aditiva ya aplicada a la BD local. Se revisó, se verificó que compila limpio, y el usuario decidió mantenerlo como base — se reporta aquí para que quede constancia.

### Cambios realizados

**Backend (`api/src/admin/`)**
- `admin.service.ts` `listUsuarios()`: ahora acepta `buscar` (nombre/apellido/email vía ILIKE), `rol`, `estado`, `orden` (`nombre_asc`/`nombre_desc`), `limit`. `admin.controller.ts` expone los query params nuevos en `GET /admin/usuarios`.
- Nuevo `GET /admin/usuarios/estadisticas` → `{ total, activos, organizadores, admins, inactivos, suspendidos, eliminados }`.
- Nuevo `GET /admin/organizadores-resumen` → lista de organizadores con `totalEventos` y `totalMiembros` agregados en una sola query (join con `eventos` y `miembros_organizacion`), evita N+1 en el listado.
- `CrearUsuarioDto`/`ActualizarUsuarioDto` ya soportaban `fotoPerfilUrl`, `fotoPortada`, `biografia`, `etiqueta`, `redesSociales`, `ubicacion` (de una sesión previa) — sin cambios, solo verificados.
- `POST/DELETE /organizadores/:id/miembros...` (`assertPropietario`) ya permite a `rol=admin` gestionar miembros de cualquier organizador — verificado con pruebas manuales (crear organizador → invitar miembro existente → listar → eliminar lógico), sin cambios de código.

**Piezas nuevas reutilizables (`frontend/admin/src/components/`)**
- `usuarios/user-autocomplete.tsx`: buscador con debounce (300ms) contra `GET /admin/usuarios?buscar=&rol=`, usado para asignar organizador/miembros/artistas en los próximos bloques.
- `ubicacion/location-map-picker.tsx` + `ubicacion/location-map-inner.tsx`: selector de ubicación con mapa Leaflet (nuevo `leaflet`/`react-leaflet`/`@types/leaflet` como dependencias de `frontend/admin`, mismas versiones que `frontend/`) + búsqueda de dirección contra Nominatim (cliente, sin key, `countrycodes=ec`) + reverse geocode al hacer clic en el mapa. `next/dynamic` con `ssr:false` para el mapa interno (mismo patrón que `frontend/src/components/map/event-map.tsx`). Recentrado del mapa vía `useMap().setView()` (no `setState` en efecto) para cumplir la regla de lint `react-hooks/set-state-in-effect`.
- `usuarios/social-links-fields.tsx`: 5 inputs (sitio web, Instagram, Facebook, TikTok, otro) → `redesSociales` JSONB.
- `lib/export.ts`: sin cambios en este bloque (ya tenía `exportToCsv`; la vista imprimible queda para el Bloque 4).

**`usuario-form.tsx` reescrito con campos condicionales por rol**
- Selector de rol en su propia sección "Tipo de cuenta" (acepta preset `?rol=` desde la URL, usado por el botón "Crear organizador").
- **Organizador**: foto perfil + portada (sube a Cloudinary vía `api.uploadImage`, patrón calcado de `host/[slug]/configuracion/editar/page.tsx`), nombre (etiquetado "nombre de usuario visible en el perfil"), apellido, teléfono, cédula, email, bio, redes sociales, dominio (`slug` con preview `hastalavuelta.com/host/[slug]`), ubicación (mapa + dirección/ciudad/nombre del lugar, todo en el JSONB `usuarios.ubicacion`, sin FK a `ciudadId`), sección Miembros (autocomplete + notificar, o invitar por email — máx. 2 activos, igual que la constraint del backend).
- **Admin**: foto perfil, nombre, apellido, teléfono, cédula, email, password, estado. Sin bio/redes/portada/ubicación.
- **Usuario**: foto perfil + portada, nombre, apellido, teléfono, cédula, email, etiqueta, bio, redes sociales, password, estado. Sin dominio/ubicación/miembros.
- Campos nuevos (fotos, bio, etiqueta, redes, ubicación) se manejan con `useState` plano fuera de react-hook-form/zod (el resolver de zod solo cubre los campos core: email/password/nombre/apellido/telefono/cedula/rol/estado/slug) para no tener que ampliar `crearUsuarioSchema`/`actualizarUsuarioSchema` — se mezclan al payload manualmente en `onSubmit`.
- Miembros: en modo crear se encolan localmente y se envían con `POST /organizadores/:id/miembros` recién creado el usuario; en modo editar se cargan con `GET /organizadores/:id/miembros` y los cambios son inmediatos.

**`usuarios/nuevo/page.tsx` y `usuarios/editar/[id]/page.tsx`**: envueltos en `<Suspense>` porque `UsuarioForm` ahora usa `useSearchParams()` (requerido por Next.js App Router).

**`organizadores/page.tsx` reescrito**
- Fuente de datos: `GET /admin/organizadores-resumen` (antes cruzaba `/admin/usuarios` + `/admin/eventos` en el cliente).
- KPIs: Organizadores, Activos, Inactivos, Nuevos (30 días — calculado con un `Date.now()` capturado en `useEffect`, no en el render, para cumplir `react-hooks/purity`), Eliminados.
- Filtros: estado (incluye "Eliminado"), número de eventos (con/sin), orden A-Z/Z-A, búsqueda nombre/correo.
- Tabla: columnas Organizador (foto+nombre+correo/ciudad), Responsable (nombre+apellido), Eventos, Miembros, Estado, Acciones (activar/suspender vía `ConfirmDialog`, editar, eliminar lógico nuevo con su propio `ConfirmDialog`).
- Botón "Generar reporte" (CSV) y botón "Crear organizador" → `/usuarios/nuevo?rol=organizador` (reusa el mismo formulario en vez de duplicar un flujo separado).

**`usuarios/page.tsx`**: revisado, ya cumplía el spec (KPIs, filtros rol/estado/búsqueda/orden, tabla con mini-perfil/rol/registro/estado inline/actividad/acciones, botón generar reporte) — sin cambios.

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | — | ✓ (`nest build`) |
| `frontend/admin/` | ✓ | ✓ (0 errores, 10 warnings `<img>` preexistentes) | ✓ (Next 16, 17 rutas) |

Probado manualmente contra la API en dev + Postgres local: `GET /admin/usuarios/estadisticas`, `GET /admin/organizadores-resumen`, `GET /admin/usuarios?buscar=`, `POST /admin/usuarios` (organizador con bio/redes/ubicación), `POST /organizadores/:id/miembros` (miembro existente), `GET /organizadores/:id/miembros`, `DELETE /admin/usuarios/:id` (soft-delete) — todos responden como se espera.

### Pendiente para próximos bloques
- Bloque 2: Eventos (KPIs, filtro categoría/fecha/organizador, `UserAutocomplete` para asignar organizador en `evento-form.tsx`, `LocationMapPicker` para reemplazar los inputs de lat/lng de texto, buscador real para cartelera de artistas).
- Bloque 3: Reseñas (filtros faltantes) + Reservaciones (reestructurar `tickets/page.tsx` a 2 niveles: eventos con reservas → asistentes por evento).
- Bloque 4: Categorías (opción "+ Otra" en el dropdown de evento), Registro (KPIs/filtros), Configuración (implementar, hoy placeholder), Reportes (conectar export CSV/print view en cada pantalla).

## Punto final actual — 8 ajustes UI: nav rounded-lg, ENCUENTRA solape 8px, sticker SVG, footer gigante anclado, mapa X dentro card, mapa quitado, botones Seguir compactos, reviews sin wrapper (2026-09-14)

### Alcance

8 refinamientos UI en `frontend/`.

### Cambios realizados

**1. Nav: rounded-md → rounded-lg (`usuario-nav.tsx`, `host-nav.tsx`)**
- Desktop links Explorar/Mapa (`l.112-131`): `rounded-md` → `rounded-lg`
- Mobile links Explorar/Mapa (`l.237-258`): `rounded-md` → `rounded-lg`
- Dropdown trigger perfil (`l.154`): `rounded-md` → `rounded-lg`
- Dropdown panel perfil (`l.167`): `rounded-md` → `rounded-lg`
- `host-nav.tsx` trigger (`l.59`): `rounded-md` → `rounded-lg`
- `host-nav.tsx` panel (`l.69`): `rounded-md` → `rounded-lg`

**2. ENCUENTRA: solape maximo 8px (`inicio-view.tsx`)**
- Skeleton loading (`l.233`): `marginLeft: '-132px'` → `marginLeft: '-8px'`
- Cards reales (`l.248`): `marginLeft: '-132px'` → `marginLeft: '-8px'`
- Mantiene `rotate(cardRotations[i])`, `zIndex: i+1`, `shrink-0`, `overflow-x-auto` con scrollbar oculta

**3. Sticker de inicio: SVG圆形 blanco con estrella negra (`inicio-view.tsx`)**
- Reemplazado bloque SVG viejo por nuevo: circulo `#F5F5F5` con estrella negra recortada (clipPath con rotacion 32.67deg)
- Contenedor: `absolute -bottom-5 -right-4 z-10` con `h-[70px] w-[70px]` sm:`h-[99px] w-[99px]`
- SVG: `width="99" height="99" viewBox="0 0 99 99"`

**4. Footer: texto gigante anclado abajo, ~120px ocultos (`footer.tsx`)**
- Wrapper div: `<div className="relative mt-20 md:mt-24 h-[calc(21.84vw-40px)] min-h-[30px] md:h-[208px]">`
- h2: `absolute inset-x-0 -bottom-[40px] md:-bottom-[120px]` (conserva `w-full text-center font-clash text-[14vw] md:text-[210px]`)
- Barra copyright: `mt-10` → `mt-0` (pegado bajo el wrapper)
- `<footer>`: `overflow-x-clip` como red de seguridad
- Criterio: "HASTA" totalmente visible, ~120px de "LA VUELTA" ocultos detr as de la barra

**5. Mapa X button dentro de la card flotante (`mapa/page.tsx`)**
- Boton X movido de hermano de la card a primer hijo de la card
- Posicion: `absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm`
- Simetrico con HeartButton/Share (`top-3 left-3`)
- Eliminada estructura `<> </>` innecesaria

**6. Mapa quitado del detalle de evento (`eventos/[id]/page.tsx`)**
- Eliminada seccion `{tieneUbicacion && (...)}` completa (EventMap con mapa Leaflet)
- Eliminada constante `tieneUbicacion` (codigo muerto)
- Eliminada importacion `dynamic from 'next/dynamic'` (ya no se usa)
- Mantenido pill "Ubicacion" con MapPin en el header

**7. Botones "Seguir" mas pequenos (`eventos/[id]/page.tsx`)**
- Organizador: `w-[120px] px-4 py-3 text-base` → `w-[96px] px-3 py-2 text-sm`
- Artistas: `w-[75px] py-2 px-3 text-base` → `w-[68px] py-1.5 px-2.5 text-sm`
- Ambos mantienen `rounded-lg border border-[#DFDFDF] flex items-center justify-center`

**8. ReviewsCarousel sin wrapper overflow-x-auto (`eventos/[id]/page.tsx`)**
- Eliminado `<div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">` que envolvia ReviewsCarousel
- Embla maneja su propio scroll con `overflow-hidden` en el viewport; el wrapper extra recortaba las flechas laterales (-translate-x-4/translate-x-4)
- ReviewsCarousel ahora directo dentro del section

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 5 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesion)
- 5 errores de lint `setState in effect` (eventos/[id]/page.tsx, mapa/page.tsx, perfil/[id]/page.tsx, explorar-view.tsx, auth-context.tsx)
- ~41 warnings de `<img>` en admin y frontend

---

## Punto final actual — Card Localidades segun referencia Localitiescard (2026-09-14)

### Alcance

Restructuracion de la seccion Localidades en `eventos/[id]/page.tsx` siguiendo referencia Localitiescard. Funcionalidad de reserva conservada (estados reservando, reservaError, reservaOk, selectedLoc, aviso evento finalizado/gratuito).

### Cambios realizados

**Card Localidades al estilo Localitiescard (`eventos/[id]/page.tsx`)**

1. Contenedor: `section className="flex flex-col w-full rounded-lg bg-[#101010] overflow-hidden"` (sin absolute/min-screen)

2. Encabezado: `<div className="px-6 pt-6 pb-9 w-full border-b-[0.8px] border-b-[rgba(245,245,245,0.25)]">` con `<h3 className="text-[32px] font-semibold text-[#F5F5F5]">` (32px, no text-2xl)

3. Filas de localidades (radio SVG 12x24):
   - `<button type="button" onClick={() => setSelectedLoc(localidad.nombre)} className="px-6 py-6 flex items-center gap-4 w-full">`
   - SVG radio: `<span className="shrink-0 w-[12px] h-6"><svg viewBox="0 0 12 24"><rect x="0.5" y="6.5" width="11" height="11" rx="5.5" stroke="#F5F5F5" fill="none" />{selected && <circle cx="6" cy="12" r="3.5" fill="#F5F5F5" />}</svg></span>`
   - Nombre: `text-xl font-medium text-[#F5F5F5]`
   - Precio: `text-xl font-bold text-[#F5F5F5] ml-auto` con formato `$XX.XX` (nunca "Gratis")
   - Divider: `<div className="h-px bg-[rgba(245,245,245,0.25)] mx-6" />` entre filas

4. Footer CTA (borde superior 0.8px, sin linea roja):
   - `<div className="w-full border-t-[0.8px] border-t-[rgba(245,245,245,0.25)]">`
   - Inner: `<div className="px-6 py-4 flex items-center justify-center gap-4 w-full">`
   - Texto: `text-[#F5F5F5] text-base font-semibold` "Asegura tu lugar -- reserva tu entrada"
   - Boton: `w-[150px] shrink-0 rounded-lg border border-[#F5F5F5] bg-[#F5F5F5] text-black` con SVG inline de chat (viewBox="0 0 19 19", path fill="#222222" stroke="#222222" strokeWidth="2" strokeLinejoin="round"), `hover:bg-white/90`
   - Texto dinamico: "Reservando..." / "Reservar" / "Iniciar sesion"

5. Funcionalidad conservada: selectedLoc, reservar(), reservaError, evento finalizado, entrada gratuita, MessageCircle en otras partes del archivo.

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 5 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Bug fix

**Maximum update depth exceeded (`event-map.tsx`)**
- Causa: `events` como dependencia del `useEffect` que llama a `setClusters`. Cuando el padre pasa una nueva referencia de array en cada render, el effect se re-ejectua, llama `setClusters`, causa re-render, y se repite infinitamente.
- Fix: `eventsRef = useRef(events)` declarado al nivel del componente (no dentro del effect); `eventsRef.current = events` se actualiza en cada render; `recompute()` lee `eventsRef.current` en vez de `events`. Dependency array reducido a `[map, mapReady]`. Elimina el loop infinito.

### Warnings preexistentes (no introducidos en esta sesion)
- 5 errores de lint `setState in effect` (eventos/[id]/page.tsx, mapa/page.tsx, perfil/[id]/page.tsx, explorar-view.tsx, auth-context.tsx)
- ~41 warnings de `<img>` en admin y frontend

---

## Punto final actual — 9 ajustes UI: bullet categorias, overflow-x-clip, abanico ENCUENTRA, navbar border-b-2, footer gigante sin recorte, mapa card z-index/like, filtros overlay, sticker visible (2026-09-13)

### Alcance

9 refinamientos UI independientes en `frontend/`.

### Cambios realizados

**1. Bullet de categorias separado + banda ms abajo (`inicio-view.tsx`)**
- Contenedor flex del marquee: `gap-8` (separacion uniforme entre items)
- Cada span: `inline-flex items-center` sin gap interno; bullet con `ml-8` (padding propio de 8px antes del siguiente texto)
- Banda: margen `-mt-14` / `-mt-8`替换为 `my-10` / `my-14` (separacion positiva de la seccion anterior)

**2. overflow-x-clip en secciones decorativas (`inicio-view.tsx`)**
- `<main>`: `overflow-hidden` → `overflow-x-clip` (permite desborde vertical de blobs/gradientes)
- Seccion "¿TIENES UN EVENTO?": `overflow-hidden` → `overflow-x-clip`
- Seccion CLIENTES y banda de categorias: mantienen `overflow-hidden` (necesario para marquee)

**3. ENCUENTRA como abanico horizontal superpuesto (`inicio-view.tsx`)**
- Columna flex-col con gap-6/margenes negativos reemplazada por fila flex items-center justify-center
- Cards con `marginLeft: i === 0 ? 0 : '-132px'` (style inline) y `zIndex: i + 1`
- Mantiene rotaciones existentes (`cardRotations`), Link a detalle, corazon/share, badges, gradiente radial
- Contenedor con `overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden` para pantallas angostas

**4. Navbar Explorar/Mapa: border-b-2 border-white activo (`usuario-nav.tsx`)**
- Desktop y mobile: `border border-white` → `border-b-2 border-white` (solo borde inferior 2px cuando activo)
- Inactivo: `border-b-2 border-transparent`
- ProfileTabs ya tiene border-b-2, sin cambios

**5. Footer texto gigante sin recorte (`footer.tsx`)**
- Eliminados `h-[140px] overflow-hidden` del wrapper y `absolute -bottom-[120px]` del h2
- h2 ahora es bloque normal con `mt-20 md:mt-28 w-full text-center font-clash text-[14vw] md:text-[210px]`
- `pointer-events-none select-none` mantenido; copyright queda debajo naturalmente

**6. Mapa floating card: like/share en esquina superior izquierda (`mapa/page.tsx`)**
- HeartButton y Share2 movidos de fila inferior (junto a "Ver rutas") a overlay `absolute top-3 left-3 z-10 flex items-center gap-2` dentro del contenedor de la card
- Fila inferior solo con boton "Ver rutas" full-width
- Handlers con `e.preventDefault()/e.stopPropagation()` para no navegar al detalle

**7. Mapa floating card z-index reducido (`mapa/page.tsx`)**
- Contenedor card: `z-40` → `z-30`; boton X: `z-50` → `z-30`
- Navbar (`z-40`) y menu mobile overlay (`z-50`) quedan por encima de la card

**8. Filtros mobile overlay flotante (`event-filters.tsx`)**
- Boton "Filtros" y panel envueltos en `<div className="relative" ref={mobileFiltersRef}>`
- Panel: `absolute right-0 top-full mt-2 w-[min(92vw,380px)] bg-[#1a1a1a] border border-white/10 rounded-lg p-4 space-y-4 z-50`
- Click-outside cierra (ref en wrapper relativo); re-clic en boton toggle abre/cierra

**9. Sticker CTA visible (`inicio-view.tsx`)**
- Dentro del clipPath: `<rect width="90" height="90" fill="#F5F5F5">` (fondo blanco completo) + rectangulo negro rotado interior
- Contenedor relativo de la card CTA con `z-10` para estar por encima

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 5 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesion)
- 5 errores de lint `setState in effect` (eventos/[id]/page.tsx, mapa/page.tsx, perfil/[id]/page.tsx, explorar-view.tsx, auth-context.tsx)
- ~41 warnings de `<img>` en admin y frontend

---

## Punto final actual — Restructuracion detalle evento segun Frame 139 (2026-09-12)

### Alcance

Reestructuracion completa de `eventos/[id]/page.tsx` siguiendo referencia Frame 139: estilos refeateados en todos los bloques, localidades con radio circles y boton unico "Reservar", nueva seccion "Reseñas de eventos pasados" con carrusel deslizable, y filtro `soloPasados` en backend.

### Cambios realizados

**1. Backend — filtro soloPasados en reseñas**
- `organizaciones.service.ts` `listResenasDelOrganizador()`: parametro `soloPasados` (default false); cuando `true`, agrega `AND e.estado = 'finalizado'` al WHERE SQL
- `organizaciones.controller.ts`: `@Query('soloPasados') soloPasados: string` y pasa `soloPasados === 'true'` al service
- Sin el param, comportamiento原地 (perfil host/[slug] sigue funcionando igual)

**2. Cabecera — "Volver a explorar" restilado**
- `<button>` con `router.push('/explorar')` (reemplaza `<Link>`)
- Estilo: `inline-flex items-center gap-2.5 text-white/60 hover:text-white`
- ArrowLeft blanco + `<span class="text-[#DFDFDF] text-base font-semibold">Volver a explorar</span>`
- Import de `Minus`, `Plus` eliminados; `console.log` de debug eliminado

**3. Grilla — layout editorial**
- `lg:grid-cols-[565px_1fr] gap-8 lg:gap-x-24`

**4. Bloque Localidades — refeateado**
- Contenedor: `bg-[#101010] rounded-lg overflow-hidden` (antes `bg-[#121212] rounded-2xl`)
- Encabezado: `px-6 pt-6 pb-9 w-full border-b border-[rgba(245,245,245,0.25)]`
- Filas: `px-6 py-6 flex items-center gap-4 w-full` con `<button type="button">` clickeable
- Radio circle: `<span>` con borde blanco y punto interior blanco cuando seleccionada (reemplaza `<input type="radio">`)
- Nombre: `text-xl font-medium text-white`; precio: `text-xl font-bold text-white ml-auto`; Gratis si precio === 0
- Sin afor
- Divisor: `h-px bg-[rgba(245,245,245,0.25)] mx-6` entre filas
- CTA inferior: `px-6 py-4 flex items-center justify-between gap-4 border-t border-[rgba(245,245,245,0.25)]` con texto `text-[#F5F5F5] text-base font-semibold` + boton "Reservar" `w-[150px] rounded-lg bg-[#F5F5F5] text-black py-3 px-6 flex items-center justify-center gap-2.5 font-semibold` con MessageCircle
- Sin stepper de cantidad ni "Total a pagar"
- Entrada gratuita y Evento finalizado: solo contenedor `bg-[#101010] rounded-lg`

**5. Columna derecha — refeateada**
- Titulo: `text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white`
- Ubicacion: `text-2xl font-semibold text-[#DFDFDF]`
- Fecha/hora: `text-xl font-semibold text-[#FA8B1C]` (antes `text-[#FF8E1C]`), separador `<span class="w-[7px] h-[7px] rounded-full bg-[#FA8B1C]">`, "hasta" en `text-white/40`
- Info rows: `text-base font-semibold text-[#DFDFDF]` con iconos `text-[#DFDFDF]`
- "Reportar evento": `bg-[#222] rounded-lg px-3 py-2 flex items-center gap-2.5`, Flag + texto `text-[#F5F5F5] font-semibold text-base`
- Acerca del evento: titulo `text-2xl font-semibold text-white`; parrafo `text-base text-[#DFDFDF] leading-relaxed line-clamp-3`
- Organizador: stats segmentadas con `<span class="h-px w-[35px] bg-[rgba(245,245,245,0.25)]">` entre columnas, redes en `text-[#DFDFDF]`, avatar + "Seguir" a la derecha en columna
- Artistas del cartel: `text-2xl font-semibold`; filas con `w-[52px] h-[52px]` avatar circular, boton `w-[75px] shrink-0 rounded-lg border border-[#DFDFDF] py-2 px-3`
- FAQ: `rounded-lg border border-[rgba(245,245,245,0.25)] overflow-hidden`; ChevronRight con `rotate-90` cuando abierto; `h-px bg-[rgba(245,245,245,0.25)] mx-4` divisores

**6. Nueva seccion "Reseñas de eventos pasados"**
- Titulo: `text-2xl font-semibold text-white`
- Subtitulo: `text-sm text-white/50` "Reseñas de los eventos que ya finalizo {nombre}"
- Fetch: `GET /organizadores/${orgId}/resenas?soloPasados=true` al cargar el evento
- Estados: loading (spinner), error (texto `text-white/40`), vacio ("Aún no hay reseñas de eventos pasados.")
- Contenedor `overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]` para scroll horizontal sin scrollbar
- ReviewsCarousel con `w-[300px] md:w-[340px]` por tarjeta
- Boton "Agregar reseña" para usuario logueado en evento pasado

### Verificacion

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ |
| `frontend/` | ✓ | 5 errores preexistentes (setState in effect, incluye el nuevo en eventos/[id]/page.tsx l.118) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesion)
- 5 errores de lint `setState in effect` (eventos/[id]/page.tsx l.118, mapa/page.tsx, perfil/[id]/page.tsx, explorar-view.tsx, auth-context.tsx)
- ~42 warnings de `<img>` en admin y frontend

---

## Punto final actual — 8 ajustes UI: mapa card, slider CLIENTES, footer 3 modos, avatar, navbar activo, eventos finalizados, autoplay (2026-09-11)

### Alcance

8 refinamientos UI independientes en `frontend/`.

### Cambios realizados

**1. Mapa floating card — Ver rutas separado del Link (`mapa/page.tsx`)**
- `<Link>` ahora envuelve SOLO imagen + info (título, fecha, ubicación, badge precio)
- Acciones extraídas como hermanos posicionados: botón X (`e.preventDefault + e.stopPropagation`, `z-50`), HeartButton + ShareButton + botón "Ver rutas" (`flex-1` en fila)
- "Ver rutas" con `type="button"`, `e.preventDefault(); e.stopPropagation()` y `disabled` cuando no hay ubicación
- X button: `z-50` y `e.preventDefault(); e.stopPropagation()` para no navegar

**2. CLIENTES — animación condicional (`inicio-view.tsx`)**
- Si `organizadores.length > 10`: marquee infinito duplicado con `animate-[marquee_40s_linear_infinite]`
- Si `organizadores.length <= 10`: layout estático `flex flex-wrap items-center justify-center gap-8`, sin duplicación ni animación
- Empty state "No hay organizadores disponibles" sin cambios

**3. Footer — 3 modos según pathname (`footer.tsx`)**
- `completo` (`/`, `/inicio`, `/login`, `/register`): descripción + email + links + círculo giratorio + texto gigante "HASTA LA VUELTA"
- `sin-marca` (todas las demás rutas públicas como `/explorar`, `/mapa`, `/eventos/*`): descripción + email + links + círculo giratorio, SIN texto gigante
- `mini` (`/perfil`, `/host`, `/organizaciones`): solo barra de copyright
- Implementación: variable `modo` ('completo' | 'sin-marca' | 'mini'), sin duplicar JSX

**4. Footer texto gigante — positioning (`footer.tsx`)**
- Contenedor: `relative mt-16 text-center md:mt-24 h-[140px] overflow-hidden`
- `<h2>`: `absolute inset-x-0 -bottom-[120px] pointer-events-none select-none`
- `overflow-hidden` recorta la mitad inferior del texto (solo asoma la mitad superior)
- Círculo giratorio con `z-10` y flecha `/login` clicable por encima

**5. Avatar perfil 8px más pequeño (`avatar.tsx`)**
- `profile`: `h-[126px] w-[126px] text-[2.4rem]` → `h-[118px] w-[118px] text-[2.2rem]`
- Tamaños `xl` (80px) y demás sin cambios

**6. Navbar activo — Explorar/Mapa con borde (`usuario-nav.tsx`)**
- `usePathname` importado de `next/navigation`
- Links escritorio: `pathname.startsWith('/explorar')` → `border border-white text-white`; inactive → `border border-transparent text-white/70`
- Links mobile menu: mismo criterio de activo con borde
- Padding constante `px-3 py-1 rounded-md` en ambos estados para evitar saltos de layout

**7. Eventos pasados — filtro corregido (`host/[slug]/page.tsx`)**
- `proximosEventos`: `estado === 'aprobado' && fechaFin >= ahora`
- `pasadosEventos`: `estado === 'finalizado' || (estado === 'aprobado' && fechaFin < ahora)`
- Eliminada variable `eventosAprobados` innecesaria

**8. Autoplay slider — 5000ms → 3000ms (`explorar-view.tsx`)**
- Intervalo de autoplay del banner: `5000` → `3000` ms
- Pausa en hover y comportamiento existente sin cambios

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 4 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint `setState in effect` (`mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~41 warnings de `<img>` en admin y frontend

---

## Punto final actual — Mapa bottom sheet, filtros móvil agrupados, card unification (2026-09-09)

### Alcance

3 refinamientos UI: bottom sheet del mapa en móvil, panel de filtros agrupado en móvil, y unificación visual de cards.

### Cambios realizados

**1. Mapa bottom sheet en móvil (`mapa/page.tsx`)**
- `renderMobileOverlay()`: `fixed inset-0 z-50` → `fixed inset-x-0 bottom-0 z-40 max-h-[75%] rounded-t-2xl border-t border-white/10 bg-[#101010] shadow-2xl overflow-y-auto`
- Header con drag handle centrado (w-8 h-1 bg-white/20), "Ocultar" + X a la derecha, clic fuera cierra
- Overlay oscuro `fixed inset-0 z-30 md:hidden` con `onClick={() => setMobileRutasOpen(false)}`

**2. Filtros móvil agrupados (`event-filters.tsx`)**
- Import `SlidersHorizontal` añadido
- Desktop: `[buscador][distancia][precio][fecha]` con dropdowns individuales (clase `hidden md:flex`)
- Mobile (`md:hidden`): botón `[SlidersHorizontal] Filtros` que abre panel absoluto `bg-[#1a1a1a] border border-white/10 rounded-lg p-4`
- Panel con 3 secciones apiladas (Distancia / Precio / Fecha) con `renderDistanciaControl()`, `renderPrecioControl()`, `renderFechaControl()` helper functions
- "Limpiar filtros" dentro del panel mobile
- `mobileFiltersRef` para click-outside cierra el panel

**3. Card unification (`inicio-view.tsx`)**
- Badges: `rounded-full` → `rounded-lg` en Gratis
- Date color: `text-[#FF8E1C]` → `text-[#F59E0B]`
- Heart/share: envolvente `flex flex-col gap-2` en el div derecho
- Cards en explorar-view y profile-event-card ya tenian los estilos correctos (verificados)

**4. Fix fragment en host-nav (`host-nav.tsx`)**
- Return con múltiples siblings (`<nav>` + mobile overlay) envuelto en `<>...</>` Fragment
- Error de build: "Expected ',', got '{'" causado por JSX sin fragment wrapper

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ |
| `frontend/` | ✓ | 4 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint `setState in effect` (`mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~40 warnings de `<img>` en admin y frontend

---

## Punto final actual — Optimizaciones UI: botones灰色的 фон, sponsor en slider, card mapa navegable, fondo hero, slider organizadores, sticker estrella (2026-09-09)

### Alcance

Siete refinamientos de UI: estilo unificado de botones de like/share, ajuste de posición de imagen del hero, badge de organizador en slider, card flotante del mapa navegable, fondo del hero con imagen opaca y borrosa, slider infinito de organizadores en CLIENTES, y sticker de estrella en lugar de asterisco.

### Cambios realizados

**1. Botones de like y share con fondo gris borroso y rounded-full**
- `heart-button.tsx`: fondo `bg-white/10 backdrop-blur-md hover:bg-white/20`, `sm: w-8 h-8`, `md: w-10 h-10` (quitado `bg-black/45`)
- Share buttons: `bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full` en explorar-view.tsx (grid cards), inicio-view.tsx (ENCUENTRA), profile-event-card.tsx, eventos/[id]/page.tsx (detail hero, `rounded-lg` → `rounded-full`), mapa/page.tsx (floating card)
- "Ver rutas" del panel de rutas en mapa NO se tocó

**2. Imagen derecha del hero unos px más a la izquierda**
- `explorar-view.tsx`: `right-[6%]` → `right-[8%]` para la caja de imagen del evento destacado en el slider

**3. Sponsor/organizador en esquina superior derecha del slider**
- `eventos.service.ts` (listar): SQL JOIN con tabla `usuarios org` y columnas `org.nombre AS "organizadorNombre"`, `org.foto_perfil_url AS "organizadorFotoPerfilUrl"`
- `EventItem` en `types/index.ts`: añadidos campos opcionales `organizadorNombre: string | null` y `organizadorFotoPerfilUrl: string | null`
- `explorar-view.tsx`: dentro del `<Link>` del hero, div `absolute top-4 right-4 z-20` con foto del organizador (max-w-[96px] h-16 object-cover) o nombre en mayúsculas con `font-clash text-[18px] uppercase`

**4. Card flotante del mapa navega al detalle**
- `mapa/page.tsx`: card envuelta en `<Link href={/eventos/${selectedEvent.id}}>` con `cursor-pointer`; botón X movido fuera del Link con `z-40` y `top-6 right-6`; botón "Ver rutas" con `e.stopPropagation()` añadido; `HeartButton` y share button ya manejan stopPropagation internamente

**5. Fondo del hero con imagen opaca y borrosa**
- `explorar-view.tsx` (hero): fondo siempre existe — con imagen: `bg-cover bg-center blur-[6px] opacity-60`; sin imagen: `radial-gradient(50% 50% at 50% 50%, rgba(87, 35, 126, 0.89) 0%, #000 97.12%)`; overlay `bg-gradient-to-t from-black via-black/50 to-black/20` se mantiene encima

**6. CLIENTES: slider infinito de organizadores**
- Backend: `GET /organizadores` en `organizaciones.controller.ts` + `organizaciones.service.ts` (`listOrganizadores`) devuelve `publicUsuario[]` de usuarios con `rol: 'organizador'`
- Frontend: `organizadores` state + `useEffect` para fetch; marcae infinito con `@keyframes marquee` (40s linear) en `globals.css`; contenedor `overflow-hidden`, items duplicados 2× para loop infinito; cada organizador: foto (h-10 w-auto object-cover) o nombre en `font-clash text-[18px] uppercase`
- Eliminado `const sponsors` estático

**7. Sticker de estrella en lugar del asterisco con círculo**
- `inicio-view.tsx`: reemplazado círculo con `Asterisk` por SVG sticker de estrella de 5 puntas (viewBox 0 0 92 92, clipPath para la forma de estrella, fondo transparente, sin fondo ni borde); posición absoluta `-bottom-5 -right-4` preservada; `Asterisk` eliminado del import de lucide-react

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ (Nest 11) |
| `frontend/` | ✓ | 4 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint `setState in effect` (`mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~38 warnings de `<img>` en admin y frontend

---

## Punto final actual — Footers por vista, outline en cards/slider, consistencia visual, corrección de reseñas de organizadores, z-index de redes sociales, filtros del mapa y flecha del footer a login (2026-09-08)
- La vista del dueño (`host/[slug]/resenas/page.tsx`) no se tocó

**5. Enlaces de redes sociales con z-index más alto y clicables**
- Slider `explorar-view.tsx` (banner): contenedor de botones Facebook/Instagram/Globe con `relative z-20`; convertidos a `<a href="#">` con `e.preventDefault(); e.stopPropagation()` para bloquear navegación del Link padre
- Detalle de evento `eventos/[id]/page.tsx`: iconos de redes sociales del organizador (Facebook/Instagram/Globe) convertidos a `<a href={url} target="_blank" rel="noreferrer">` con `relative z-20 inline-flex hover:text-white` y `onClick` que previene la navegación del `<Link>` contenedor

**6. Filtros del mapa iguales a Explorar**
- `mapa/page.tsx`: añadidos `hasActiveFilters` y `clearAllFilters` (misma lógica que `explorar-view.tsx`) y pasados como `mostrarLimpiar` y `onLimpiar` al componente `EventFilters`
- Encabezado, contador, fila de filtros y scroll horizontal de categorías visualmente idénticos a Explorar

**7. Flecha del footer: clic → /login; sin girar; sin fondo/borde**
- Badge circular (flecha) ahora envuelto en `<Link href="/login">` → clic navega a login
- La flecha (`ArrowRight`) es estática: solo el SVG del texto circular tiene `animate-[spinText_18s_linear_infinite]`; el div central se queda con `static -rotate-45`, sin `animate-spin-text`, sin fondo, sin borde
- La clase `animate-spin-text` en el `<svg>` (no en el div del icono)

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | — | ✓ | ✓ (Nest 11) |
| `frontend/` | ✓ | 4 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint `setState in effect` (`mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~38 warnings de `<img>` en admin y frontend

---

## Punto final actual — Cards estáticas sin animación, placeholder sin iniciales, footer con SVG giratorio (2026-09-08)

### Alcance

Quitar la animación hover de las cards de evento (manteniendo el zoom lento en el fondo), eliminar las iniciales del placeholder, y rediseñar el footer con un elemento SVG circular giratorio.

### Cambios realizados

**1. Cards sin animación de hover; fondo con zoom lento infinito**
- Removido `transition-transform duration-300 hover:scale-[1.02]` de todos los `<article>` de cards de evento en `explorar-view.tsx`, `inicio-view.tsx`, `profile-event-card.tsx`
- Animación lenta aplicada al fondo (img o placeholder) con `animate-slow-zoom` (18s ease-in-out infinite)
- globals.css: `@keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.05); } }` + `.animate-slow-zoom`

**2. Placeholder sin iniciales**
- Eliminado el `<span>` con las iniciales del título en `event-image-placeholder.tsx`
- El componente ahora solo muestra el degradado radial de fondo, sin texto centrado

**3. Footer con SVG circular giratorio**
- Columna izquierda: descripción + email + navegación (Explorar, Mapa)
- Elemento circular derecho (200x200px, `hidden md:flex`): SVG con texto circular "Únete y sé parte de lo que todos comentarán •" girando con `@keyframes spinText` (18s linear infinite) + flecha ArrowRight centrada con rotate -45° y borde circular
- Texto "HASTA LA VUELTA" reposicionado con `position: absolute` y `inset-x-0 -bottom-[120px]` (recortado por `overflow-hidden` del footer)
- globals.css: `@keyframes spinText { to { transform: rotate(360deg); } }` + `.animate-spin-text`

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 4 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint `setState in effect` (`mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~35 warnings de `<img>` en admin y frontend

---

## Punto final actual — Ajustes globales: tipografía, badges pastel, slider, redes sociales, filtros (2026-09-08)

### Alcance

Ajustes globales de diseño: tipografía unificada a Inter, badges con paleta pastel y blur, slider del banner con autoplay, iconos de redes sin fondo, filtros simplificados, y degradado radial uniforme en cards.

### Cambios realizados

**1. Iconos de redes sociales sin fondo (`explorar-view.tsx`, `eventos/[id]/page.tsx`)**
- Banner de explorar: `<button>` con `text-white/60 hover:text-white transition-colors` (sin w-9 h-9 rounded-lg bg-white/10)
- Redes del organizador en detalle de evento: `<span>` simple con `text-white/60 hover:text-white transition-colors`

**2. Flechas del slider (`explorar-view.tsx`)**
- `rounded-lg` → `rounded-full` en los botones prev/next del banner

**3. Slider con autoplay + fade**
- `setInterval` cada 5 s avanza `bannerIndex` en bucle (solo si `upcomingEvents.length > 1`)
- Pausa en hover: `onMouseEnter`/`onMouseLeave` controlar el intervalo
- Fade animation: `animate-fade-in` (0.6s ease) + `@keyframes fadeIn` en globals.css

**4. Banner clicable → detalle (`explorar-view.tsx`)**
- Contenido del evento (blur bg + texto + imagen) envuelto en `<Link href={/eventos/${featuredEvent.id}}>` con `z-10 cursor-pointer`
- Flechas prev/next con `e.preventDefault(); e.stopPropagation()` y `z-30` por encima del enlace

**5. Títulos de cards en Inter (quitar font-clash)**
- Cards: `explorar-view.tsx:card title`, `profile-event-card.tsx:183`, `inicio-view.tsx:265`, `mapa/page.tsx:837`, `event-image-placeholder.tsx:56`
- Todos los headings y textos de sección ahora usan Inter por defecto

**6. Filtros sin iconos (`event-filters.tsx`)**
- Eliminado `MapPin` del botón Distancia
- Solo `ChevronsUpDown` como flecha desplegable en los 3 botones

**7. Like y share del mismo tamaño (`heart-button.tsx`)**
- `size="sm"`: `w-7 h-7` → `w-8 h-8` (igual que Share2 en cards)

**8. Cards con degradado radial único**
- `event-image-placeholder.tsx`: `backgroundColor: bgColor` → `background: radial-gradient(50% 50% at 50% 50%, rgba(87, 35, 126, 0.89) 0%, #000 97.12%)`
- Article de cards: mismo radial gradient como fondo base (antes del imagen)

**9. Badges pastel con blur (paleta de 6 colores + backdrop-blur-[3.35px])**
- Verde `#EAF9E3` / `#16803C` → Gratis, activo, visible, aprobado, confirmada, público
- Azul `#E3E7F9` / `#2B3A8F` → En línea, verificada
- Rojo `#FFD7D9` / `#9E1B32` → cancelado, rechazado, suspendido, invalidada, reportada
- Amarillo `#FFF1CA` / `#8A6D00` → pendiente, borrador
- Lila `#E9D8FF` / `#6B21A8` → organizador
- Naranja `#FFE4D3` / `#9A4A00` → proximamente, a la venta, agotado
- Aplicado en: `badge.tsx`, `estado-badge.tsx` (admin), `explorar-view.tsx`, `profile-event-card.tsx`, `inicio-view.tsx`, `mapa/page.tsx`

**10. Tipografía: todo Inter excepto 6 textos conservan font-clash**
- globals.css: `@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }` + `.animate-fade-in`
- Eliminada clase `font-clash` en TODOS los archivos de `frontend/src` y `frontend/admin`
- Excepciones que conservan font-clash (7 textos):
  - `footer.tsx:40` — "HASTA LA VUELTA" (watermark)
  - `inicio-view.tsx:138` — "DESCUBRE"
  - `inicio-view.tsx:152` — "LO QUE PASA"
  - `inicio-view.tsx:207` — "ENCUENTRA TU PRÓXIMA EXPERIENCIA"
  - `inicio-view.tsx:283` — "CLIENTES"
  - `inicio-view.tsx:287` — "Name Sponsor"
  - `inicio-view.tsx:317` — "¿TIENES UN EVENTO QUE ORGANIZAR?"

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 4 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |
| `frontend/admin/` | ✓ | 0 errores (9 warnings `<img>`) | ✓ (Next 16, 17 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint `setState in effect` (`mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~34 warnings de `<img>` en admin y frontend

---

## Punto final actual — Consistencia de cards, reseñas en pestaña, responsive, avatar, filtro Explorar (2026-09-08)

### Alcance

Unificación visual de las cards de evento en perfil (propio, visitado, organizador), mejoras de responsive y reordenamiento del filtro de Explorar.

### 1. ProfileEventCard rediseñada (`frontend/src/components/profile/profile-event-card.tsx`)

Card replicada exactmente al diseño de Explorar:
- `<Link>` envolviendo todo el card con `<article className="relative aspect-[3/4] rounded-xl overflow-hidden hover:scale-[1.02]">`
- Imagen/placeholder `absolute inset-0 w-full h-full object-cover`
- Gradiente inferior `bg-gradient-to-t from-black via-black/30 to-transparent`
- Badges arriba-izquierda: `Online = bg-blue-600`, `Gratis = bg-[#3DC069]`
- Acciones arriba-derecha (`top-3 right-3 z-10 flex gap-2`): visitante → HeartButton + botón compartir circular; dueño → ⋮ MoreHorizontal con menú (Editar/Ocultar/Mostrar/Eliminar)
- Pie sobre imagen: `text-[#F59E0B] text-sm font-medium` fecha • hora; título `text-white text-base font-bold font-clash line-clamp-2 min-w-0`; `Desde $X` en `text-white/60 text-xs`
- Sin zona inferior fuera de la imagen

### 2. Reseñas solo en pestaña "Reseñas" (`frontend/src/app/host/[slug]/page.tsx`)

- Eliminado bloque `showPastReviews` con `ReviewsCarousel` de "Eventos pasados"
- Import de `ReviewsCarousel` eliminado (evita error de lint por import sin uso)
- Pestaña "Reseñas" en 2 columnas: `grid grid-cols-1 gap-4 sm:grid-cols-2` con `h-full` en cada reseña

### 3. Grids unificados (responsive 1 columna en móvil)

- `perfil/page.tsx:286`: `grid-cols-2 lg:grid-cols-4` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- `perfil/[id]/page.tsx:179`: mismo cambio
- `host/[slug]/page.tsx`: mismo cambio

### 4. Avatar de perfil (`frontend/src/components/ui/avatar.tsx`)

- `profile`: `h-[130px] w-[130px]` → `h-[126px] w-[126px]`

### 5. Filtro de Explorar (`frontend/src/components/eventos/event-filters.tsx`)

Orden final de arriba a abajo:
- Fila única `[buscador flex-1 min-w-[220px]][distancia][precio][fecha]` con `flex flex-wrap items-center gap-3` (en móvil hace wrap)
- Chips categorías con scroll horizontal: `flex flex-nowrap gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`, chips `shrink-0`
- Botón "Limpiar filtros" debajo a la derecha: `flex justify-end mt-2 text-sm text-white/60 underline underline-offset-4 hover:text-white`
- Props opcionales añadidas: `mostrarLimpiar?: boolean`, `onLimpiar?: () => void`

### 6. Explorar-view (`frontend/src/components/home/explorar-view.tsx`)

- Eliminado botón "Limpiar filtros" de la fila del contador
- Pasados `mostrarLimpiar={hasActiveFilters} onLimpiar={clearAllFilters}` a EventFilters

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 4 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint `setState in effect` (`mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~34 warnings de `<img>` en admin y frontend

---

## Punto final actual — Flujo de rutas en el mapa: sidebar, polilíneas y modo móvil (2026-09-07)

### Alcance

Implementación completa del requisito de navegación de rutas en el mapa (`mapa/page.tsx`): sidebar con estados internos `lista | rutas | detalle`, polilíneas en el mapa, y overlay en móvil. La card flotante existente queda intacta salvo el botón "Ver rutas" que ahora activa el flujo.

### Backend — `GET /api/rutas` extendido (G13)

**`api/src/geo/geo.service.ts`:**
- `calcularRuta()` existente: agrega `steps=false&alternatives=false` (sin cambios de respuesta).
- Nuevo método `calcularRutasConPasos()`: `steps=true&alternatives=true` (hasta 3 rutas por modo), devuelve `RutaDetallada[]` con `id`, `modo`, `distanciaKm`, `duracionMin`, `geometria`, `via`, `titulo`, `etiqueta`, `pasos[]`.
- `generarLinksCompartir()`: params opcionales `origenLat`, `origenLng`, `travelmode`; si se pasan, `googleMaps` devuelve link de directions en vez de search.

**`api/src/geo/geo.controller.ts`:**
- `GET /rutas?detallado=true` → `{ rutas: RutaDetallada[] }`.
- `GET /compartir` acepta `origenLat`, `origenLng`, `travelmode` (walking/driving).

**Derivación de `RutaDetallada`:**
- `titulo`: primera calle (`c1`); si hay segunda distinta (`c2`) → "Desde {c1} y {c2}".
- `via`: name del step con mayor distance.
- `etiqueta`: la más corta = "La ruta más rápida ahora", la más larga = "La ruta más larga", intermedias = "Alternativa". Una sola = "La ruta más rápida ahora".
- `pasos`: cada step → `{ accion: type-modifier, calle: step.name, distanciaM, duracionS }`.

### Frontend — Sidebar con navegación interna (`mapa/page.tsx`)

**Estados agregados:** `sidebarView`, `rutas[]`, `routeModo` (todo/caminando/vehiculo), `routeSort` (distancia/tiempo), `rutaActiva`, `rutasLoading`, `rutasError`, `mobileRutasOpen`.

**Vista `rutas`:**
- Filtros: botones/pills Todo · A pie · Vehículo y orden Por distancia / Por tiempo (el activo resaltado).
- Tarjetas: ícono Route + título + etiqueta + "ver detalles" + tiempo a la derecha.
- Sin `userLocation` → botón "Ver rutas" deshabilitado con mensaje "Activa tu ubicación".
- Errores y 429: `console.error` + mensaje visible.

**Vista `detalle`:**
- Desde/Hasta, separador, duración+distancia + botón compartir (navigator.share con fallback clipboard).
- Vía {via}, etiqueta.
- Pasos turn-by-turn: mapeo accion→ícono+texto (depart→Navigation/Sal, straight→ArrowUp/Continúa recto, turn-left→CornerUpLeft/Gira a la izquierda, etc., arrive→MapPin/Llegaste a tu destino).
- Distancia: <1000 → {x}m, si no → x,xkm.

**Card flotante (`mapa/page.tsx`):**
- El botón "Ver rutas" (antes `<Link>`) ahora es `<button>` que llama `handleVerRutas()`.
- En desktop: fuerza `sidebarOpen=true` + `sidebarView='rutas'`.
- En móvil (`<768px`): abre overlay `mobileRutasOpen`.

**Mobile overlay (`<768px`):**
- Panel `fixed inset-0 z-50 bg-black overflow-y-auto` con las vistas 'rutas' y 'detalle'.
- "Volver" desde 'rutas' cierra el overlay.
- Botón cerrar X en la parte superior.

### Frontend — Polilíneas (`event-map.tsx`)

**Nuevo:** componente `RoutePolylines` que renderiza `<Polyline>` de react-leaflet.
- Polyline inactiva: `color: '#ffffff'`, `weight: 2`, `opacity: 0.25`.
- Polyline activa: `color: '#7DD3FC'`, `weight: 4`, `opacity: 0.9`.
- Conversión `[[lng,lat],...]` → `[[lat,lng],...]` con `Number()` + descarte de pares no finitos.
- Props nuevas en `EventMap`: `rutasGeometrias?: { id: string; coordenadas: [number, number][] }[]` y `rutaActivaId?: string`.
- Polilíneas se limpian al volver a `sidebarView='lista'`.

### Frontend — Tipos (`types/index.ts`)

- `RutaPaso`: `{ accion, calle, distanciaM, duracionS }`.
- `RutaDetallada`: `{ id, modo, distanciaKm, duracionMin, geometria, via, titulo, etiqueta, pasos }`.

### Verificación

| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | ✓ | ✓ | ✓ |
| `frontend/` | ✓ | 4 errores preexistentes (setState in effect) | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint `setState in effect` (`mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~35 warnings de `<img>` en admin y frontend

---

## Punto final actual — Reseñas: sanitización, carga por slug y render robusto (2026-09-07)

### Correcciones

**1. Carga de perfil por slug (`perfil/[id]/page.tsx`):**
- Si `params.id` no es numérico (`/^\d+$/`), primero llama `GET /usuarios/slug/${params.id}` para resolver el ID numérico, luego usa `GET /usuarios/perfil/${resolvedId}`.
- Si es numérico, usa directamente `GET /usuarios/perfil/${id}`.
- `resolvedId` se setea con el valor numérico resuelto para usar en follow/siguiendo.

**2. Sanitización de datos sensibles en API (`eventos.service.ts` `detail()`):**
- `resenas[].autor` ahora solo devuelve `{ id, nombre, apellido, slug, fotoPerfilUrl }` — sin email, telefono, passwordHash, deletedAt, u otros campos internos.
- `organizador` usa `publicUsuario()` que solo expone campos públicos: id, nombre, apellido, slug, fotoPerfilUrl, fotoPortada, biografia, etiqueta, redesSociales, rol, estado, perfilActivo, createdAt.
- Sin datos sensibles en el endpoint público.

**3. Render robusto de reseñas (`reviews-carousel.tsx` y `host/[slug]/page.tsx`):**
- `estado === 'visible'` filtrado en frontend (además del filtro del backend).
- Autor: `autorHref = autor?.slug ?? autor?.id` — usa slug si existe, si no el id.
- Si no hay `autorHref` ni nombre, muestra "Usuario" sin link.
- `puntuacion`: `Number(resena.puntuacion?.toFixed(1))` con guard `puntuacion > 0` antes de renderizar estrellas.
- `comentario` y `evento.titulo` renderizan solo si existen.
- Fallback seguro en avatar fallback: `${autor.nombre?.[0] ?? ''}${autor.apellido?.[0] ?? ''}`.toUpperCase() || '?'

### Archivos modificados
- `frontend/src/app/(usuario)/perfil/[id]/page.tsx` (+ carga por slug en useEffect)
- `frontend/src/components/resenas/reviews-carousel.tsx` (completo reescrito con guards)
- `frontend/src/app/host/[slug]/page.tsx` (+ guards en map de reseñas)
- `api/src/eventos/eventos.service.ts` (+ import withoutPassword, sanitización en detail())

### Verificación
| Componente | typecheck | build |
|---|---|---|
| `api/` | ✓ | ✓ |
| `frontend/` | ✓ | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint preexistentes (`setState` en `useEffect` en `mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~34 warnings de `<img>` en admin y frontend (preexistentes)

---

## Punto final actual — Bug fix: navbar estático en /host/[slug] (2026-09-07)

### Bug corregido

**Navbar cambiaba al visitar perfil de organizador (visitante sin sesión):**
- Causa: `host/[slug]/layout.tsx` renderizaba `<HostNav />` de forma **incondicional** en el render normal (línea 132), sin verificar `isOwner`. Todos los visitantes de cualquier `/host/[slug]` veían el navbar de organizador.
- Fix: cambiar `{isOwner ? <HostNav /> : <UsuarioNav />}` — ahora `HostNav` solo se muestra cuando el usuario es EL dueño de ese perfil específico (`user.rol === 'organizador' && user.slug === slug`).

**Regla del navbar estático (crítica):**
En `frontend/`, para todo usuario externo, visitante sin sesión, o usuario normal con sesión iniciada, el navbar es SIEMPRE `UsuarioNav` en TODAS las rutas, incluso al visitar `/host/[slug]`. `HostNav` (modo organizador) solo se muestra cuando `isOwner` es `true` (usuario autenticado + rol organizador + slug coincide). Si al navegar el navbar cambia en cualquier ruta pública, el trabajo está mal y debe rehacerse desde la tarea 1.

### Verificación
| Componente | typecheck | build |
|---|---|---|
| `api/` | ✓ | ✓ |
| `frontend/` | ✓ | ✓ (Next 16, 26 rutas) |

---

## Punto final actual — Navbar por rol: 3 modos estáticos (2026-09-07)

### 3 modos de navegación

**Modo 3 — UsuarioNav (`usuario-nav.tsx`):** único navbar para todas las rutas públicas de `frontend/`, incluyendo `/perfil/[id]` y `/host/*` como visitante. Mismos elementos siempre: logo (enlace a /inicio) + Explorar + Mapa + Crear evento + botón Iniciar sesión (invitado) o dropdown de perfil (logueado). No cambia según la ruta.

**Modo 1 — HostNav (`host-nav.tsx`):** uso exclusivo del propietario del área organizador (isOwner). Logo estático (sin `<Link>`) + Crear evento + campana + dropdown de perfil. Sin Explorar, sin Mapa, sin ramas de invitado. Altura `h-[72px]`.

**Modo 2 — Admin (`admin-layout.tsx` + `admin-sidebar.tsx`):** logo estático sin enlace en el header + botón toggle PanelLeft junto al logo para ocultar/expandir el sidebar. Sidebar con `open` state, `pl-64` / `pl-0` según estado. Dropdown de perfil con Editar perfil y Cerrar sesión.

### Cambios

**`host-nav.tsx`:** reescrito para modo 1 exclusivo. Logo como `<div>` estático, eliminados Explorar/Mapa y todas las ramas de invitado ("Iniciar sesión"/"Registrarse", link a /perfil). Solo Crear evento + campana + dropdown. Props simplificadas: solo `slug` (sin `isOwner`).

**`host/[slug]/layout.tsx`:** importa `UsuarioNav`. Líneas 101 y 113 (notFound y loading) usan `UsuarioNav`. En el render normal, la línea 132 usa `{isOwner ? <HostNav /> : <UsuarioNav />}` — `isOwner` requiere que `user` esté autenticado, tenga `rol='organizador'` y `slug` coincida. Esto asegura que un visitante sin sesión SIEMPRE vea `UsuarioNav`, y solo el dueño de la zona vea `HostNav`.

**`admin-sidebar.tsx`:** elimina el logo del sidebar (se mudó al header). Acepta prop `open` para controlar visibilidad; si `open=false` no renderiza nada.

**`admin-layout.tsx`:** estado `sidebarOpen` (default true). Logo estático en el header con `img` (sin `<Link>`). Botón `PanelLeft` junto al logo para toggle. `pl-64` / `pl-0` en el wrapper según `sidebarOpen`. Dropdown de perfil intacto.

**`navbar.tsx`:** eliminado (no tenía imports en ninguna ruta).

### Verificación
| Componente | typecheck | build |
|---|---|---|
| `api/` | ✓ | ✓ |
| `frontend/` | ✓ | ✓ (Next 16, 26 rutas) |
| `frontend/admin/` | ✓ | ✓ (Next 16, 17 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint preexistentes (`setState` en `useEffect` en `mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~34 warnings de `<img>` en admin y frontend (preexistentes)
- Warnings de React Hook Form `watch()` en `perfil/page.tsx` y `host/[slug]/configuracion/editar/page.tsx` (preexistentes)

---

## Punto final actual — Navbar, compartir, reportar evento (2026-09-07)

### Correcciones

**1. Navbar del perfil organizador (`host-nav.tsx`):**
- Altura unificada a `h-[72px]` (antes `h-16` / 64px)
- Logo + Explorar + Mapa agrupados a la izquierda (`gap-12` entre logo y links, patrón de `usuario-nav.tsx`)
- Lado derecho: "Crear evento" (solo isOwner), campana, avatar/dropdown para sesión iniciada; botones "Iniciar sesión"/"Registrarse" para invitados
- Estructura consistente logueado y sin sesión

**2. Botón compartir en cards de eventos (`frontend/src/lib/share.ts`):**
- Nuevo helper `compartirEvento({ id, titulo })`: usa `navigator.share` si existe, si no copia la URL al portapapeles
- Cableado en 5 lugares: `inicio-view.tsx`, `explorar-view.tsx`, `mapa/page.tsx`, `eventos/[id]/page.tsx`, y `ProfileEventCard` (este ya tenía `onShare`, ahora se pasa desde `perfil/page.tsx`, `perfil/[id]/page.tsx`, `host/[slug]/page.tsx`)

**3. Reportar evento (backend + frontend):**
- Backend (`reportes.service.ts`): al reportar, carga el evento y el usuario reportero; crea notificación para el organizador (tipo `reporte_evento`, mensaje con título del evento y datos del reportero) y una notificación por cada admin activo
- Backend (`reportes.module.ts`): importa `SocialModule`, `TypeOrmModule.forFeature([Evento, Usuario])`
- Frontend (`eventos/[id]/page.tsx`): botón "Reportar evento" redirige a `/login` si no hay sesión; con sesión abre `EventActionModal` con `isDestructive=false`; al enviar llama `POST /eventos/:id/reportar`; maneja error de duplicado ("Ya has reportado este evento"); tras envío exitoso muestra "Reporte enviado" y cierra modal

### Archivos modificados
- `frontend/src/components/layout/host-nav.tsx` (completo reescrito)
- `frontend/src/lib/share.ts` (nuevo)
- `frontend/src/components/home/inicio-view.tsx` (+import compartirEvento, +handler compartir)
- `frontend/src/components/home/explorar-view.tsx` (+import compartirEvento, +handler compartir)
- `frontend/src/app/(usuario)/mapa/page.tsx` (+import compartirEvento, +handler compartir)
- `frontend/src/app/(usuario)/eventos/[id]/page.tsx` (+import compartirEvento, +handler compartir, +reportModalOpen, +reportSubmitted, +handleReportClick, +handleReportSubmit, +EventActionModal)
- `frontend/src/app/(usuario)/perfil/page.tsx` (+import compartirEvento, +onShare en ProfileEventCard)
- `frontend/src/app/(usuario)/perfil/[id]/page.tsx` (+import compartirEvento, +onShare en ProfileEventCard)
- `frontend/src/app/host/[slug]/page.tsx` (+import compartirEvento, +onShare en ProfileEventCard)
- `api/src/reportes/reportes.service.ts` (+inyección SocialService, Evento, Usuario; lógica de notificaciones en `reportar()`)
- `api/src/reportes/reportes.module.ts` (+imports SocialModule, TypeOrmModule.forFeature)

### Verificación
| Componente | typecheck | build |
|---|---|---|
| `api/` | ✓ | ✓ |
| `frontend/` | ✓ | ✓ (Next 16, 26 rutas) |

### Warnings preexistentes (no introducidos en esta sesión)
- 4 errores de lint preexistentes (`setState` en `useEffect` en `mapa/page.tsx`, `perfil/[id]/page.tsx`, `explorar-view.tsx`, `auth-context.tsx`)
- ~34 warnings de `<img>` en admin y frontend (preexistentes)
- Warnings de React Hook Form `watch()` en `perfil/page.tsx` y `host/[slug]/configuracion/editar/page.tsx` (preexistentes)

---

## Punto final actual — Fix perfil/[id] slug + Leaflet + API distance filter (2026-09-07)

### Correcciones

**1. Perfil por slug (`perfil/[id]`):**
- `api/src/usuarios/usuarios.service.ts`: `publicProfile()` ahora acepta slugs — si el parámetro no es numérico, busca por `findBySlug` primero y usa el ID resuelto.
- `frontend/src/app/(usuario)/perfil/[id]/page.tsx`: al cargar con slug, resuelve el ID numérico antes de usarlo en follow/siguiendo/redirección. Estado `resolvedId` stores el ID numérico una vez resuelto.

**2. Error Leaflet `_leaflet_pos` (`event-map.tsx`):**
- `MapUpdater`: envolvió `map.setView()` en `map.whenReady()` para esperar a que Leaflet esté inicializado.
- `ClusteredMarkers`: agregó estado `mapReady` y no posiciona marcadores hasta que el mapa esté listo.

**3. Filtro de distancia del backend (`eventos.service.ts`):**
- Cuando `radioKm` es null, la query no filtra por distancia — patrón Eventbrite/Meetup.

**4. Fallback a Quito eliminado:**
- `explorar-view.tsx` y `mapa/page.tsx`: `userLocation` inicializa en `null`. Sin ubicación, se muestran todos los eventos sin filtro.

### Errores NO corregidos (no son de nuestro código)

**`reportAllChanges` en `DomUtil.js:247`:** error de `web-vitals` / Next.js 16, ocurre en el cliente al cargar el mapa. No afecta funcionalidad. Investigado y descartado — no hay cambios en nuestro código que lo causen ni forma trivial de suprimirlo sin modificar dependencias.

### Verificación
| Componente | typecheck | build |
|---|---|---|
| `api/` | ✓ | ✓ |
| `frontend/` | ✓ | ✓ |

---

## Punto final actual — Fix 6 issues: reseñas carousel, profile links, seed data, favorites, event card menu (2026-09-07)

### Issues corregidos

**1. Reseñas carousel en detalle de evento (`eventos/[id]/page.tsx`):**
- Creado `components/resenas/reviews-carousel.tsx` con embla-carousel-react
- Reemplazado el listado antiguo de reseñas por el carousel con navegación prev/next y "Ver más" button

**2. Profile links con slug nulo (`/perfil/null` 500 error):**
-tanto `eventos/[id]/page.tsx` como `host/[slug]/page.tsx` ahora usan `r.autor.slug ?? r.autor.id` al generar links de autor

**3. Seed data - solo eventos pasados con reseñas:**
- Restructurado `seed-demo.cjs`: 6 eventos pasado (con reseñas) + 4 futuro (sin reseñas)
- Fechas: `haceDosSemanas`, `haceUnaSemana`, `haceUnMes` para eventos pasados
- Reseñas ahora referencian eventos con fechas pasadas únicamente
- Usuarios demo (Camila, Diego) ahora tienen slugs (`camilapazmino`, `diegoandrade`)

**4. Favoritos persistence con Zustand (`favorites-store.ts`):**
- Creado `lib/favorites-store.ts` con Zustand (persistido en localStorage)
- Creado `components/ui/heart-button.tsx` que usa el store globalmente
- Integración en: detalle evento (reemplazado heart manual por HeartButton), explorar, mapa, inicio

**5. Event cards en perfil organizador (host/[slug]/page.tsx):**
- `ProfileEventCard` ahora tiene dropdown menu con: Editar / Ocultar-Mostrar / Eliminar
- Callback props: `onEdit`, `onHide`, `onShow`, `onDelete`
- `EventActionModal` para ocultar/eliminar con campo `motivo` obligatorio
- Organizador no puede hacer like a sus propios eventos (sin botón corazón)

**6. Navbar navegación (`host-nav.tsx`):**
- Logo ahora es link a `/inicio`
- Agregados links "Explorar" y "Mapa" en el nav

### Backend changes

- `api.patch()` agregado a `api.ts` (ApiClient)
- `PATCH /eventos/:id/visibilidad` endpoint con `UpdateVisibilidadDto` (oculto + motivo)
- `DELETE /eventos/:id` ahora acepta query param `motivo` (cancelación)
- Columnas `motivo_oculto` y `motivo_eliminado` en `evento.entity.ts` y `schema.sql`
- `resenas.service.ts`: `list()` ahora incluye relación `evento: { id, titulo }`

### Archivos creados/modificados

- `api/src/eventos/dto/update-visibilidad.dto.ts` (nuevo)
- `api/src/eventos/dto/cancel-evento.dto.ts` (nuevo)
- `api/scripts/migrate_motivo_columns.sql` (nuevo)
- `frontend/src/lib/favorites-store.ts` (nuevo - Zustand)
- `frontend/src/components/ui/heart-button.tsx` (nuevo)
- `frontend/src/components/eventos/event-action-modal.tsx` (nuevo)
- `frontend/src/components/resenas/reviews-carousel.tsx` (nuevo)
- `frontend/src/components/profile/profile-event-card.tsx` (dropdown menu)
- `frontend/src/lib/api.ts` (+patch method)
- `frontend/src/app/(usuario)/eventos/[id]/page.tsx` (ReviewsCarousel + HeartButton)
- `frontend/src/app/host/[slug]/page.tsx` (ReviewsCarousel + action handlers)
- `frontend/src/components/layout/host-nav.tsx` (logo link + nav items)
- `api/scripts/seed-demo.cjs` (fechas restructuradas, slugs usuarios)

### Verificación
| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | ✓ | ✓ | ✓ |
| `frontend/` | ✓ | 0 errors nuevos (warnings preexistentes) | ✓ (Next 16, 25 rutas) |

## Punto final actual — Fixes post-QA del pase Figma (2026-09-07)

Corrección de bugs reales reportados por el usuario tras el pase anterior (ver sección siguiente):
- **Mapa: crash "Invalid LatLng (NaN, NaN)"** — `latitud`/`longitud` llegan como `string` del backend; el clustering sumaba strings en vez de números. Fix en `event-map.tsx`: `Number()` explícito + filtro `Number.isFinite`.
- **Mapa: tiles de CARTO pedían API key en el navegador** (aunque respondían 200 por curl — posible bloqueo por origen/extensión). Reemplazado por **Esri World Light Gray Base + Reference** (`server.arcgisonline.com`, sin key, verificado con curl), con `maxNativeZoom=16`/`maxZoom=18` para evitar tiles rotos en zoom alto.
- **`ProfileHead`**: quitado el botón "Crear evento" (no está en Figma ahí, solo el tile "+" de la grilla existe). Agregado `onStatClick` — "Seguidores"/"Siguiendo" ahora son clicables (abren `SeguidoresModal`, reconectado tras haber quedado huérfano al eliminar `/organizaciones/[id]`); el resto de stats no son clicables.
- **Perfil propio**: conectado `onEdit` (antes el botón "Editar perfil" no existía porque el handler nunca se pasaba).
- **Dropdown del organizador** (`host-nav.tsx`): agregada opción "Editar perfil".
- **Bug "organizador con guardados"**: `/perfil/[id]` tenía `activeTab` hardcodeado a `'Eventos guardados'` sin importar el tipo de perfil visitado. Fix real: si el perfil visitado es un organizador, `/perfil/[id]` redirige a `/host/[slug]` (la página correcta), en vez de intentar reusar tabs que no aplican.
- **Recarga/flash en cada navegación del área organizador**: cada subpágina (Miembros/Reseñas/Reservaciones/Configuración) volvía a pedir usuario+stats y remontaba el header. Se movió el header (`ProfileHero`+`ProfileHead`+`ProfileTabs`) a `host/[slug]/layout.tsx`, que persiste entre navegaciones del mismo slug en Next.js App Router; las páginas ahora comparten ese estado vía `components/eventos/host-context.tsx` en vez de refetchear. Eliminado `host-profile-shell.tsx` (reemplazado por el layout).

Verificado: `typecheck`+`build`+`lint` limpios en `frontend/` (0 errores nuevos).

## Punto final actual — Pixel-perfect pass vs Figma en `frontend/` (2026-09-07)

### Alcance
El usuario pidió alinear el frontend público 100% al diseño de Figma (`UI-img/`), sin usar imágenes reales (las agrega manualmente después), eliminando cualquier botón/texto que no sea parte del diseño. Trabajo basado en los 4 reportes de análisis Figma-vs-código de la sesión anterior (ver sección siguiente). Solo `frontend/` (no `frontend/admin/`).

### Hecho
- **Home** (`components/home/inicio-view.tsx`): hero corregido a "DES/CUBRE" + "LO/QUE/PASA" con degradado, collage de slots de imagen (placeholders posicionados/rotados, listos para fotos reales), sección "CLIENTES" agregada, badges Free/corazón/compartir en cards.
- **Login/Register** (`app/(usuario)/login`, `register`, `components/auth/*`): layout alineado a la izquierda (no centrado), título "Registrarse", campo "Repetir contraseña", texto legal de términos, "O regístrate con".
- **Explorar** (`components/home/explorar-view.tsx`): banner reestructurado (texto overlay abajo-izquierda, iconos Facebook/Instagram/Globe), contador destacado, heading "Eventos recientes", iconos corazón/compartir apilados, paginación cliente funcional, iconos chevron en filtros.
- **Mapa** (`components/map/event-map.tsx`, `app/(usuario)/mapa`): tiles CARTO light (basemap real, no filtro CSS), clustering por proximidad con círculos numerados, etiquetas de categoría geoposicionadas por marcador, toggle colapsar/expandir sidebar.
- **Detalle de evento** (`app/(usuario)/eventos/[id]/page.tsx`): imagen sin blend raro, texto de protección contra reventa, header reordenado (categoría/ubicación/fecha/info-etiquetas-organizador/reportar con iconos Info/Tag/Megaphone/Flag), "Leer más" en descripción, card de organizador con stats reales (fetch a `/usuarios/perfil/:id`) + redes sociales + botón Seguir funcional, botón Seguir por artista del cartel (solo si tiene `usuarioId`), FAQ con chevron `>`.
- **Perfil propio** (`app/(usuario)/perfil/page.tsx`, `components/profile/profile-hero.tsx`): agregada subida de portada (con preview real en el hero vía nuevo prop `coverUrl`), campo etiqueta, 5 campos de redes sociales, contador de biografía 0/100, badge de etiqueta en el hero, unificada la grilla de "Eventos guardados" para usar `ProfileEventCard` (antes tenía una implementación de card duplicada).
- **Perfil visitado** (`app/(usuario)/perfil/[id]/page.tsx`): también recibe `coverUrl`/`badge` reales del perfil visitado.
- Limpieza: interfaz `Localidad` duplicada en `types/index.ts` eliminada.

### Área organizador (`host/[slug]/**`)
- **Hallazgo de arquitectura:** las subpáginas (`miembros`, `resenas`, `tickets`, `configuracion`) usaban un layout plano (`HostTabs`) totalmente distinto al de la página principal (`ProfileHero`+`ProfileHead`+`ProfileTabs`) — perdían el header del perfil al navegar entre tabs. Se creó `components/eventos/host-profile-shell.tsx` (fetch de usuario+stats por slug, renderiza el mismo header) y se migraron las 4 subpáginas a usarlo.
- **Miembros** (`host/[slug]/miembros/page.tsx`): reescrita de cero. Antes era un placeholder que decía "el backend aún no expone endpoints" — **eso ya no es cierto** (`GET/POST/DELETE /organizadores/:id/miembros` existen). Ahora lista Dueño/Administradores/Miembro de organización usando los componentes `MemberCard`/`CreateMemberCard` que ya existían en el repo pero nunca se habían conectado. Crear miembro (por correo, sin buscador de usuarios registrados — no hay endpoint de búsqueda por nombre) y eliminar miembro, ambos conectados a la API real.
- **Reseñas** (`host/[slug]/resenas/page.tsx`): reescrita. No existe endpoint agregador "reseñas de todos mis eventos", así que se arma client-side: `GET /eventos/mis-eventos` + `GET /resenas?eventoId=` por cada uno (organizador tiene máx. 5 eventos activos, es barato). Búsqueda/puntuación/orden client-side. Acción "Reportar reseña" conectada a `PUT /resenas/:id/reportar`.
- **Reservaciones** (antes "Tickets"): envuelta en el shell nuevo; el label del tab pasó de "Tickets" a "Reservaciones" (`profile-tabs.tsx`) para matchear Figma. Contenido sin cambios (sigue documentando el gap real de backend: falta `GET` de reservas por evento).
- **Configuración**: reescrita con alcance real (antes redirigía a `/perfil`, que es el perfil personal, no el de la organización — error). Ahora: link a "Editar perfil" (nueva página) + "Cambiar contraseña" funcional (reusa `/auth/forgot-password`). Sin notificaciones/eliminar cuenta (sin endpoints, no se fabricaron controles falsos).
- **Nueva página `host/[slug]/configuracion/editar`**: formulario completo de perfil del organizador — foto perfil/portada (con preview real), nombre/apellido/teléfono/bio con contador, **slug editable** (`PUT /usuarios/me` ya lo soportaba), redes sociales (5 campos), ubicación alternativa (dirección/ciudad/nombre del lugar como texto — sin el picker de mapa interactivo de Figma, eso sí sería una feature nueva).
- **Página principal `host/[slug]/page.tsx`**: para visitantes ahora hay tabs reales "Próximos eventos"/"Eventos pasados"/"Reseñas" (antes mostraba un único grid sin filtrar por fecha). Tab Reseñas con rating promedio + formulario "Agregar una reseña" (`POST /organizadores/:id/resenas`, ya soportado) + botón Seguir funcional (antes no existía para visitantes). Bug encontrado y corregido: el stat "Puntuación" del visitante nunca se seteaba (quedaba en 0 siempre).
- **`/organizaciones/[id]`**: era una página completa duplicada con diseño obsoleto (no usaba `ProfileHero`/`ProfileTabs`, clases Tailwind antiguas). Reemplazada por un redirect a `/host/[slug]` (o `/perfil/[id]` si el organizador no tiene slug) — resuelve G6 del backlog de forma más completa de lo documentado (no era solo "falta un redirect", era una pantalla entera para eliminar).
- Ruta muerta `/host/[slug]/eventos` (duplicaba el tab "Eventos" de la página principal con otro diseño, nada enlazaba a ella) convertida en redirect a `/host/[slug]`.
- Componentes `HostTabs` y `HostPlaceholder` quedaron sin uso (no se borraron los archivos, por las dudas — no afectan el build).

### Vulnerabilidades de seguridad encontradas y corregidas (backend)
Mientras se investigaban los datos disponibles para las pantallas de Miembros/Reseñas, se encontró que **dos endpoints devolvían el hash de contraseña** de otros usuarios en la respuesta JSON (el resto del código usa un helper `withoutPassword()` para esto, pero estos dos casos no lo llamaban):
- `GET /organizadores/:id/miembros` — filtraba `usuario.passwordHash` de cada miembro. Corregido en `organizaciones.service.ts`.
- `GET /resenas` y el uso interno `listAll()` (consumido por el admin) — filtraban `autor.passwordHash` de cada reseña. Corregido en `resenas.service.ts`.
Verificado con `pnpm run build` en `api/` (sin errores).

### Verificación
`pnpm run typecheck`, `pnpm run build` y `pnpm run lint` limpios en `frontend/` (0 errores nuevos; el único error de lint restante es preexistente en `auth-context.tsx`, ajeno a esta sesión). `pnpm run build`/`lint` limpios en `api/`. No se verificó visualmente en navegador (requiere API + Postgres corriendo) — solo typecheck/build/lint.

### Deliberadamente NO implementado (requieren backend nuevo o son features grandes, no fixes visuales)
- Routing real "Ver rutas" en el mapa (Figma muestra selector de modo + turn-by-turn) — necesitaría un servicio de ruteo (OSRM o similar).
- Indicador de stock "Quedan X entradas" en Detalle de evento — necesita campo `disponibles`/`reservados` en la API.
- Tab "Eventos participante" (usuario en cartelera) en perfiles — no hay endpoint que devuelva "eventos donde participo".
- Tab "Configuración" real de usuario/organizador (notificaciones, eliminar cuenta) — sin endpoints definidos; no se agregaron controles falsos que no persistan (cambiar contraseña sí se implementó, reutilizando forgot-password).
- "Mis reservaciones"/detalle con QR embebido en el perfil de usuario — sigue siendo la página aparte `/mis-reservas`.
- Lista de asistentes por evento (G4) — falta `GET` de reservas por evento/organizador en el backend.
- Buscador de usuarios registrados en "Crear miembro" — no hay endpoint de búsqueda por nombre; solo funciona la invitación por correo.
- Picker de mapa interactivo en "Ubicación" del editar-perfil del organizador — solo campos de texto.

### Pendiente
- Perfiles externos con vista "participante" (`User-external-view-profile-*`) — depende del mismo gap de "Eventos participante".
- Corregir `ESPECIFICACION_FUNCIONAL.md` (G1/G2 ya no son "backend nuevo", G6 era más grave de lo documentado) y `ESPECIFICACION_FRONTEND.md` §16 (regla "no `<table>`" obsoleta, ver sesión de análisis).
- Revisar visualmente en navegador contra las capturas de `UI-img/` — todo este trabajo se hizo por inspección de código + capturas, sin correr la app.

## Punto final actual — Análisis Figma vs código + fix de bugs reales (2026-09-07)

### Alcance
Se conectó Figma vía MCP (`fileKey=3QvxIQq37PNHZTkXrMetig`) pero el plan Starter agotó su cuota (20 llamadas/mes) en la primera llamada — se descartó esa vía. Se analizaron en su lugar las 47 capturas exportadas en `UI-img/` contra el código real de `frontend/`, `frontend/admin/` y los controllers de `api/` (4 análisis en paralelo: flujo público, perfil de usuario, área organizador, panel admin). Reportes completos con detalle pantalla-por-pantalla quedaron fuera del repo (scratchpad de la sesión) — el resumen priorizado de gaps está en el historial de conversación, no persistido aquí todavía.

**Hallazgo que cambia el backlog:** los gaps G1 (miembros) y G2 (reseñas desde perfil) en `ESPECIFICACION_FUNCIONAL.md` §8 dicen "requiere backend nuevo" — ya no es cierto. `api/src/organizaciones/organizaciones.controller.ts` ya tiene el CRUD de miembros y `POST /organizadores/:id/resenas`. Son ahora gaps de **frontend puro**. Pendiente corregir el texto de la spec.

De los hallazgos, se corrigieron los bugs reales (sin ambigüedad de diseño, ver detalle abajo). El resto (gaps de fidelidad visual, features faltantes) quedó pendiente de decisión de alcance con el usuario.

### Bugs corregidos
- **Imágenes rotas** (`/images/event1.jpg`, `/images/img3.jpg` — archivos ya no existen): reemplazadas por `EventImagePlaceholder` (eventos) o `Avatar` (personas) en `explorar-view.tsx`, `eventos/[id]/page.tsx`, `mapa/page.tsx`, `favoritos/page.tsx`, `mis-reservas/page.tsx`, `perfil/page.tsx`, `organizaciones/[id]/page.tsx`.
- **Login admin**: quitado el link `¿No tienes cuenta? Regístrate` → `/register`, que fue eliminado a propósito (producía 404).
- **Botón "Seguir" en perfil visitado** (`perfil/[id]/page.tsx`): antes solo cambiaba estado local; ahora llama `POST /social/seguir` / `DELETE /social/seguir/:id` y carga el estado inicial real vía `GET /social/siguiendo/:userId`. `ProfileHead` ganó prop `followLoading` para deshabilitar el botón mientras se procesa.
- **Botones de paginación decorativos en `/mapa`**: eran restos sin función ni contenido asociado (título "Eventos Populares en Quito" duplicado de Explorar, sin grid debajo) — eliminados junto con los imports `ChevronLeft`/`ChevronRight` que quedaron sin uso.
- **Código muerto de subida de foto de perfil** (`perfil/page.tsx`): la lógica (`onSelectFoto`/`guardarFoto`) ya existía pero no tenía ningún `<input>` conectado. Se agregó la card "Foto de perfil" (avatar + botón cámara + preview + guardar) en el tab Configuración.

### No se tocó (evaluado y descartado por no ser un bug simple)
- **Tabs de perfil visitado no cambian contenido**: el fork lo reportó como bug de render, pero investigar reveló que es más profundo — `GET /usuarios/perfil/:id` (`usuarios.service.ts:133`) devuelve `eventos` = eventos organizados por ese usuario (`organizadorId: id`), dato que no corresponde a "Eventos guardados" ni existe fuente para "Eventos participante" en un perfil ajeno. Requiere endpoint(s) nuevos — se dejó fuera de este batch, es parte del gap grande "Eventos participante" ya identificado.

### Verificación (2026-09-07)
| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 0 errors nuevos (mismos 32 warnings `<img>` preexistentes + **1 error preexistente en `auth-context.tsx:59`**, no tocado en este batch, ya estaba en el working tree antes de esta sesión) | ✓ (Next 16, 25 rutas) |
| `frontend/admin/` | ✓ | ✓ (0 errores, 9 warnings preexistentes) | ✓ (Next 16, 17 rutas) |

No se verificó visualmente en navegador (requiere API + Postgres corriendo) — solo typecheck/lint/build.

### Nota
`frontend/src/lib/auth-context.tsx` tiene código ya modificado en el working tree (no committeado, ajeno a esta sesión) con un error de lint (`react-hooks/set-state-in-effect`) — no es parte de este batch, mencionar antes de commitear.

### Pendiente (decisión de alcance con el usuario)
- Corregir `ESPECIFICACION_FUNCIONAL.md` (G1/G2 ya no son "backend nuevo") y `ESPECIFICACION_FRONTEND.md` §16 (regla "no `<table>`" está obsoleta, el admin y el propio Figma usan tablas).
- UI de Miembros y flujo de reseñas desde perfil de organizador (backend ya listo).
- Tab "Eventos participante" (usuario y organizador) — necesita endpoint nuevo.
- Paginación real en todas las listas del admin (backend ya pagina).
- Resto del backlog de fidelidad visual y features: ver historial de conversación de esta sesión para el detalle completo de los 4 reportes.

## Punto final actual — Perfil: componentes variants + páginas (2026-09-07)

### Alcance
Refactorización de la arquitectura de componentes de perfil con sistema de variants para manejar los 4 tipos de perfil.作业完成后，ESTADO.md 已更新。

### Componentes creados (`frontend/src/components/profile/`)
- **`types.ts`:** `ProfileVariant`, `ProfileTabVariant`, `ProfileEventCardData`, `ProfileMemberData`, `ProfileStat`
- **`variants.ts`:** `PROFILE_TABS` (4 variantes), `AVATAR_SIZES` (`profile` 130px, `member` 52px)
- **`profile-hero.tsx`:** variants `gradient` | `plain`, badge color spec `#FFE1E6/#E5394F`
- **`profile-head.tsx`:** stats array genérico, acciones owner/visitor (Editar/Seguir/Compartir), redes sociales
- **`profile-tabs.tsx`:** 4 context variants, estado interno (no `router.push`), tabs owner = links
- **`profile-event-card.tsx`:** variants `owner` | `visitor`, tags Free/Online/$$ conditional
- **`avatar.tsx`:** extendido con `'profile'` (130px) y `'member'` (52px)

### Páginas actualizadas
- **`/perfil/page.tsx`:** own profile con `ProfileHero` + `ProfileHead` (stats: seguidores/siguiendo/guardados) + `ProfileTabs` variant `user-own`
- **`/perfil/[id]/page.tsx`:** visited user con Follow toggle + `ProfileTabs` variant `user-visited`/`org-visited`
- **`/host/[slug]/page.tsx`:** organizer con `ProfileTabs` variant `org-owner`/`org-visited`, owner actions

### Verificación (2026-09-07)
| Componente | typecheck | lint | build |
|---|---|---|---|
| `frontend/` | ✓ | 0 errors (35 warnings preexistentes) | ✓ (Next 16, 25 rutas) |

### Pendiente
- Gaps documentados de sesiones anteriores permanecen.

## Punto final actual — Consolidación documental + correcciones críticas (2026-09-07)

### Alcance
Consolidación de 14 archivos de specs en 2 + correcciones de bugs críticos. Todo listo para entrega.

### Documentación consolidada
- **Eliminado:** `INSTRUCCIONES_OPENCODE_FUNCIONALIDAD_SEED.md`, `ESPECIFICACION_FRONTEND_CORRECCIONES.md`, `UI-especificaciones/UI-especificaciones/` (5 archivos duplicados), `UI-especificaciones/UI/` (proyecto Vite demo).
- **`ESPECIFICACION_FUNCIONAL.md` (~280 líneas):** reglas de negocio, API, BD, auth, gaps documentados.
- **`ESPECIFICACION_FRONTEND.md` (~300 líneas):** sistema de diseño, pantallas, navegación por dominio.
- **`AGENTS.md` (~40 líneas):** reglas operativas simplificadas.
- **`UI-especificaciones/*.md` (5 archivos):** conservados como anexos fuente de verdad visual.

### Imágenes de relleno eliminadas
- `frontend/public/images/` → todas las imágenes de relleno eliminadas (event1-11, img1-3).
- Componente `EventImagePlaceholder` creado (`frontend/src/components/ui/event-image-placeholder.tsx`): iniciales + color sólido por categoría.
- Hero de inicio ahora solo con wordmark "HASTA LA VUELTA" (sin fotos decorativas).

### Backend — `perfilActivo` persiste en BD
- `schema.sql`: añadido `perfil_activo_enum ('usuario','organizador')` + columna `perfil_activo DEFAULT 'usuario'`.
- `usuarios.entity.ts`: añadido `@Column perfilActivo`.
- `usuarios.service.ts`: `cambiarPerfil()` ahora persiste en BD; `habilitarOrganizador()` setea `perfilActivo='organizador'`.
- `auth.service.ts`: login/register/google/verifyEmail devuelven `perfilActivo` y `slug`.
- `jwt.strategy.ts`: `validate()` incluye `perfilActivo` y `slug` en `req.user`.
- **Importante:** requiere `schema.sql` actualizado en la BD (ALTER TYPE + ALTER TABLE).

### Frontend — `perfilActivo` del backend
- `auth-context.tsx`: `perfilActivo` ahora se lee de `user.perfilActivo` (backend), no de localStorage.
- `refreshUser()` sincroniza cambios entre pestañas.
- **`/auth/me`** ahora devuelve `perfilActivo` y `slug`.

### Frontend — Formulario de reseñas
- `eventos/[id]/page.tsx`: añadido formulario de reseñas (estrellas 1-5 + textarea + POST /resenas).
- Visible para usuarios logueados. Refresca reseñas tras publicar.

### Frontend — Score real en `/host/[slug]`
- Badge `Score: —` → `Score: {score.toFixed(1)}` (valor real del backend).

### Frontend — Catch errores
- `favoritos/page.tsx`: `removeFavorito` ahora loguea `console.error`.
- `mis-reservas/page.tsx`: `cancelar` ahora loguea `console.error`.
- `perfil/[id]/page.tsx`: `toggleSeguir` ahora loguea `console.error`.
- `eventos/[id]/page.tsx`: `toggleFav` ahora loguea `console.error`.

### API — Bug `precioMin='0'` corregido
- `eventos.service.ts:171`: `params.precioMin ?` → `params.precioMin !== undefined && params.precioMin !== '' ?`.

### Admin — Registro eliminado
- `frontend/admin/src/app/register/` eliminado (admin creado solo via `pnpm run seed`).

### Verificación (2026-09-07)
| Componente | typecheck | lint | build |
|---|---|---|---|
| `api/` | ✓ | ✓ | ✓ |
| `frontend/` | ✓ | 0 errors (35 warnings preexistentes) | ✓ (Next 16, 25 rutas) |
| `frontend/admin/` | ✓ | — | ✓ (Next 16, 17 rutas) |

### Gaps documentados (NO implementados en esta sesión)
| Gap | Razón |
|---|---|
| Gestión miembros endpoints CRUD | Requiere backend nuevo (3-4h) |
| Reseñas con acciones en `/host/[slug]/resenas` | Requiere endpoints nuevos (2-3h) |
| Form configuración propio del organizador | Requiere form dedicado (1.5h) |
| Lista de asistentes por evento | Requiere endpoint nuevo (3h) |
| Admin configuracion (placeholder) | No crítico para demo |
| OSRM rutas detalladas | Mapa básico funciona, pendiente |
| Cloudinary upload real | Pendiente credenciales |
| Paginación admin usuarios | Funcionalmente suficiente con filtros |

### Credenciales seed
- Admin: `admin@hastalavuelta.com` / `Admin.2026!`
- Demo usuario: `camila.pazmino@demo.com` / `Demo.2026!`
- Demo organizador: `valentina@lunacultura.com` / `Demo.2026!`

---

## Punto final actual — QA corrección de diseño (2026-09-06)

### Alcance
Pasada de fidelidad visual adicional en `frontend/` tras QA del usuario. Tokens de radio corregidos, botón WhatsApp en detalle de evento, wordmark del footer corregido. No se tocó `api/`.

### Cambios
- **Radius tokens (`tailwind.config.ts`):** `sm:6px` (era 4px), `lg:12px` (era 8px), `xl:12px` (era 8px), `2xl:12px` (era 8px), `3xl:16px` (era 12px) — alineado a spec §14.
- **Event Detail (`eventos/[id]/page.tsx`):** añadido botón **WhatsApp share** en la sección de reserva confirmada (tras QR), con mensaje prellenado incluyendo título del evento y código de ticket.
- **Footer (`footer.tsx`):** wordmark corregido a uppercase, `font-bold` (800), `tracking[-0.06em]`, `leading-[0.78]` según spec §27.

### Verificación
- `frontend/`: typecheck ✓ | lint ✓ (**0 errores**; 36 warnings preexistentes `<img>`) | build ✓ (Next 16, 25 rutas).
- Render manual (dev en :3001): sin errores visibles.

### Pendiente (backlog)
- **Stock "Quedan X entradas":** no disponible sin campo `reservados` o `disponibles` en la respuesta de `GET /eventos/:id` (la API devuelve `aforo` pero no vendidos). **Necesita cambio en `api/`** — requiere aprobación.
- Phase 2–4 (perfil propio §30, perfil visitado §32, área organizador §33, panel admin §36-41) siguen pendientes de la fase anterior.



## Punto final actual — Phase 1: Flujo público completo (2026-09-06)

### Alcance
Implementación del flujo público según `ESPECIFICACION_FRONTEND.md` (Part D §23-29). Solo `frontend/`. No se tocó `api/`.

### Phase 0: Sistema de diseño (correcciones)
- **Radius**: `sm:6px`, DEFAULT:8px, md:8px, lg:12px` (antes todo 4px)
- **Button**: variant `secondary` añadida; `primary` con borde; md height 42px
- **Navbar**: altura 72px; campana notificaciones; dropdown avatar con perfil/Mi host/cerrar sesión
- **Footer**: wordmark 210px
- **Login/Register**: títulos `font-clash`
- **Home**: hero text uppercase "DES CUBRE / LO QUE PASA / EN TU CIUDAD AHORA"

### Phase 1: Explorar (§26)
- Banner destacado con imagen blur (de evento real, no gradiente hardcodeado)
- Filtros: Distancia, Precio, Fecha, Sort (dropdown)
- Grid: aspect-ratio 3/4, 4 columnas desktop
- Pills categorías + modalidad (Presencial/En línea)
- Cards: imagen dominante, badges (Online/Free), favorito, compartir, fecha/hora naranja, título

### Phase 1: Mapa (§28)
- Layout: sidebar izquierda "Puntos más cercanos" + mapa derecha
- Mapa: grayscale (CSS filter), labels categorías posicionados
- Clusters negros 36x36 con texto blanco (custom divIcon)
- Tarjeta flotante overlay: imagen, cerrar, favorito/compartir, Free, título, fecha, "Ver rutas"
- Click en marker o sidebar abre tarjeta flotante

### Phase 1: Event Detail (§29)
- Layout 2 columnas: izq 565px (poster + localidades + reserva), der (categoría + título + ubicación + fecha naranja + about + organizador + cartel + FAQs + reseñas)
- Fecha/hora en color naranja (#F59E0B)
- About, organizador compacto, cartel artistas, FAQs accordion, reseñas con estrellas

### Verificación
- `frontend/`: typecheck ✓ | build ✓ (25 rutas)
- `frontend/admin/`: typecheck ✓ | build ✓ (18 rutas)

### Pendiente (backlog)
- Phase 2: Perfil propio (§30) — tabs, eventos guardados, tickets, configuración
- Phase 2: Perfil visitado (§32) — hero, tabs, reseñas
- Phase 3: Área Organizador (§33) — dashboard, eventos, reseñas, miembros, tickets, configuración
- Phase 4: Panel Admin (§36-41) — dashboard, gestión completa
- WhatsApp botón en Event Detail (flujo compra §9)
- Stock "Quedan X entradas" en Event Detail

## Punto final actual — Completada cobertura del spec frontend vs anexos (2026-09-06)

### Alcance
Segunda pasada de consolidación en `ESPECIFICACION_FRONTEND.md` (**solo documentación**). Tras auditar la cobertura de los 5 anexos de `UI-especificaciones/` (no era 100%), se cerraron las brechas y conflictos detectados.

### Cambios en `ESPECIFICACION_FRONTEND.md`
- **Nuevo Apéndice** (final): tablas de capturas de referencia (PNG) por flujo — público (UI §2), resoluciones originales (UI §50), flujo autenticado (UI §86), perfil visitado (§31) y organizador (§57). Las PNG siguen siendo la **fuente visual de verdad**.
- **§21 inventario completado:** dimensiones Figma de org cards (§26 `490×180/325×84/278×428`), profile-nav (§27 `876×39/208×38`), listas de registro admin (§37), elementos de acción admin (§38), imágenes de evento (§39), localities (§40 `565×475`), event float (§41 `441×387`), creation (§42 `240×398/200×219/200×91`), gráficos (§34: cada gráfico `304×329`) y símbolos de giro de rutas (§30). Conjunto `btn*` (Figma §8) y radios `input-radio*` (Figma §10) añadidos a Utility.
- **Node map §53:** añadidos `Set Components Mixed 83:647` y `Visual Elements 221:896`.
- **Reglas sueltas:** variable auxiliar `#949494` en §12.2 (aviso: no sustituir todos los grises), `input-radio`/`input-radio_large` en §20.2, inventario de iconos §16 con nombres exactos (`next-arrow`/`chevron-prev`/`pin2`/`route`/`route2`/`symbol-turn-*`).
- **Panel admin:** §39 Reservaciones con MetricCards `Total/Reservados/En revisión/Suspendidos (última roja)`, filtros exactos `[Fecha ▼][No. Reservas ▼][Estado ▼][Sort ↕]`, columnas de tabla y paginación ("Mostrando 1 – 8 de 195..."); §40 rol Organizador: foto de portada `1080×1200`, **máx 4MB** (jpg/png/jpeg/webp); rol Admin **sin** bloque de redes sociales (anexo §21).
- **§8.1:** Reportes pasa de GESTIÓN a **GENERAL** (Dashboard · Reportes), según anexo §2/§36.
- **§32.5 perfil visitado:** cadena de estados de reseña (`Sin reseña → Agregar una reseña → Publicar → Reseña publicada`), "← Volver a reseñas", post-publicación (redirige al perfil → pestaña Reseñas y actualiza la puntuación general).
- **Nueva §22.8 "Conflictos entre fuentes — resoluciones":** tabla con las 8 diferencias detectadas y su resolución (navbar 72px, labels del mapa, pills Explore, verde Free `#EAF9E3/#3DC069`, search `#242424`/`#222`, hero org según contexto, naming Tickets vs Reservaciones, Reportes en GENERAL). Regla general: **la captura manda**.

### Verificación
Documentación únicamente: no se tocó `frontend/`, `frontend/admin/` ni `api/`.

## Punto final actual — Especificación frontend consolidada con specs de UI (2026-09-06)

### Alcance
Actualización **solo de documentación** (sin cambios de código): `ESPECIFICACION_FRONTEND.md` dejó de ser el volcado de `observaciones.txt` y ahora es el **spec maestro de frontend consolidado** con las 5 especificaciones de UI de `UI-especificaciones/` (ChatGPT + Figma). El archivo une todo en un solo documento ordenado. Además, `ESPECIFICACION_FUNCIONAL.md` ganó una **referencia cruzada** al spec frontend (precedencia: funcional > código en funcionalidad; capturas PNG > texto en apariencia) — su contenido funcional no se modificó.

### Reescritura de `ESPECIFICACION_FRONTEND.md` (raíz)
- Estructura: **Partes A–G**, secciones `#1`–`#42`:
  - **A.** Principios y fuentes — tabla de los 5 anexos de `UI-especificaciones/`, prioridad de fuentes (Figma §2.1) y prohibiciones técnicas §2.2 (no Tailwind solo para reproducir diseño, no inventar breaks; las PNG son la fuente visual de verdad).
  - **B.** Especificación funcional y navegación — dominios por tipo de usuario (invitado / logueado / organizador / perfil visitado / panel admin), proceso de compra, acciones que exigen sesión, reglas transversales. Conserva las correcciones ya aplicadas en la versión anterior del spec (navbars sin "Home", nav invitado solo "Iniciar sesión", perfil con tabs reales, naming "Tickets", panel admin aislado).
  - **C.** Sistema de diseño UI — identidad §11, colores §12 (tokens UI §3.2 + tokens Figma §3.1 + tokens CSS recomendados), tipografía §13 (Inter UI + Clash Grotesk titulares, escalas 13–41), radius/bordes/sombras/efectos §14, espaciado/contenedor/header §15, iconos §16, imágenes §17, estados interactivos §18, responsive §19, botones/inputs §20, inventario de componentes + node map §21, reglas de fidelidad/checklist/instrucción OpenCode/assets §22.
  - **D.** Pantallas públicas — Auth §23, Home §24, Header §25, Explore §26, Footer §27, Map §28, Event Detail §29.
  - **E.** Perfiles y flujo autenticado — perfil propio §30, header autenticado §31, perfil visitado §32 (`perfil_usuario_visitante.md`), área organizador §33 (`perfil_organizador.md`), reservas/tickets §34, detalle de reserva + QR §35.
  - **F.** Panel administrativo §36–§41 (`panel_admin_hasta_la_vuelta.md`) — layout + sidebar, auth, dashboard, gestión de módulos, crear usuario/organizador/evento, reglas del panel.
  - **G.** §42 — resumen de rutas por app (`frontend/` y `frontend/admin/`) + componentes base recomendados.

### Fuentes integradas (referenciadas desde el spec maestro)
- `UI-especificaciones/README_UI_Hasta_la_Vuelta.md` (3070 líneas), `README_Figma_Hasta_la_Vuelta.md` (3013), `perfil_usuario_visitante.md` (993), `perfil_organizador.md` (1636), `panel_admin_hasta_la_vuelta.md` (2547). Figma: file key `3QvxIQq37PNHZTkXrMetig`, página `Design System` (`23:209`).
- Espec de UI interpretable sin re-leer los anexos; los anexos quedan como fuente detallada para implementar cada pantalla.

### Verificación
- Documentación únicamente: no se tocó `frontend/`, `frontend/admin/` ni `api/`. Sin comandos de build/lint necesarios. Converter reglas clave: fondo `#000`, texto `#F5F5F5`, naranja solo como acento, radius 8px, header 72px, footer wordmark 210px, sidebar admin 250px, EventCard `254×309`.

### Alcance
Reimplementada la landing `/` (invitado) y `/inicio` replicando el diseño de Figma **"Home"** (frame `428:6730`, 1280×3918) exportado con Builder.io Visual Copilot. Solo `frontend/` (`inicio-view.tsx` + `footer.tsx`). No se tocó `api/` ni `schema.sql`.

### Secciones del diseño implementadas (en orden)
1. **Hero:** "DES / CUBRE" (izq, `mix-blend-exclusion`) + "LO / QUE / PASA / EN TU CIUDAD AHORA" (der, alineado); blobs diamond gradient naranja (`#FFC15D→#FF8000`, blur 62 px, `mix-blend-screen`) y fotos decorativas rotadas/desenfocadas repartidas (solo `md+`).
2. **Descripción + CTA "Comenzar"** → `/explorar`.
3. **Marquee de categorías** (rotado −2°, borde blanco, separadores de punto de 5 px) — alimentado de **`GET /categorias` reales** (se renderiza solo si hay categorías).
4. **"ENCUENTRA TU PRÓXIMA EXPERIENCIA"** + 4 event-cards (254×309, rotaciones −1.98/2.32/−3.56/3.21° según variantes img-1…img-5) con blob diamond rosa (`#FF5D80→#FF0022`); datos de **eventos reales** (`/eventos?limit=8`, próximos). Cards vacías → "No hay eventos disponibles".
5. **"CLIENTES"** — fila de sponsors en `mix-blend-luminosity`/grayscale (placeholders "Name Sponsor" + 4 imágenes locales; reemplazar cuando haya sponsors reales).
6. **CTA organizador "¿TIENES UN EVENTO QUE ORGANIZAR?"** — blob radial violeta (`#533389`), copys, botón "Crear evento" que **reutiliza la lógica del navbar** (`useAuth` + `useRouter`: invitado→`/login`, organizador→`/host/[slug]/eventos/nuevo`, admin→app admin, usuario→habilita organizador), más imagen 435×435 (rotada 4.46°) con sticker asterisco.

### Footer (`footer.tsx`)
- Email del diseño: `hastalav11elta@gmail.com`.
- Menú: **Inicio** (`/inicio`) · **Mapa** (`/mapa`) · **Eventos** (`/explorar`).
- Barra inferior: "Copyright © Hasta la vuelta 2026" · Politicas · Instagram · Contactos.

### Notas
- Fuentes ya configuradas: Clash Grotesk (`font-clash`, Fontshare) + Inter (body). Colores del sistema de diseño: black `#000`, concrete `#F5F5F5`, silver `rgba(192,192,192,.9)`, mercury `#DFDFDF`.
- Los gradientes diamond del Figma se aproximan con cuadrados rotados (`rotate-45`/`rotate-[30deg]`) + blur + `mix-blend-screen` (SVGs complejos del export no se copiaron).
- Imágenes decorativas usan assets locales `public/images/eventN.jpg` (las URLs temporales de Builder.io no persisten).
- Estilo "card de evento" conserva overlay de fecha + título (datos reales), manteniendo el patrón previo de la home.

### Verificación
- `frontend/`: typecheck ✓ | lint ✓ (0 errores; warnings preexistentes `<img>`) | build ✓ (Next 16).
- Render manual: hero/CTA/marquee (categorías reales)/cards vacías (BD limpia)/clientes/CTA organizador/footer visibles en `/`.

## Punto final actual — Especificación frontend: unificación de observaciones.txt (2026-09-06)

### Alcance
- NUEVO `ESPECIFICACION_FRONTEND.md` (raíz): unifica y **ordena** todo el contenido de `observaciones.txt` como especificación de frontend puro, y **refleja los cambios ya implementados** en el proyecto.
- Estructura: 1) separación de dominios · 2) usuario invitado (Home/Mapa/Explorar/crear evento/login) · 3) usuario con sesión (perfil, editar perfil) · 4) organizador (nav host, menú interno: eventos con stats/gráficas, reseñas, miembros, tickets, configuración, editar perfil) · 5) perfil de otro usuario · 6) perfil de organizador · 7) panel admin (layout, dashboard, reportes, usuarios, organizadores, eventos, reseñas, tickets, categorías, registro, configuración, cerrar sesión) · 8) proceso de compra/ticket (WhatsApp) · 9) reglas transversales (terminología, eliminación lógica 90 días, acciones que exigen sesión, revisión de eventos, tickets, tablas con `<ol>`/`<ul>`).

### Correcciones aplicadas (difiere de `observaciones.txt`)
- **Navbars (usuario/host/admin):** sin ítem "Home" (logo → `/inicio`), sin campana de notificaciones, sin dropdown de acciones rápidas (avatar+nombre → `/perfil`), botón "Salir" en el nav. El nav de invitado solo muestra **"Iniciar sesión"** (sin botón "Registrarse": el registro ocurre dentro del flujo de iniciar sesión, conforme a `observaciones.txt`). El nav del host muestra los links **Eventos · Reseñas · Miembros · Tickets · Configuración** (menú que antes era "interno del perfil") + opción móvil "Cambiar a usuario".
- **Crear evento:** sin sesión → `/login`; rol `usuario` → habilita organizador + abre `/host/[slug]` en otra pestaña (con atajo "Mi host"); organizador → modal A/B; admin → redirige a la app admin (`NEXT_PUBLIC_ADMIN_URL`).
- **Perfil (`/perfil`):** tabs reales **Eventos guardados · Mis tickets (N) · Configuración**; "Configuración" = form de editar información personal (nombre/apellido/teléfono/cédula/bio) + foto inline. Detalle de ticket (3 puntos/QR/receipt), toggles de notificación, cambiar contraseña, eliminar cuenta y "Eventos participante" quedan **marcados como pendientes** (no implementados).
- **Host:** dashboard `/host/[slug]` con contadores (eventos/reservas 30d/seguidores/guardados 30d), score "—" (D8 pendiente), `HostTabs`; **Reseñas/Miembros/Configuración = placeholders** (requeridos).
- **Panel admin (`frontend/admin/`):** sidebar agrupado GENERAL/GESTIÓN/SISTEMA + Cerrar sesión al pie; header con "Crear evento rápido" (modal A/B), campana y dropdown Editar perfil/Cerrar sesión; guard `rol==='admin'` en `(panel)/layout.tsx`; naming **"Tickets"** (antes "Reservaciones"), ruta `/tickets`.
- El resto de `observaciones.txt` (mapa/explorar, detalle evento, compra con WhatsApp, dashboards con KPIs/gráficas/formularios) queda organizado en el spec como requerido.
- `ESPECIFICACION_FUNCIONAL.md` sigue siendo la fuente de verdad funcional; el nuevo archivo es la vista de frontend (referencia cruzada declarada en su intro).
- Solo documentación; sin cambios de código.

## Punto final actual — Google OAuth: auto-registro de usuarios nuevos (2026-09-06)

### Problema
Al intentar iniciar sesión con una cuenta de Google **nueva** (nunca registrada en la plataforma) en el frontend de usuario, la API respondía `403 "Los administradores no pueden registrarse con Google"`. Causa: `auth.service.validateGoogleUser` lanzaba ese error cuando el email no existía en la BD (`usuario === null`), en lugar de **crear** la cuenta.

### Cambios
- `api/src/auth/auth.service.ts` — `validateGoogleUser`: si el email no existe, **auto-crea** un usuario con `rol = 'usuario'`, `estado = 'activo'` (Google exento de OTP, D12), `nombre`, `apellido` y `fotoPerfilUrl` de Google, y un `password_hash` de **marcador inutilizable** (`googlePlaceholderHash()`: bcrypt de un token aleatorio que nunca matchea con un login por password). Se conserva el bloqueo: los admins no crean ni inician sesión con Google.
- `api/src/usuarios/usuarios.service.ts` — `create()` acepta `rol` (default `'usuario'`) y `fotoPerfilUrl` (opcional).
- `api/src/usuarios/entities/usuario.entity.ts` — `estado` enum: agregado `'pendiente'` para consistency con `schema.sql` y con `auth.service.register()`.
- `ESTADO.md`/spec: primera vez vía Google → crea cuenta; siguientes → login. No hay cambios de schema.

### Verificación
- `api/`: build ✓ | lint ✓ | test ✓ (sin spec.ts → exit 0).

## Punto final actual — Separación de dominios: admin fuera de la app de usuario (2026-09-06)

### Alcance
El panel administrativo **ya no vive dentro del frontend de usuario/organizador**. Aplicada la regla de la spec 3.1/8.1 (dominios aislados): `frontend/` queda solo para usuario normal y organizador; el admin opera únicamente en `frontend/admin/` (`admin.hastalavuelta.com`).

### Cambios
- **Eliminado** el panel legacy completo de `frontend/`:
  - `frontend/src/app/admin/` (layout + páginas: dashboard, usuarios, organizaciones, eventos, establecimientos, resenas, reportes, registro, categorias).
  - `frontend/src/components/layout/admin-sidebar.tsx` y `frontend/src/components/layout/admin-topbar.tsx` (sin uso tras la eliminación).
- `frontend/src/components/layout/navbar.tsx`:
  - Eliminado el link "Admin" (escritorio y móvil) hacia `/admin/dashboard` — el admin no ve el nav de la plataforma (spec 6.1/8.1).
  - `handleCrearEvento`: si el rol es `admin`, redirige a la app admin vía `NEXT_PUBLIC_ADMIN_URL` (default `http://localhost:3002`) en vez de abrir el modal del organizador.
  - Eliminado el fallback `router.push('/admin/eventos/nuevo')` de `handleSelectFormulario` (ahora redirige a la app admin).
- **Sin cambios de API ni schema.** El admin real (`frontend/admin/` con su propio login/register/verificar-correo y layout `(panel)`) ya estaba autocontenido.
- Spec: **G4** marcado como RESUELTO.

### Verificación
- `frontend/`: typecheck ✓ | build ✓ (Next 16, **23 rutas, sin `/admin`**) | lint ✓ (0 errores; warnings `no-img-element`/`no-location-assign` preexistentes).

## Punto final actual — Especificación: verificación de correo OTP + regla LTS (2026-09-06)

### Alcance
Actualización **solo de documentación** (sin cambios de código): la especificación queda lista para implementar el registro en **dos pasos** con verificación del correo por **código OTP de 6 dígitos**, y se adiciona una regla transversal de versiones actuales/LTS.

### Cambios
- `ESPECIFICACION_FUNCIONAL.md`:
  - **5.1**: registro reescrito como flujo por pasos (`registro → pendiente → código → verify-email → activo + auto-login`).
  - **Nueva 5.4** "Verificación de correo (código de 6 dígitos)": tablas de reglas (generación con `crypto.randomInt`, **hash bcrypt** en `email_verification_codes`, TTL 15 min, máx. 3 reenvíos con cooldown 60 s → 429, máx. 5 intentos, auto-login, cuenta `pendiente` sin acceso) + endpoints `POST /auth/verify-email` y `POST /auth/re-send-code` + frontend `/verificar-correo`.
  - **9.1** corregido: registro = nombre / email real / contraseña / confirmar + código; `apellido`/`teléfono`/`cédula` desde el perfil (sin campos extra).
  - **R24** en reglas de negocio; máquina de estado de usuario con `pendiente → activo`; fila SMTP de integraciones actualizada.
  - **D12** (verificación OTP) y **D13** (versiones actuales/LTS 2026) en decisiones.
  - **G19** (API OTP) y **G20** (frontend OTP) en gaps; confirmación en sección 18.
- `AGENTS.md`: nueva sección **"Dependencias y versiones (LTS / 2026) — obligatorio"**.
- Decisiones del dueño: **auto-login** al verificar ✅ · **OTP también para el registro del panel admin** ✅ · **Google OAuth exento** ✅.
  - **Pendiente de implementar (backlog):** G19 (backend) y G20 (frontend).

## Punto final actual — G19 implementado: verificación de correo OTP (2026-09-06)

### Alcance
Implementación backend completa del gap G19: registro en **dos pasos** con código OTP de 6 dígitos enviado por email. **Solo `api/` y `schema.sql`**. No se tocó frontend.

### Cambios file-by-file

**`schema.sql`:**
- `estado_usuario_enum`: agregado `'pendiente'` al TYPE (antes solo `'activo'/'suspendido'/'inactivo'`)
- Nueva tabla `email_verification_codes` (id BIGSERIAL, usuario_id FK CASCADE, codigo_hash VARCHAR(60), expires_at TIMESTAMPTZ, used BOOLEAN DEFAULT FALSE, intentos INT DEFAULT 0, created_at TIMESTAMPTZ)
- Índices: `idx_email_verif_usuario` y `idx_email_verif_codigo_hash`

**`api/src/common/enums.ts`:**
- `ESTADO_USUARIO_ENUM`: agregado `'pendiente'`

**`api/src/auth/entities/email-verification-code.entity.ts`:** (NUEVO)
- Entidad TypeORM mapeando `email_verification_codes` con los índices correspondientes

**`api/src/auth/auth.module.ts`:**
- Importado `EmailVerificationCode` y registrado en `TypeOrmModule.forFeature([...])`

**`api/src/auth/auth-mailer.service.ts`:**
- Nuevo método `sendVerificationCodeEmail(to, codigo)`: HTML profesional con el código destacado en grande, TTL 15 min y aviso de seguridad

**`api/src/auth/dto/verify-email.dto.ts`:** (NUEVO)
- Campos: `email` (EmailRealValidator) + `codigo` (@Matches(/^\d{6}$/))

**`api/src/auth/dto/re-send-code.dto.ts`:** (NUEVO)
- Campo: `email` (EmailRealValidator)

**`api/src/auth/auth.service.ts`:**
- `register()`: crea usuario con `estado='pendiente'`, genera código 6 dígitos con `crypto.randomInt`, guarda **solo hash bcrypt**, envía email, responde `{ message, email }` (SIN access_token)
- `verifyEmail(email, codigo)`: busca código activo no expirado, verifica hash bcrypt, máx 5 intentos (al 5° código se invalida → "Código inválido o expirado"), al éxito marca `usado=true` + `estado='activo'`, retorna `{ access_token, user }` (AUTO-LOGIN)
- `reSendCode(email)`: cooldown 60s entre reenvíos, máx 3 reenvíos por cuenta (429 si se excede), cada reenvío invalida el código anterior
- `login()`: si `estado='pendiente'` → `UnauthorizedException` con mensaje específico para que frontend redirija a `/verificar-correo`
- `validateGoogleUser()`: Google EXENTO de OTP — si el usuario existe con `estado='pendiente'`, lo activa automáticamente y retorna token (nunca queda pendiente)
- Constantes: `OTP_TTL_MINUTES=15`, `MAX_RESEND_COUNT=3`, `RESEND_COOLDOWN_SECONDS=60`, `MAX_VERIFICATION_ATTEMPTS=5`

**`api/src/auth/auth.controller.ts`:**
- `POST /api/auth/verify-email` → `authService.verifyEmail()` (SkipThrottle — la lógica de rate limit está en el servicio)
- `POST /api/auth/re-send-code` → `authService.reSendCode()` (@Throttle 3/60s)

**`api/src/usuarios/usuarios.service.ts`:**
- `findById(id)` — alias de `findOneById` (para auth.service)
- `create()` — acepta parámetro `estado` opcional (para crear como `'pendiente'`)
- `updateEstado(id, estado)` — actualiza el estado del usuario

### Verificación
- `api/`: build ✓ | lint ✓ | test (no hay spec.ts → exit 1 pero sin tests es esperado)

## Punto final actual — G20 implementado: verificación de correo OTP (frontend) (2026-09-06)

### Alcance
Implementación frontend completa del gap G20: flujo de verificación de correo OTP de 6 dígitos en `frontend/` y `frontend/admin/`. **Solo `frontend/` y `frontend/admin/`**. No se tocó `api/` ni `schema.sql`.

### Cambios file-by-file

**`frontend/src/lib/validation.ts`:**
- Nuevo `verificarCodigoSchema`: objeto con `email` + `codigo` (6 dígitos exactos, regex `/^\d{6}$/`)
- Nuevo `reenviarCodigoSchema`: objeto con solo `email`
- Tipos exportados: `VerificarCodigoValues`, `ReenviarCodigoValues`

**`frontend/src/types/index.ts`:**
- `EstadoUsuario`: agregado `'pendiente'` al tipo

**`frontend/src/lib/auth-context.tsx`:**
- `register()` retorna ahora `Promise<{ message, email }>` (SIN token en respuesta exitosa)
- Nuevos métodos `verifyEmail(email, codigo)` y `resendCode(email)` que llaman a los endpoints respectivos

**`frontend/src/components/auth/register-form.tsx`:**
- `onSubmit`: al éxito, navega a `/verificar-correo?email=...` en vez de `/`

**`frontend/src/components/auth/login-form.tsx`:**
- `onSubmit`: detecta error de cuenta "pendiente" y redirige a `/verificar-correo?email=...`

**`frontend/src/app/verificar-correo/page.tsx`:** (NUEVO)
- Wrapper con `<Suspense>` para `useSearchParams()`

**`frontend/src/app/verificar-correo/form.tsx`:** (NUEVO)
- 6 inputs numéricos con auto-avance, pegado completo, navegación teclado (flechas/Backspace), accesible (`aria-label`, `role="group"`)
- Botón "Verificar código": llama `verifyEmail`, al éxito auto-login + redirige a `/`
- "Reenviar código" con countdown 60s, máx 3 reenvíos (estado `maxResendsReached`)
- Manejo de errores: 429/cooldown → mensaje de espera; 400/inválido/expirado → limpia inputs y refocus
- Estados: loading, success con spinner de redirección

**`frontend/admin/src/lib/validation.ts`:**
- Mismos schemas `verificarCodigoSchema` y `reenviarCodigoSchema` + tipos exportados

**`frontend/admin/src/types/index.ts`:**
- `EstadoUsuario`: agregado `'pendiente'` al tipo

**`frontend/admin/src/lib/auth-context.tsx`:**
- `register()` retorna `Promise<{ message, email }>` (SIN token)
- Nuevos métodos `verifyEmail(email, codigo)` y `resendCode(email)`

**`frontend/admin/src/app/register/page.tsx`:**
- `onSubmit`: al éxito, navega a `/verificar-correo?email=...`
- Eliminado estado `success` (la verificación ahora es inline en `/verificar-correo`)

**`frontend/admin/src/app/login/page.tsx`:**
- `onSubmit`: detecta error "pendiente" y redirige a `/verificar-correo?email=...`

**`frontend/admin/src/app/verificar-correo/page.tsx`:** (NUEVO)
- Wrapper con `<Suspense>` + logo institucional

**`frontend/admin/src/app/verificar-correo/form.tsx`:** (NUEVO)
- Mismo flujo que `frontend/` pero al éxito verifica si `user.rol==='admin' && user.estado==='activo'` → redirige a `/dashboard`, si no → `/`

### Verificación
- `frontend/`: typecheck ✓ | lint ✓ (0 errores; warnings preexistentes `<img>`/no-img-element) | build ✓ (Next 16, 25 rutas; `/verificar-correo` incluida)
- `frontend/admin/`: typecheck ✓ | lint ✓ (0 errores; warnings preexistentes `<img>`/no-img-element) | build ✓ (Next 16, 18 rutas; `/verificar-correo` incluida)

## Punto final actual — Limpieza de datos mock (2026-09-05)

### Alcance
Eliminados todos los datos demo/mock y se verificó que la BD está limpia (transición a datos reales). Se conservan: usuario admin (`admin@hastalavuelta.com` — único acceso al panel) y datos de catálogo/referencia (planes, categorias, provincias/ciudades — el sistema los necesita).

### Cambios
- `api/scripts/seed.cjs`: eliminados usuarios demo (`organizador@demo.com`, `artista@demo.com`, `fan@demo.com`), miembro demo, evento demo "Noche de Jazz en Quito" y reserva `TKT-DEMO-001`. Quedan `upsertGeografia` (Pichincha/Quito + 6 provincias/ciudades) + seed solo del admin. Eliminada `crearUbicacion()` (solo la usaba el evento demo).
- `frontend/src/components/home/inicio-view.tsx`: el marquee se alimenta ahora de `GET /categorias` reales (se renderiza solo si hay categorías); eliminados los arreglos hardcodeados `categorias` y `clientes` y la sección "Clientes" falsa.
- BD actual (`hasta_la_vuelta`): verificada **vacía de datos demo** (0 usuarios / 0 eventos / 0 reservas) — no requirió DELETEs.

### Verificación
- `api/`: build ✓ | lint ✓ | test ✓ (sin `.spec.ts`, exit 0).
- `frontend/`: typecheck ✓ | lint ✓ (0 errores; 45 warnings preexistentes) | build ✓ (Next 16, 30 rutas).

## Punto final actual — Gaps backend aplicados (organizador/tickets + reglas + cron) (2026-09-05)

### Alcance
Cierre de gaps y reglas de backend pendientes (spec 10.1, 7.6, R8/R11/R12, sección 12, D8, G8/G16). Se tocó SOLO el backend (`api/`); **sin cambios de esquema** (`schema.sql`) — todo ya existía en la BD. Verificación: `api/ pnpm run build` ✓ | `lint` ✓ | `test` ✓ (sin `.spec.ts`, `passWithNoTests`).

### Tareas programadas — NUEVO módulo `api/src/tareas/` (spec 12 + G8/R16)
- Instalado `@nestjs/schedule` (12.0.1) y registrado `ScheduleModule.forRoot()` en `app.module.ts`.
- `marcarEventosFinalizados()` (cada hora): eventos `aprobado` con `fecha_fin < NOW()` → `finalizado`.
- `purgarCuentasEliminadas()` (03:00 diario, G8/R16): cuentas soft-deleted ≥ 90 días se borran **físicamente** en una transacción: (1) se inserta bitácora `borrado_fisico_cuenta` con `registro_id` + resumen de movimientos (eventos/reservas/reseñas/seguidores/bitácora) — persiste porque `bitacora.usuario_id` es `ON DELETE SET NULL`; (2) se liberan las FKs restrictivas (`eventos.revisado_por`→NULL, `eventos.creado_por` (de otro organizador)→`organizador_id`, `reservas.verificado_por`/`intervenido_por`→NULL, `reportes_eventos.gestionado_por` y `reportes_reservas.gestionado_por`→NULL, `usuarios.deleted_by`→NULL); (3) `DELETE eventos (organizador_id)` (cascada reservas/reseñas/visitas/cartelera en JSONB); (4) `DELETE usuarios`.

### Organizador y tickets (spec 10.1 + 7.6 + R12, máquina de estado reservas)
- `POST /api/reservas/:id/reportar-impago` (NUEVO, `dto/reportar-impago.dto.ts`, motivo 5–1000 `MinLength` como el admin): authz `OrganizacionesService.assertEditor` (admin/organizador/editor; moderador u otros → 403). Estado `confirmada` → `reportada`, con `intervenido_por` + `motivo_intervencion`.
- `POST /api/reservas/:id/eliminar` (NUEVO, `dto/eliminar-reserva.dto.ts`, motivo obligatorio = R12/7.6 "Eliminar con motivo"): cualquier estado no terminal (`cancelada`/`invalidada`/`reportada` rechazados) → `cancelada` con motivo.
- `reserva.entity.ts`: el array enum de `estado` ahora incluye `'reportada'` (faltaba; el enum de BD y `common/enums.ts` ya lo tenían — cierre de G15 en la entidad).
- `ReservasModule` importa `OrganizacionesModule` (authz reutilizada).

### Eventos (R8/R11 + limpieza)
- **R11** `validateInformacionPago` (NUEVO): evento pagado debe traer `informacionPago`; aplicado en `create()`, `adminCreate()` y en `update()` cuando `esGratuito=false` (evalúa el estado final). `update-evento.dto.ts` ganó `esGratuito?: boolean` — el editor de `frontend/admin` ya lo envía al actualizar y el whitelist (`forbidNonWhitelisted`) lo **rechazaba con 400**.
- **R8/G7** `update()` re-valida conflictos de horario de artistas aunque solo cambien las fechas: cartelera final + fechas finales, excluyendo `id` del propio evento (sin falsos positivos).
- Eliminado `assertOrganizador()` (método muerto; la authz real es `@Roles` + `assertEditor`).

### Social (G16 — paginación/filtro correctos)
- `seguidores()` / `siguiendo()`: el filtro por nombre (`q`) ahora se aplica en la query (JOIN + ILIKE), no tras paginar; se eliminaron `whereClause` muerta y el paginate-then-filter que devolvía `total` erróneo y páginas cortas.

### Score organizador (D8) + saved (perfil público)
- `usuariosService.publicProfile()` ahora devuelve **`score`** (AVG de reseñas visibles de sus eventos, 1 decimal; `null` si no hay) y **`saved`** (favoritos totales sobre sus eventos no eliminados). Con esto el host dashboard puede quitar el "—".

### Seed (G10 parcial: rol)
- `seed.cjs`: `artista@demo.com` pasa a rol `'usuario'` — `rol_usuario_enum` solo admite `admin/organizador/usuario`, y `'artista'` rompía el INSERT. Su perfil en la cartelera del evento demo se conserva (es `usuarios_cartelera`, no un rol).

### Pendiente (ya documentado antes)
- **G6** (Cloudinary e2e), **G13** (map routes), **G14** (scraping → modal G3), **G11** (renombrar `reservas`→`tickets`, sección 18), notificaciones de reportes (spec 13 sin wiring en el backend actual).

## Punto final actual — Registro simplificado (2026-09-06)

### Alcance
- **Registro de usuario (5.1):** solo `nombre`, `email` (real, validación MX/anti-desechable), `contraseña` y confirmación de contraseña (frontend). Se eliminaron `apellido`, `telefono`, `cedula` del registro.
- **Backend estricto:** `api/src/auth/dto/register.dto.ts` ahora solo acepta `email`/`password`/`nombre` (whitelist `forbidNonWhitelisted` rechaza campos extra); `auth.service.ts` ya no asigna `apellido`/`telefono`. Los validadores de cédula/teléfono siguen en uso en perfil, admin e info de pago.
- **Frontend usuario:** `frontend/src/components/auth/register-form.tsx` → 4 campos + botón "Continuar con Google" (se mantiene). `registerSchema` en `frontend/src/lib/validation.ts` → `{ nombre, email, password }`.
- **Frontend admin:** `frontend/admin/src/app/register/page.tsx` → nombre, email, contraseña + confirmar contraseña (nuevo); `registerSchema` en `frontend/admin/src/lib/validation.ts` con `.refine` de coincidencia.
- **Spec:** sección 5.1 actualizada.
- **Verificación:** `api/ pnpm run build` ✓ | `lint` ✓ | frontend y frontend/admin `typecheck` + `build` + `lint` ✓ (0 errores; warnings preexistentes).

## Punto final actual — Entrada por sesión: Inicio / Explorar (2026-09-05)

### Alcance
- **Entrada consciente de sesión en `/`:** `/` renderiza **por sesión** (sin redirect ni parpadeo): mientras `isLoading` → spinner; sin sesión → **Inicio** (landing, antigua home); con sesión → **Explorar** (grilla de eventos). Al iniciar sesión (login/register/Google OAuth redirigen a `/`) el usuario cae directo en Explorar.
- **Rutas:** `/` = dispatcher por sesión · `/explorar` = grilla canónica para todos (menú y CTAs; los invitados llegan aquí al tocar "Explorar") · `/inicio` = landing/página institucional (logotipo + footer "Conócenos") · `/eventos/[id]` = detalle (se conserva).
- **Vistas extraídas** a componentes reutilizables (`frontend/src/components/home/`): `inicio-view.tsx` (hero + marquee + grid destacado + clientes + CTA "¿Tienes un evento?"; CTA "Explorar" → `/explorar`) y `explorar-view.tsx` (banner + buscador + filtros modalidad/categoría + grilla). `/inicio/page.tsx` y `/explorar/page.tsx` son wrappers `Navbar + Vista + Footer`.
- **Navbar** (desktop y móvil) con orden estable: **Explorar** (`/explorar`) · **Mapa** (`/mapa`), idéntico para invitados y usuarios. CTA "Crear evento" visible también sin sesión (redirige a `/login`). Logo → `/inicio` (no hay "About" en el menú, patrón Dice.fm/Bubbl.so).
- **Backwards-compat:** `redirects()` en `next.config.mjs` mapea `/eventos → /explorar` (301). Links internos de "volver/explorar" (detalle evento, perfil, mis-reservas) → `/explorar`.
- **Fix lint:** `frontend/eslint.config.mjs` ignoraba solo `.next/**` del root; se agregó `admin/.next/**` (los bundles de build de `frontend/admin/` hacían fallar `eslint .`).
- **Verificación:** `frontend/ pnpm run typecheck` ✓ | `pnpm run lint` ✓ (0 errores; 45 warnings preexistentes `no-img-element`) | `pnpm run build` ✓ (23 rutas; `/`, `/explorar` e `/inicio` estáticas).

---
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
1. **G11** — Renombrar `reservas` → `tickets` (requiere confirmación sección 18)
2. Notificaciones de reportes (spec 13): `reportes_eventos`/`reportes_reservas`/`reportar-impago` no disparan notificaciones aún
3. **G6** — Verificación end-to-end Cloudinary

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
