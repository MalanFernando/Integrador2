# ESPECIFICACIÓN FUNCIONAL — Hasta la Vuelta

> **Documento fuente para desarrollo (OpenCode).**
> Este documento unifica los flujos, vistas, formularios y reglas de negocio de la plataforma.
> Es la **fuente de verdad funcional**: si el código actual (`api/`, `frontend/`, `frontend/admin/`) contradice algo aquí, la especificación manda y el código debe ajustarse.
> Última actualización: 2026-09-05 · Basado en `observaciones.txt` + `ReemplanteoProyecto.txt` + estado actual del repo.

---

## 1. Resumen ejecutivo

**"Hasta la Vuelta"** es una plataforma web de eventos sociales y culturales con geolocalización (Quito, escalable a más ciudades). Tiene **tres dominios de navegación separados** (modelo Buenplan), uno por entidad, que **no mezclan sus flujos**:

| Dominio | App | Puerto | Usuarios |
|---|---|---|---|
| **Usuario** (`https://www.hastalavuelta.com/`) | `frontend/` (Next.js) | 3001 | Invitados y usuarios |
| **Organizador** (`/host/<slug>`, abre en otra pestaña) | `frontend/` — route group `host/[slug]` con layout propio | 3001 | Organizadores y miembros |
| **Admin** (`https://admin.hastalavuelta.com/`) | `frontend/admin/` (Next.js) | 3002 | Superadmin (rol `admin`) |

Backend: `api/` (NestJS 11 + TypeORM + PostgreSQL 15/PostGIS, puerto 3000, prefix `/api/`).
Reportes: `reportes/` (ASP.NET, genera PDF/Excel/QR).

**Roles:** `admin` (superadmin), `organizador`, `usuario` (normal). No existe "usuario común" como concepto en código: el rol se llama `usuario`.

---

## 2. Glosario y convenciones (léelas primero)

| Término | Significado |
|---|---|
| **usuario** | Rol de usuario normal. **Nunca** usar "usuario común" en código, nombres de archivo, DTOs ni UI. |
| **ticket** | Lo que antes se llamaba "reserva/reservación". Ver Decisión D1. |
| **organizador** | Usuario con `rol = 'organizador'`. No existe tabla `organizaciones`. |
| **miembro** | Usuario con permisos limitados sobre los eventos de un organizador (`editor` o `moderador`). |
| **cartelera** | Artistas de un evento (`eventos.usuarios_cartelera`, JSONB, máx. 5). |
| **localidad** | Sección/área de un evento con nombre, aforo y precio propios (JSONB, máx. 4). |
| **slug / dominio** | Nombre personalizable del enlace público del organizador: `https://<plataforma>/host/<slug>`. |
| **score** | Calificación promedio del organizador calculada de sus reseñas (1–5). |
| **destacado** | Evento popular según número de guardados (favoritos) + visitas (`event_visitas`). |

### Convenciones de código (obligatorias)

- Entidades, tablas y endpoints en español (`usuarios`, `eventos`, `tickets`, `resenas`).
- Imports relativos con extensión `.js` (nodenext). `bigint` → `string` en TypeORM/JS.
- `synchronize: false`; los cambios de esquema van solo por `schema.sql`.
- JSONB para estructuras anidadas: `localidades`, `usuarios_cartelera`, `imagenes`, `etiquetas`, `preguntas_frecuentes`, `informacion_pago`, `redes_sociales`, `ubicacion`.
- Eliminación **lógica** con `deleted_at` (+ `fecha_eliminacion` en usuarios). Borrado físico solo tras 90 días (ver Regla R16).
- Sin emojis en la UI: solo iconos `lucide-react`.
- Las listas del panel admin se construyen con `<ol>`/`<ul>` estilizadas, **no** con `<table>` HTML (ver Convención UI-3).
- Respuestas de API envueltas en `{ success, data, message }`; errores en `{ success, statusCode, message, timestamp }`.

---

## 3. Arquitectura y dominios

### 3.1 Separación de dominios por tipo de usuario

Los tres roles operan en **dominios de navegación separados** (modelo Buenplan): cada entidad tiene su propio espacio de URL y su propio flujo de navegación, **sin mezclarse**.

| Entidad | Dominio | Navegación |
|---|---|---|
| **Usuario** (e invitados) | `https://www.hastalavuelta.com/` | Home, Mapa, Explorar, detalle de evento, perfiles públicos |
| **Organizador** | `https://www.hastalavuelta.com/host/[slug]` — abre en **otra pestaña** | Área del host: perfil público (próximos, pasados, reseñas) + gestión (Eventos, Reseñas, Miembros, Tickets, Configuración) |
| **Admin** | `https://admin.hastalavuelta.com/` (subdominio, app `frontend/admin/`) | Panel administrativo completo |

**Regla D-DOM1 (enlace del organizador):** el organizador tiene un enlace público asignado (`/host/<slug>`). El `slug` es **personalizable** por el organizador (ej. `https://www.buenplan.com.ec/host/casa-de-la-cultura`). El slug debe ser único, en minúsculas, sin espacios (guiones permitidos), editable desde "Editar perfil" y desde el formulario de creación del admin.

**Regla D-DOM2 (no mezclar flujos):** los tres dominios **no** comparten navegación:
- Un organizador en su dominio (`/host/<slug>`) **no** ve Home/Mapa/Explorar ni los menús de la plataforma de usuario.
- El panel admin **no** muestra vistas de usuario/organizador ni el nav de la plataforma.
- La plataforma de usuario `/` **no** muestra el menú de gestión del organizador.
- El cambio entre dominios se hace por **URL explícita** (abrir la otra pestaña), nunca por tabs dentro de la misma vista.

### 3.2 Cambio de dominio (usuario ↔ organizador) — por URL

La separación es **100% por URL**: cada dominio se abre en su propia pestaña y no existe un flag de "modo" que mezcle las vistas.

- Un usuario con `rol = 'organizador'` puede alternar entre el **dominio de usuario** (`/`) y su **dominio de host** (`/host/<slug>`). Cambiar a modo organizador = **abrir `/host/<slug>` en una nueva pestaña**; volver a modo usuario = **abrir `/` en una nueva pestaña** (desde la acción "Cambiar de modo (usuario normal)" del nav del host).
- Un usuario con `rol = 'usuario'` navega solo en el dominio `/`.
- **Acciones sociales del organizador:** el "seguir" se ejecuta **solo** en el **dominio de usuario** (`/perfil` del propio usuario, `/perfil/[id]` visitando a otro). Desde el dominio del host (`/host/<slug>`) el botón **Seguir** se muestra únicamente a visitantes que **no** están en modo organizador (usuarios normales); un organizador que visita el host de otro organizador **no puede seguir** desde ahí, debe hacerlo desde su perfil de usuario normal. El perfil del host expone **followers, saved y score** pero **no** "following" (6.8/7.2).
- **Transición por "Crear evento":** si un usuario (logueado o tras login/registro) hace clic en "Crear evento", su cuenta se habilita como organizador (`rol = 'organizador'`) y **se abre `/host/<slug>` en una nueva pestaña**, con un **popup informativo**: *"Ya puedes crear eventos. Puedes volver a tu perfil de usuario desde el botón de perfil en el nav."*
- **Miembros:** al aceptar una invitación de miembro, si el usuario tenía `rol = 'usuario'`, pasa a `rol = 'organizador'` (evita conflicto de perfiles). Su dominio de host muestra la gestión del/los organizador(es) al que pertenece, con los permisos de su rol de miembro.
- **Popups de contexto:** cuando un organizador navega por el dominio de usuario y visita un perfil, se le indica con un popup: *"Puedes cambiar a usuario normal desde el botón de perfil en el nav."*

> **Gap G1:** `usuarios` no tiene columna `slug`. Se debe agregar a `schema.sql` (ver sección 17). El cambio de dominio se resuelve por URL, no por columna de modo.

---

## 4. Roles y permisos

### 4.1 Matriz de roles

| Acción | Invitado | usuario | organizador | miembro (editor) | miembro (moderador) | admin |
|---|---|---|---|---|---|---|
| Navegar Home/Mapa/Explorar (dominio `/`) | ✅ | ✅ | ✅ (dominio usuario) | ✅ | ✅ | — |
| Ver detalle de evento | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver perfiles públicos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Seguir / guardar / reservar / reseñar / reportar (acciones en el **dominio `/`**)¹ | 🔒 (lleva a login) | ✅ | ✅ (solo desde su perfil de usuario normal, **no** desde el host) | ✅ (ídem organizador) | ✅ | ✅ |
| Crear evento | 🔒 (lleva a login y habilita organizador) | ✅ (habilita organizador) | ✅ | ✅ (solo editar, no eliminar) | ❌ | ✅ (crear evento rápido) |
| Editar evento propio | — | — | ✅ | ✅ (no eliminar) | ❌ | ✅ |
| Eliminar/ocultar/publicar evento propio | — | — | ✅ | ❌ | ❌ | ✅ |
| Gestionar miembros | — | — | ✅ | ❌ | ❌ | ✅ |
| Reportar reseña | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reportar ticket | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Eliminar ticket (con motivo) | — | — | ✅ | ❌ | ❌ | ✅ |
| Ver estadísticas de evento | — | — | ✅ | ✅ (solo ver) | ✅ (solo ver) | ✅ |
| Editar perfil del organizador | — | — | ✅ | ❌ | ❌ | ✅ |
| Moderar reseñas (ocultar) | — | — | ✅ (las suyas) | ❌ | ✅ | ✅ |
| Panel admin completo | — | — | — | — | — | ✅ |

¹ **"Seguir" es una acción del dominio de usuario (`/`).** Un usuario con `rol = 'organizador'` (o miembro) solo puede seguir desde su perfil de usuario normal; en el dominio del host (`/host/<slug>`) el botón **Seguir** aparece únicamente para visitantes que no están en modo organizador (3.2). El perfil del host muestra followers/saved/score, sin "following" (6.8).

### 4.2 Permisos de miembros

| Rol de miembro | Permisos |
|---|---|
| **editor** | Similar a admin del organizador pero limitado: puede **editar** eventos (no eliminar), **reportar** reseñas y **reportar** tickets. No puede editar el perfil del organizador ni gestionar miembros. |
| **moderador** | Solo **gestiona reseñas** (reportar/ocultar). Puede **ver** los demás apartados (eventos, tickets, estadísticas) pero sin acciones de escritura. |

---

## 5. Autenticación y registro

### 5.1 Registro / Login

- **Registro:** correo electrónico real (validación de formato + dominio real) o Google OAuth. Campos: `nombre`, `apellido`, `email`, `password` (mín. 8 chars, mayúscula, minúscula, número), `telefono` (opcional). Se crea con `rol = 'usuario'`.
- **Login:** correo + contraseña, o Google.
- **Admin:** solo correo electrónico real (sin Google).
- **Recuperación de contraseña:** `POST /api/auth/forgot-password` (envía email con token) → página `/reset-password` → `POST /api/auth/reset-password`.
- **Cierre de sesión:** si hay una acción pendiente (formulario sin guardar, compra en curso), mostrar aviso: *"Tienes una acción pendiente. ¿Deseas continuar o cancelarla?"* antes de cerrar.

### 5.2 Flujo "Crear evento" (detección de organizador)

```
[Botón "Crear evento" en nav]
   │
   ├─ ¿Ya tienes rol = 'organizador'? (dueño o miembro con permiso de crear)
   │    ├─ NO → ¿Sesión iniciada?
   │    │      ├─ NO → Login/Registro (email real o Google)
   │    │      │        └─ Tras autenticarse se habilita rol = 'organizador'
   │    │      └─ SÍ y rol = 'usuario' → se habilita rol = 'organizador'
   │    │
   │    └─ Usuario normal → NO se muestra la ventana de selección.
   │           Se abre /host/<slug> en una NUEVA PESTAÑA con el perfil de
   │           organizador + popup: "Ya puedes crear eventos. Puedes volver a tu
   │           perfil de usuario desde el botón de perfil en el nav." (ver 3.2)
   │           La creación real del primer evento ocurre desde el nav del host.
   │
   └─ SÍ (organizador) → VENTANA DE SELECCIÓN (modal, 2 opciones):
        ├─ (A) "Publicar desde URL" → scraping de metadatos (ver 9.6)
        └─ (B) "Crear con formulario" → formulario completo (ver 9.5)
```

La misma ventana de selección (A/B) aplica al **admin**: el botón "Crear evento rápido" del panel (8.1) abre el mismo modal. Un usuario con `rol = 'usuario'` **nunca** ve esta ventana.

### 5.3 Acciones que requieren sesión

Ver perfiles públicos **no** requiere sesión. Requieren login (redirigen a `/login` y vuelven tras autenticar): **seguir**, **crear reseña**, **guardar evento**, **reservar/comprar ticket**, **reportar** (evento/ticket/reseña).

---

## 6. Plataforma pública — dominio del usuario (`/`)

> Este dominio es exclusivo de la **entidad usuario** (invitados y usuarios). El organizador lo visita cuando alterna a modo usuario (3.2), pero la gestión de sus eventos vive en `/host/<slug>` (Sección 7).

### 6.1 Navbar (dominio del usuario — `/`)

| Elemento | Comportamiento |
|---|---|
| Logotipo | Link a Home |
| Home | Sección home |
| Mapa | Sección mapa |
| Explorar | Sección explorar |
| Botón "Crear evento" | Flujo 5.2 — organizadores (rol `organizador`): ventana URL/formulario. Usuarios normales (`rol` `usuario`): habilita organizador y abre `/host/<slug>` en nueva pestaña (sin ventana) |
| Botón "Iniciar sesión" | Solo invitados → `/login` |
| Campana 🔔 | Solo logueados: notificaciones |
| Foto de perfil + nombre | Solo logueados. Dropdown: **Ver perfil · Modo organizador (si aplica) — abre `/host/<slug>` en otra pestaña · Eventos guardados · Cerrar sesión** |

### 6.2 Home (`/`)

1. **Hero:** título + información de la plataforma.
2. **Slider de categorías:** desde `categorias` (nombre, icono, color). Click → Explorar filtrado por esa categoría.
3. **4 cards de eventos destacados:** popularidad = `COUNT(favoritos)` + `COUNT(event_visitas)` de eventos `aprobado` y `publico`. Click → detalle del evento.
4. **Slider de organizadores:** logos (`foto_perfil_url`) o nombre si no hay logo, de usuarios `rol = 'organizador'`. Click → perfil público del organizador (`/host/<slug>`).

### 6.3 Mapa (`/mapa`)

**Filtros disponibles (barra de filtros):**
- Búsqueda por: nombre del evento, artista (cartelera), nombre del organizador (muestra los eventos de ese organizador, no su perfil), ubicación/lugar.
- Distancia (radio desde la ubicación del usuario).
- Precio: `free` + rango de precios detectado de los eventos registrados.
- Fecha.
- Sort: alfabético A–Z / Z–A.
- Categorías (listado de `categorias`).

**Comportamiento:**
- Botón flotante en la esquina del mapa → abre **sidebar** con resultados.
- Sin filtros → eventos cercanos a la ubicación del usuario (radio **5 km**, PostGIS `ST_DWithin`). Muestra el número de eventos encontrados.
- **Eventos online:** aparecen en el Mapa **solo si tienen ubicación registrada** (`ubicacion_id` no nulo). Un evento online sin ubicación **no** se muestra aquí ni participa del radio/distancia (se ve en Home/Explorar con badge "En línea", ver 6.4).
- Click en un evento de la lista → **card de detalle** + botón **"Ver rutas"**.
- **Ver rutas** → rutas sugeridas con filtros: `todos | a pie | vehículo` y sort `ruta rápida | menos tiempo`.
- Click en una ruta → **detalle de ruta**: pasos (girar, recto, dar vuelta…), tiempo estimado según ubicación del usuario y punto del evento, vía/calle principal.
- Botón **compartir ruta** → abrir en app externa (Google Maps / otro servicio de mapas).

### 6.4 Explorar (`/explorar`)

- **Slider de eventos populares:** eventos de organizadores **seguidos** por el usuario (si está logueado) + eventos populares de la plataforma. Cada card: título, fecha y hora, descripción, logo del organizador (o nombre), redes sociales del organizador, imagen del evento.
- **Grid de todos los eventos** con los mismos filtros que el Mapa (6.3) **+ filtro "Modalidad: todos · presencial · en línea"**.
- Los eventos online llevan **badge "En línea"** en su card (incluido el slider).
- Click en evento → detalle (6.5).

### 6.5 Detalle de evento (`/eventos/[id]`)

Contenido, en orden:

1. Slider de imágenes (`eventos.imagenes`; si no hay, imagen por defecto).
2. Título del evento + etiqueta (`etiquetas`).
3. Nombre de la ubicación + fecha y hora. **Si el evento es online:** badge **"En línea"** en lugar del nombre de ubicación (y el nombre de ubicación solo si la tiene registrada).
4. Botón de ubicación → redirige al Mapa de la plataforma centrado en el evento. **Si es online y tiene `link_online`:** botón **"Evento en línea"** que abre el link (sustituye al de Mapa); si es online **sin** ubicación y **sin** link, no hay botón de ubicación.
5. Restricción de acceso (`restriccion_acceso`).
6. Descripción.
7. **Card del organizador:** nombre, followers, número de eventos, score, logotipo, redes sociales, botón **Seguir** (requiere login). Click → `/host/<slug>`.
8. **Cartelera** (`usuarios_cartelera`): perfiles de artistas con botón **Seguir**; si el artista no tiene perfil (solo nombre + link), botón **"Visitar"** que abre el link externo.
9. **Preguntas frecuentes** (`preguntas_frecuentes`).
10. **Localidades** (`localidades`): se muestran **solo si el evento es pagado y tiene `informacion_pago` completa**. Cada localidad: nombre, aforo, precio + botón de compra (flujo 10.1). Si el evento es gratuito: botón único "Reservar gratis" (flujo 10.2).
11. Botones: **Guardar** (favorito, requiere login), **Reportar** (requiere login).

### 6.6 Perfil de usuario — propio (`/perfil`)

- **Header:** foto de perfil, portada, nombre, bio, **followers** (clic → modal 6.10, requiere sesión), **following** (clic → modal 6.10, requiere sesión), saved (nº de eventos guardados), botón **Editar perfil**, botón **Compartir perfil**, redes sociales.
- **Menú inferior (tabs):**
  - **Eventos guardados:** cards idénticas a las de Explorar.
  - **Mis tickets:** lista de tickets del usuario. Cada ticket tiene menú de 3 puntos (⋮) con **"Reportar problema"** → modal con motivo obligatorio. Click en un ticket → **detalle de ticket** (ver 10.4): información del evento (título, fecha, ubicación, imagen), número de orden + fecha, QR, botón **"Ver receipt"**, botón **"Reportar"** (motivo obligatorio).
  - **Eventos participante:** eventos donde el usuario está en la cartelera (`usuarios_cartelera` contiene su `usuarioId`). Cards **horizontales**: título, fecha, tipo (free/pagado), valor ("desde $0.00" si gratis; "desde $<monto mínimo>" si pagado). Estado vacío: *"Nadie te ha invitado a ser parte de un evento"* + icono (lucide `Frown`, sin emoji).
  - **Configuración:** ver 6.9.
- **Editar perfil (usuario):** foto de perfil, portada, nombre, apellido, teléfono (visible **solo** en el panel admin como información de contacto), etiqueta (artista, comediante, etc.), bio, redes sociales.

### 6.7 Perfil de otro usuario (`/perfil/[id]`)

- Popup informativo si el visitante es organizador: *"Puedes cambiar a usuario normal desde el botón de perfil en el nav."*
- **Header:** foto, portada, nombre, bio, **followers** (clic → modal 6.10, requiere sesión), **following** (clic → modal 6.10, requiere sesión), saved, botón **Seguir** (requiere login), botón **Compartir**, redes sociales.
- **Tabs:** **Eventos guardados** (cards de Explorar) · **Eventos participante** (cards horizontales, mismo estado vacío que 6.6).

### 6.8 Perfil de organizador — dominio del host (`/host/[slug]`)

Este es el **dominio del organizador** (se abre en otra pestaña). La misma URL muestra:
- **A visitantes** (sin sesión o con sesión de otro perfil): la vista pública aquí descrita.
- **Al dueño/miembros logueados:** la vista pública **+** el área de gestión (Sección 7).

**Vista pública:**
- **Header:** foto de perfil/logotipo, portada, nombre, ubicación, bio, **followers** (clic → modal 6.10 de seguidores, requiere sesión), **saved**, **score**, botón **Seguir** (requiere login; solo para visitantes que no están en modo organizador — ver 3.2), botón **Compartir**, redes sociales.
- **Tabs:**
  - **Próximos eventos:** grid con los eventos públicos más recientes (`fecha_inicio >= hoy`, estado `aprobado`, visibilidad `publico`).
  - **Eventos pasados:** eventos con `fecha_fin < hoy`.
  - **Reseñas:** score del organizador (promedio de `resenas.puntuacion`), botón **"Crear reseña"** (requiere login; ver 9.10), listado de reseñas. Cada reseña: fecha de publicación, perfil del autor, puntaje, nombre del evento, comentario.

### 6.9 Configuración (usuario) — dominio `/`

Bloque de configuración del **dominio de usuario**. El organizador tiene el suyo en su dominio `/host/<slug>` (7.7); las opciones son las mismas pero cada una vive en su dominio, sin mezclarse.

- **Notificaciones (toggles):** Event alerts & reminders · Following and followers · Email notifications · Listed as a guest artist. (Mapea a `preferencias_usuario`.)
- **Cambiar contraseña:** página con campo de correo → envía email con enlace para crear nueva contraseña (flujo 5.1).
- **Eliminar cuenta:** eliminación **lógica** (solo el superadmin ve el perfil). Pasados **90 días** se borra físicamente todo lo relacionado (ver R16). Antes del borrado físico se genera automáticamente un reporte de la cuenta (bitácora) con todos sus movimientos.

### 6.10 Listados de seguidores / siguiendo (modal)

El contador de **followers** (y de **following** en los perfiles de usuario) es **clicable** y abre un **modal** centrado, estilo Instagram. El modal cubre todo el dominio de usuario (`/perfil` y `/perfil/[id]`); en el perfil del host (`/host/[slug]`) solo se abre el listado de **followers** (el host no expone "following").

- **Acceso:** abrir el modal **requiere sesión** (login). Si el visitante no está logueado, al hacer clic en el contador se le lleva al login.
- **Buscador:** campo de búsqueda arriba del modal que filtra por **nombre** (`nombre`/`apellido`). Permite filtrar incluso con muchas listas de seguidores.
- **Lista:** cards de usuario con foto de perfil, nombre y botón **"Seguir"/"Siguiendo"** (toggle, requiere sesión). Click en la card → `/perfil/[id]` (dominio usuario).
- **Paginación:** scroll infinito / paginación conforme se cargan más usuarios.
- **Estado vacío:** *"Todavía no hay seguidores/siguiendo que mostrar."*
- **Datos (API):** se sirve desde `seguidores`/`following` de `usuarios`. Endpoints: `GET social/seguidores/:id` y `GET social/siguiendo/:id`, ambos con **requiere sesión**, filtro por nombre y paginación (ver gaps G16/G17).

---

## 7. Área de gestión del organizador — dominio `/host/[slug]`

Vive en el **dominio del organizador** (`/host/[slug]`), la misma URL de 6.8. Cuando el dueño o un miembro inicia sesión allí, además de la vista pública ve el **menú de gestión**: Eventos · Reseñas · Miembros · Tickets · Configuración. Este dominio es **independiente** del dominio de usuario (no tiene Home/Mapa/Explorar).

### 7.1 Navbar (dominio del host — `/host/[slug]`)

| Elemento | Comportamiento |
|---|---|
| Logotipo | **Solo visual** (sin link) |
| Botón "Crear evento" | Ventana de selección URL/formulario (5.2, opciones A/B) |
| Campana 🔔 | Notificaciones |
| Foto de perfil + nombre | Dropdown: **Cambiar de modo (usuario normal) — abre `/` en otra pestaña · Cerrar sesión** |

El organizador **no** tiene Home, Mapa ni Explorar en este dominio.

### 7.2 Perfil del organizador — propio

- **Header:** foto de perfil/logotipo, portada, nombre, ubicación, bio, **followers** (clic → modal 6.10 de seguidores, requiere sesión), **saved**, **score**, botón **Editar perfil**, botón **Compartir perfil**, redes sociales.
- **Menú inferior (tabs):** Eventos · Reseñas · Miembros · Tickets · Configuración.
- **Editar perfil (organizador):** foto de perfil, portada, nombre, apellido, número de contacto, descripción, **slug/dominio** (personalizable), redes sociales, ubicación.

### 7.3 Eventos (gestión + estadísticas)

**Acciones por evento:** crear · editar · publicar · ocultar · eliminar (lógica, solo visual para el organizador; el registro persiste para el superadmin) · ver estadísticas.

**Estadísticas por evento:**
- Encabezado: ubicación, fecha/hora de actualización.
- Filtro temporal: este mes · esta semana · hoy · fecha específica (calendario).
- Botón **Generar reporte** (→ módulo ASP.NET).
- Totales: nº de tickets, nº de vistas (`event_visitas`), nº de reseñas, nº de guardados (`favoritos`).
- **Gráfica dona:** estado de reseñas (nº de reseñas por puntuación).
- **Gráfica de barras:** localidades (nº de tickets por localidad).

### 7.4 Reseñas (organizador)

- Score global (promedio de puntuaciones).
- Buscador: por nombre, usuario, nombre de evento.
- Filtros: por estado, por puntuación. Sort: A–Z / Z–A.
- Click en el perfil del autor → **abre otra pestaña** en el dominio de usuario (`/perfil/[id]`) para visitar ese perfil.

### 7.5 Miembros (organizador)

- Primera card: el propio organizador (nombre de usuario, rol: **Admin**).
- **Crear miembro** (máx. 2 activos, ver R8):
  - **Opción A (usuario existente):** buscador de usuarios de la plataforma → seleccionar → botón **"Notificar"** → el usuario recibe notificación para aceptar ser miembro.
  - **Opción B (no existe):** formulario con `email` + `rol` (editor/moderador) → al guardar se envía correo de registro → cuando el usuario se registra con ese correo, se le asigna automáticamente como miembro. Si nunca se registra, no pasa nada (proceso manual posterior).
- **Si el organizador es miembro de otro organizador:** card inferior con su foto, nombre, tipo de miembro (editor/moderador) y opción **"Darse de baja"**.

### 7.6 Tickets (organizador)

- Búsqueda: por nombre de evento o código de ticket.
- Filtros: tipo (free/pagado), fecha. Sort: A–Z / Z–A.
- Click en un evento → **detalle de tickets del evento**:
  - Botón **Generar reporte** (asistentes).
  - Lista de asistentes con filtros: búsqueda por nombre de usuario/correo · filtro por localidad · filtro por estado del ticket · filtro por fecha de emisión.
  - **Acciones por ticket:** **Eliminar** (motivo obligatorio: duplicado, error en localidad, etc.) · **Reportar error**.
- **Reglas de no-intervención (R1–R4):** el organizador **no** crea tickets a nombre de usuarios, **no** modifica cantidades, **no** marca tickets como verificados sin justificación, **no** administra la entrada de asistentes como actividad cotidiana. La lista de asistentes es informativa.

### 7.7 Configuración (organizador) — dominio `/host/[slug]`

Mismas opciones base que 6.9 (notificaciones, cambiar contraseña, eliminar cuenta) pero en el **dominio del host** + gestión del **slug/dominio**.

---

## 8. Panel administrativo (superadmin)

### 8.1 Layout — dominio del admin (`admin.hastalavuelta.com`)

El panel admin es un **dominio aislado** (`https://admin.hastalavuelta.com/` en producción; app `frontend/admin/` en dev). El admin opera **solo** aquí: no navega la plataforma de usuario ni el host para gestionar, y no ve el nav de la plataforma.

- **Login/registro:** estrictamente con correo electrónico real.
- **Logo** arriba a la izquierda.
- **Header (nav):** botón **"Crear evento rápido"** — abre la **misma ventana de selección del organizador (5.2)**: (A) Publicar desde URL (9.6) / (B) Crear con formulario (9.5) · campana 🔔 · foto de perfil + nombre → dropdown: **Editar perfil · Cerrar sesión**.
- **Menú lateral:** Dashboard · Reportes · Usuarios · Organizadores · Eventos · Reseñas · Tickets · Categorías · Registro · Configuración · Cerrar sesión.

### 8.2 Dashboard

- Encabezado: ubicación, fecha, hora.
- Filtro temporal: este mes · esta semana · hoy · fecha específica (calendario).
- Botón **Generar reporte**.
- Totales: eventos · usuarios · organizadores · categorías · pendientes/revisión.
- **Gráfica:** eventos por categoría.
- **Actividades recientes:** de todos los usuarios (incluido superadmin) — fuente `bitacora_auditoria`.
- **Lista de eventos que requieren atención:** pendientes de revisión o con problemas (reportados).
- **Gráfica:** estado de organizadores.
- **Lista de eventos reservados** (con tickets).

### 8.3 Usuarios

- Total de usuarios (incluye admin e inactivos).
- Botones: **Generar reporte** · **Crear nuevo usuario**.
- Totales: activos · organizadores · admins · inactivos · suspendidos.
- Filtros: buscador (nombre, correo) · estado · rol · sort (A–Z / Z–A).
- **Lista (ol/ul):** usuario (mini perfil: foto, nombre, correo) · rol · registro (fecha) · estado (activo, inactivo/suspendido, eliminado) · actividad (última hora/fecha de actividad) · acciones (editar perfil, activar, inactivo/suspender, eliminar — lógica).
- **Crear usuario:** selector de rol → formularios según rol (ver 9.7).

### 8.4 Organizadores

- Total de organizadores (incluye inactivos y eliminados lógicos).
- Botones: **Generar reporte** · **Crear nuevo organizador**.
- Totales: activos · inactivos · nuevos · eliminados.
- Filtros: buscador (nombre, correo) · estado · nº de eventos · sort.
- **Lista (ol/ul):** organizador (foto, nombre de usuario, correo/ubicación) · responsable (nombre y apellido) · eventos (nº) · miembros (nº) · estado · acciones (editar perfil, activar, inactivo/suspender, eliminar — lógica).
- **Crear organizador:** ver 9.8.

### 8.5 Eventos

- Total de eventos (incluye inactivos, eliminados lógicos y en revisión).
- Botones: **Generar reporte** · **Crear nuevo evento**.
- Totales: activos · inactivos · en revisión · eliminados · reportados.
- Filtros: buscador (nombre del evento, nombre del organizador) · categoría · estado · fecha (calendario) · sort.
- **Lista (ol/ul):** evento (miniatura, nombre, ubicación) · organizador · fecha de creación · estado (activo, inactivo/suspendido, eliminado, aprobado, en revisión) · acciones (editar, activar, inactivo/suspender, eliminar — lógica, **revisar**, **aprobar**).
- **Crear evento:** ver 9.5 (con selector de organizador).

### 8.6 Reseñas

- Texto de cabecera: *"Revisión y gestión de comentarios publicados por usuarios"*.
- Botón **Generar reporte**.
- Totales: total · nuevas · reportadas · eliminadas.
- Filtros: buscador (nombre de usuario, nombre de evento) · estado · puntuación · fecha.
- **Lista (ol/ul):** cada reseña con acciones: **Revisar** · **Eliminar** (lógica; desaparece para el organizador y para el autor).

### 8.7 Tickets

- Total de tickets válidos de la plataforma.
- Botón **Generar reporte**.
- Totales: total · nuevos · reportados · eliminados.
- Filtros: buscador (nombre del evento, nombre del organizador) · estado · nº de tickets · fecha · sort.
- **Lista (ol/ul) por evento:** evento (miniatura, nombre, ubicación) · organizador · fecha de creación · tickets (nº) · estado · acciones (**Ver lista de tickets**, **Revisar evento**).
- **Ver lista de tickets:** botón generar reporte · card del evento (miniatura, título, fecha y lugar, nº de tickets válidos) · totales (total incl. eliminadas/reportadas, válidas, localidades, reportadas, eliminadas) · filtros (nombre de usuario/correo, localidad, estado, fecha de emisión) · lista de asistentes: nombre y correo (miniatura) · fecha de emisión · fecha de ingreso del usuario a la plataforma · localidad · estado · acciones (**Revisar**, **Eliminar** — lógica).

### 8.8 Categorías

- Apartado sencillo: listado de categorías · botón **Crear nueva** · cada categoría con menú de 3 puntos (⋮): **Editar · Eliminar**.
- **Formulario:** nombre (obligatorio) + sugeridos: descripción, icono, color (usados en el slider del Home).
- En el dropdown de categoría del formulario de evento debe existir la opción **"+ Nueva categoría"** para crearla inline sin salir del formulario.

### 8.9 Registro (bitácora de actividad)

- Registro de todas las acciones de usuarios logueados (admin, organizadores, usuarios).
- Botón **Generar informe general**.
- Totales: total de registros · usuarios activos · acciones reportadas · acciones en revisión · eliminados/reportados.
- Filtros: búsqueda (nombre de usuario, correo) · tipo de usuario · estado · tipo de acción (administrativa o de usuario) · fecha.
- **Lista (ol/ul):** nombre (miniatura, nombre, correo) · tipo (admin, organizador, usuario) · fecha de última acción · descripción (ej. `Acción administrativa: <referencia>`) · estado (activo, inactivo, eliminado).
- Fuente: `bitacora_auditoria`.

### 8.10 Reportes (por definir — propuesta)

- Generación de reportes de **todas** las secciones del panel (usuarios, organizadores, eventos, reseñas, tickets, categorías, bitácora).
- Reporte **por perfil de usuario** (actividad completa de un usuario específico).
- Exportación: PDF/Excel vía módulo ASP.NET (`reportes/`).
- Reportes personalizados por **teléfono** (SMS/WhatsApp) para promociones, anuncios y avisos (ver R13).

### 8.11 Configuración (por definir — propuesta)

- Parámetros globales de la plataforma: nombre/logo, URLs (frontend, admin), SMTP, Cloudinary, plantilla de mensaje WhatsApp, límites globales (eventos/miembros por plan), modo mantenimiento, políticas y términos (URLs usadas en el checkout).

---

## 9. Formularios (especificación detallada)

> Convención: `*` = obligatorio. Validaciones existentes en `api/src/common/validators/` (email real, cédula ecuatoriana, teléfono ecuatoriano).

### 9.1 Registro de usuario
| Campo | Tipo | Reglas |
|---|---|---|
| nombre * | text | |
| apellido * | text | |
| email * | email | validación de email real |
| contraseña * | password | mín. 8, mayúscula, minúscula, número |
| teléfono | tel | opcional, formato ecuatoriano |

### 9.2 Login
Email + contraseña, o botón Google. Link a registro y a "olvidé mi contraseña".

### 9.3 Editar perfil — usuario
foto de perfil · portada · nombre · apellido · teléfono (solo visible en panel admin) · etiqueta (artista, comediante…) · bio · redes sociales.

### 9.4 Editar perfil — organizador
foto de perfil · portada · nombre · apellido · número de contacto · descripción · **slug/dominio** (personalizable, único) · redes sociales · ubicación.

### 9.5 Crear/editar evento (formulario)

**Selector previo (solo admin):** buscador de organizador por nombre/correo para asignarle el evento; si no existe, enlace rápido a "Crear usuario".

| Sección | Campos |
|---|---|
| **Datos generales** | Imagen de portada (máx. 3 imágenes, máx. 2 MB c/u, resolución 1080×1200, formatos jpg/png/jpeg/webp) · Nombre del evento * · Categoría * (dropdown, con opción "+ Nueva categoría") · Clasificación de edad (dropdown, default "Todo público") · Etiqueta (ej. música, concierto, danza) · Fecha y hora de inicio * · Fecha y hora de finalización * · Aforo (numérico, default 1) · Visibilidad (dropdown, default "Público") · Descripción * (máx. 500) |
| **Modalidad** | Evento online (toggle) + **Link del evento en línea** (opcional, se muestra si el toggle está ON; p.ej. acceso a streaming/plataforma) |
| **Ubicación** | Búsqueda de dirección en mapa **o** campos: dirección · ciudad/localidad · nombre del lugar. **Obligatoria** si el evento es **presencial** (`online = false`); **opcional** si es online (si se completa, el evento online también aparece en el Mapa y filtros regionales) |
| **Artistas en cartelera** (opcional) | Búsqueda de usuarios registrados; si no existe: nombre del artista + link de red social/web (crea botón "Visitar"). Máx. 5. |
| **Localidades** (repetible) | Nombre (ej. VIP) · Aforo · Precio. Botón eliminar por localidad. Máx. 4. |
| **Evento gratuito** (toggle) | Si se activa, **deshabilita** la sección de información de pago. |
| **Información de pago** * (si no es gratuito) | Nombre del destinatario · Número de contacto de pago · Número de cuenta bancaria · Tipo de cuenta (dropdown: Ahorros/Corriente) · Número de cédula · **Foto de la cédula** (verificación anti-estafa, ver D3) · (sugerido: Banco) |
| **Preguntas frecuentes** (repetible) | Título · Respuesta (máx. 500). Botón eliminar por pregunta. |

**Regla de publicación:** todo evento creado pasa a estado `pendiente` (revisión del admin). Al aprobarse se publica automáticamente (ver 10.4).

### 9.6 Crear evento desde URL (scraping)
- Campo: pegar el link del evento externo — **Instagram, Facebook, TikTok u otro** → se leen los metadatos (título, descripción, imágenes, fecha) y se precargan en el formulario 9.5.
- **Modalidad:** si se activa "Evento online", el campo **Link del evento en línea** se precarga con la URL pegada. La **ubicación pasa a opcional** (única obligatoria si el evento es presencial — ver 9.5). Como la plataforma es de eventos-en-un-lugar, se anima a completar la ubicación aunque el evento sea online para que aparezca también en el Mapa.
- El evento resultante también pasa por revisión (`pendiente`).

### 9.7 Crear usuario (admin) — según rol seleccionado

**Rol = organizador:**
- **Datos personales:** foto de perfil · portada · nombre · apellido · número de contacto · correo * · nombre de usuario (nombre visible en perfil, ej. "Casa de la Cultura") · descripción (bio).
- **Accesos y permisos:** contraseña · repetir contraseña · estado (activo/inactivo).
- **Social media (5 links):** sitio web · instagram · facebook · tiktok · otro.
- **Dominio:** slug asignado (personalizable).
- **Ubicación:** buscador + mini mapa, o campos: dirección (calles) · ciudad/localidad · nombre del lugar (teatro, centro de convenciones, coliseo…).
- **Miembros:** buscador de usuario existente + botón "Notificar"; o formulario email + rol (ver 7.5).

**Rol = admin:**
- **Datos personales:** foto de perfil · nombre · apellido · número de contacto · correo *.
- **Accesos y permisos:** contraseña · repetir contraseña · estado (activo/inactivo).

**Rol = usuario:**
- **Datos personales:** foto de perfil · portada · nombre · apellido · número de contacto · correo * · etiqueta (artista, cantante, blogger…) · descripción (bio).
- **Accesos y permisos:** contraseña · repetir contraseña · estado (activo/inactivo).
- **Social media (5 links):** sitio web · instagram · facebook · tiktok · otro.

### 9.8 Crear organizador (admin)
1. **Buscador:** buscar por nombre o correo un usuario existente → asignarlo como organizador → se le notifica que tiene cuenta de organizador.
2. Si no existe: enlace rápido a "Crear usuario" (formulario 9.7 con rol organizador).
3. Tras asignar/crear, el formulario es el mismo que "Rol = organizador" de 9.7.

### 9.9 Crear miembro
- Opción A: buscador de usuario existente → botón "Notificar".
- Opción B: email + rol (editor/moderador) → correo de registro → auto-asignación al registrarse.

### 9.10 Crear reseña
- Seleccionar un **evento** de los que tenga el perfil del organizador (próximos o pasados).
- Calificación: **1–5** (estrellas; ver D2).
- Comentario.
- Botón **Publicar**. Una reseña por usuario por evento (constraint `uk_autor_evento`).

### 9.11 Reportar (evento / ticket / reseña)
Modal con **motivo obligatorio** (textarea). El reporte queda `pendiente` para el admin.

### 9.12 Compra de ticket (checkout)
| Campo | Reglas |
|---|---|
| nombre * | |
| cédula * | validación cédula ecuatoriana |
| correo * | email real |
| número de celular * | formato ecuatoriano |
| Aceptar términos y políticas * | checkbox obligatorio |
| Información de pago del organizador | solo lectura (destinatario, cuenta, tipo de cuenta, banco) — solo eventos pagados |
| Botón **Comprar** | dispara flujo 10.1/10.2 |

### 9.13 Categoría (admin)
Nombre * · descripción (opcional) · icono (opcional) · color (opcional).

### 9.14 Cambiar contraseña
Campo correo → envía email con enlace → nueva contraseña (mismas reglas que registro).

---

## 10. Flujos transaccionales

### 10.1 Compra de ticket — evento pagado

```
Detalle de evento → Localidades visibles (solo si pagado + info de pago completa)
   │
   ├─ Usuario selecciona una localidad
   │
   ├─ Apartado de compra (checkout, formulario 9.12)
   │    ├─ Datos para la factura: nombre, cédula, correo, celular
   │    ├─ Aceptar términos y políticas (obligatorio)
   │    └─ Se muestra la información de pago del organizador (destinatario, cuenta, tipo, banco)
   │
   ├─ Botón "Comprar"
   │    ├─ Se abre WhatsApp (wa.me/<teléfono de pago del organizador>)
   │    │    └─ Mensaje automático prellenado: datos del usuario (nombre, cédula, correo, celular)
   │    │       + localidad seleccionada + evento + referencia de ticket
   │    └─ Se genera el ticket (estado `confirmada`) con QR
   │         └─ Visible al instante y en "Mis tickets" del perfil
   │
   └─ Verificación externa (fuera de la plataforma):
        El organizador verifica en su cuenta bancaria si existe el pago con los datos del WhatsApp.
        ├─ Pago OK → no requiere acción (el ticket queda `confirmada`)
        ├─ Pago NO recibido → el organizador reporta el ticket al admin (motivo)
        │    └─ Admin revisa → puede invalidar el ticket (estado `invalidada`)
        │         ├─ El ticket NO se borra para el usuario, pero se le notifica (motivo)
        │         └─ El usuario ya no puede ver el detalle del ticket
        │              └─ El usuario puede reclamar (⋮ → motivo) → el admin resuelve
        └─ Ticket reportado erróneamente → el usuario reclama → admin desestima → ticket restaurado
```

### 10.2 Compra de ticket — evento gratuito

Mismo flujo que 10.1 con dos diferencias:
- **No** se muestra la información de pago del organizador (cuenta bancaria).
- El mensaje de WhatsApp confirma la reserva gratuita (sin datos bancarios).

> **Sugerencia S1:** para eventos gratuitos, evaluar reemplazar el paso de WhatsApp por una notificación in-app al organizador (el WhatsApp quedaría opcional). Mantener el flujo actual si se prefiere paridad total.

### 10.3 Verificación de tickets (excepcional)

- La verificación (`estado = verificada`, con `fecha_verificacion`, `verificado_por`, `motivo_intervencion`) es **excepcional**: solo en resolución de disputas o intervención administrativa justificada.
- **Prohibido** como actividad cotidiana de entrada de asistentes (R3, R4).

### 10.4 Revisión/aprobación de eventos

```
Organizador crea evento → estado `pendiente`
   │
   ├─ Admin revisa (panel Eventos → "Revisar")
   │    ├─ Aprobado → estado `aprobado` → se publica automáticamente
   │    └─ Rechazado → estado `rechazado` + `motivo_rechazo` → notificación al organizador con los motivos
   │
   └─ Criterios de revisión: anomalías, posible estafa, palabras inadecuadas, imágenes inapropiadas
```

### 10.5 Invitación de miembros

```
Organizador → Miembros → Crear miembro
   ├─ Opción A: usuario existente → notificación → acepta → estado `activo` (máx. 2)
   ├─ Opción B: email + rol → correo de registro → usuario se registra con ese correo
   │            → se asigna automáticamente como miembro (estado `activo`)
   │            → si nunca se registra, no se asigna (proceso manual posterior)
   └─ Miembro aceptado → si rol='usuario' pasa a 'organizador' (evita conflicto de perfiles)
```

### 10.6 Eliminación de cuenta (90 días)

```
Usuario/organizador elimina cuenta → eliminación LÓGICA (deleted_at, fecha_eliminacion)
   ├─ Solo el superadmin puede ver el perfil eliminado
   ├─ Pasados 90 días → borrado FÍSICO de la cuenta y todo lo relacionado
   │    └─ Antes del borrado: se genera automáticamente un reporte de la cuenta
   │       (bitácora con todos los movimientos) y se notifica
   └─ Mismo principio para eliminaciones de eventos/tickets/reseñas del organizador:
        son lógicas; el superadmin conserva los registros para gestión y orden
```

### 10.7 Reportes y resolución (admin)

- Todo reporte (evento, ticket, reseña) entra con estado `pendiente`.
- El admin lo revisa → `revisado` (con `observacion_gestion`) o `desestimado`.
- Notificaciones automáticas a las partes afectadas según el caso.

---

## 11. Reglas de negocio

| # | Regla |
|---|---|
| R1 | **No** crear tickets a nombre de usuarios. Excepción: fallo del sistema que requiera intervención manual (registrar `intervenido_por` + `motivo_intervencion`). |
| R2 | **No** modificar arbitrariamente la cantidad de tickets de una reserva. |
| R3 | **No** marcar tickets como verificados sin justificación (`motivo_intervencion` obligatorio). |
| R4 | **No** administrar la entrada de asistentes como actividad cotidiana. |
| R5 | Máx. **5 eventos activos** por organizador (trigger `check_max_eventos_organizador`). Aplica a eventos creados por formulario o por URL. |
| R6 | Máx. **2 miembros activos** por organizador (trigger `check_max_miembros`). |
| R7 | Máx. **5 artistas** en cartelera y máx. **4 localidades** por evento (validación en DTO/servicio). |
| R8 | Un artista (usuario en cartelera) **no puede tener conflicto de horarios** entre eventos (pendiente de implementar, ver G7). |
| R9 | Todo evento nuevo pasa por **revisión del admin** antes de publicarse (`pendiente` → `aprobado`/`rechazado`). |
| R10 | Las localidades se muestran/habilitan **solo** si el evento es pagado y tiene `informacion_pago` completa. |
| R11 | La información de pago es **obligatoria** para eventos pagados (incluye foto de cédula). |
| R12 | Eliminación de tickets por el organizador exige **motivo obligatorio**. |
| R13 | El teléfono del usuario/organizador es visible **solo** en el panel admin y sirve para reportes personalizados, promociones y anuncios (SMS/WhatsApp). |
| R14 | Seguir a un organizador ⇒ sus eventos aparecen en el slider de Explorar del seguidor. |
| R15 | Ver perfiles públicos no requiere sesión; seguir/reseñar/guardar/reservar/reportar sí. |
| R16 | Eliminaciones son **lógicas**; borrado físico solo tras **90 días** de eliminación de cuenta, con reporte automático previo. |
| R17 | Una reseña por usuario por evento (constraint `uk_autor_evento`). Puntuación 1–5. |
| R18 | `fecha_fin > fecha_inicio` en eventos (constraint `ck_fechas_validas`). |
| R19 | Un usuario no puede seguirse a sí mismo (constraint `ck_no_auto_seguir`). |
| R20 | El slug/dominio del organizador es **único** y personalizable. |
| R21 | El admin se registra/inicia sesión **solo** con correo electrónico real. |
| R22 | Los reportes (evento/ticket/reseña) exigen **motivo obligatorio**. |
| R23 | El organizador puede tener como máximo 5 eventos activos; el límite se escala con **planes** (monetización). |

---

## 12. Máquinas de estado

### Evento (`estado_evento_enum`)
```
borrador ──(enviar a revisión)──▶ pendiente ──(admin aprueba)──▶ aprobado (publicado automáticamente)
                                     │
                                     └──(admin rechaza + motivo)──▶ rechazado
aprobado ──(organizador cancela)──▶ cancelado
aprobado ──(fecha_fin < hoy)──▶ finalizado
cualquiera ──(eliminación lógica)──▶ deleted_at != NULL (visible solo para admin)
```

### Ticket (`estado_ticket_enum`)
```
confirmada (generado; pago pendiente de verificación externa)
   ├──(verificación excepcional justificada)──▶ verificada
   ├──(organizador reporta no-pago / admin)──▶ reportada ──(admin invalida)──▶ invalidada
   ├──(organizador elimina con motivo)──▶ cancelada
   └──(usuario reclama y admin desestima)──▶ confirmada (restaurado)
```

### Reseña (`estado_resena_enum`)
```
visible ──(reportada por usuario/organizador/moderador)──▶ reportada
visible/reportada ──(admin/moderador oculta)──▶ oculta
```

### Usuario (`estado_usuario_enum` + soft delete)
```
activo ──(admin suspende)──▶ suspendido
activo ──(admin inactiva)──▶ inactivo
cualquiera ──(eliminación lógica)──▶ deleted_at (visible solo admin) ──(90 días)──▶ borrado físico
```

### Miembro (`estado_miembro_enum`)
```
pendiente (invitado) ──(acepta)──▶ activo
pendiente/activo ──(rechaza / darse de baja / admin)──▶ inactivo
```

### Reporte (`estado_reporte_*_enum`)
```
pendiente ──(admin gestiona)──▶ revisado | desestimado
```

---

## 13. Notificaciones

| Tipo | Disparador | Destinatario |
|---|---|---|
| `miembro_invitacion` | Organizador invita miembro | Usuario invitado |
| `miembro_aceptado` | Usuario acepta ser miembro | Organizador |
| `evento_revision` | Evento creado/enviado a revisión | Admin |
| `evento_aprobado` | Admin aprueba evento | Organizador |
| `evento_rechazado` | Admin rechaza evento (+ motivo) | Organizador |
| `evento_reportado` | Usuario reporta evento | Admin |
| `ticket_reportado` | Organizador/usuario reporta ticket | Admin + partes |
| `ticket_invalidado` | Admin invalida ticket (+ motivo) | Usuario titular |
| `ticket_reclamo` | Usuario reclama ticket invalidado | Admin |
| `nuevo_seguidor` | Alguien sigue un perfil | Seguido |
| `nueva_resena` | Usuario reseña un evento | Organizador |
| `recordatorio_evento` | Evento próximo (Event alerts & reminders) | Usuarios con ticket |
| `cartelera_invitacion` | Organizador agrega artista a cartelera | Artista |
| `cuenta_eliminacion` | Aviso de borrado físico (90 días) | Usuario (email) |
| `reporte_generado` | Reporte de cuenta previo al borrado | Admin |

Preferencias por usuario (`preferencias_usuario`): `notificaciones_eventos`, `notificaciones_seguidores`, `notificaciones_email`, `listado_como_artista`.

---

## 14. Integraciones

| Servicio | Uso |
|---|---|
| **Cloudinary** | Subida/almacenamiento de imágenes (perfiles, portadas, eventos, foto de cédula). Pendiente de integrar (G6). |
| **WhatsApp (wa.me)** | Canal de confirmación de pago y notificación de tickets (flujos 10.1/10.2). Mensajes prellenados con datos del usuario + localidad. |
| **OpenStreetMap / Leaflet** | Mapas de la plataforma. |
| **OSRM (o similar)** | Cálculo de rutas (a pie/vehículo), pasos, tiempo estimado. |
| **Google Maps (share)** | Compartir rutas a apps externas. |
| **Google OAuth** | Login/registro con Google. |
| **SMTP (Nodemailer)** | Emails: reseteo de contraseña, invitaciones de miembros, notificaciones, avisos de eliminación. |
| **ASP.NET (`reportes/`)** | Reportes PDF/Excel, tickets con QR. Debe actualizarse a la nueva estructura (G9). |
| **PostGIS** | Consultas radiales (eventos a 5 km), distancia, rutas. |

---

## 15. Convenciones de UI/UX

- **UI-1:** Panel oscuro: bordes `border-white/10`, textos `#848484` (muted) / `#45B46A` (verde) / `#C04C4C` (rojo), títulos `font-clash`, stats grandes `text-[40px] font-medium`.
- **UI-2:** Sin emojis: solo iconos `lucide-react` (incluido el estado vacío de "Eventos participante").
- **UI-3:** Las listas del panel admin se construyen con `<ol>`/`<ul>` estilizadas (estilo de librerías profesionales), **no** con `<table>` HTML.
- **UI-4:** Cards de eventos: verticales en Explorar/guardados; **horizontales** en "Eventos participante".
- **UI-5:** Menús de acciones con botón de 3 puntos (⋮) → dropdown.
- **UI-6:** Popups informativos para cambios de modo (usuario ↔ organizador).
- **UI-7:** Los formularios de creación/edición usan secciones colapsables con títulos (Datos generales, Modalidad, Ubicación, etc.).

---

## 16. Decisiones técnicas y sugerencias

### D1 — Renombrar "reservas/reservaciones" → "tickets" ✅ RECOMENDADO
El proyecto está en fase pre-release y `schema.sql` es la fuente de verdad: **el costo del renombrado es bajo ahora y alto después**. Se recomienda hacerlo.

| Actual | Propuesto |
|---|---|
| tabla `reservas` | `tickets` |
| tabla `reportes_reservas` | `reportes_tickets` |
| enum `estado_reserva_enum` | `estado_ticket_enum` |
| módulo API `reservas` | `tickets` |
| entidad `Reserva` | `Ticket` |
| ruta frontend `/mis-reservas` | `/mis-tickets` |
| textos UI "reservación/reserva" | "ticket" |

> Si se decide mantener "reservas", este documento es 1:1 (solo cambia la terminología). Los campos `codigo_ticket`, `qr_payload`, `fecha_verificacion`, `verificado_por` ya usan nomenclatura de ticket.

### D2 — Puntuación de reseñas: 1–5 (no 0–5)
La DB ya restringe `puntuacion BETWEEN 1 AND 5`. Una reseña con 0 estrellas no tiene sentido. La UI muestra estrellas 1–5.

### D3 — Verificación de datos de pago con foto de cédula ✅
Se adopta la idea: `informacion_pago.fotoCedulaUrl` (obligatoria para eventos pagados). La foto se sube a Cloudinary y es visible solo para el admin (revisión anti-estafa). Sugerencia adicional: el admin puede **rechazar la info de pago** durante la revisión del evento si la cédula no coincide con el nombre del destinatario.

### D4 — Agregar campo `banco` a `informacion_pago`
El mensaje de WhatsApp y el checkout muestran "cuenta bancaria" sin banco. Se sugiere agregar `banco` (dropdown o texto) para que el usuario sepa a qué banco depositar.

### D5 — Cambio de dominio por URL (sin flag de modo) ✅
La separación de dominios (3.1/3.2) es **100% por URL**: cada dominio vive en su propia ruta/pestaña. **No** se agrega `modo_activo`; solo `usuarios.slug VARCHAR(100) UNIQUE` (dominio público del organizador, editable). Ver G1.

### D6 — WhatsApp como canal de confirmación, no pasarela de pago
El pago se confirma **externamente** (organizador revisa su banco). No integrar pasarela de pago en esta fase. El ticket se genera al instante con estado `confirmada`; la verificación bancaria es responsabilidad del organizador (con reporte al admin si no recibe el pago).

### D7 — Popularidad de eventos (destacados)
`popularidad = COUNT(favoritos) + COUNT(event_visitas)` sobre eventos `aprobado` + `publico`. Implementar como query agregada (vista o endpoint), no como columna calculada.

### D8 — Score del organizador
`AVG(resenas.puntuacion)` de las reseñas `visible` de sus eventos. Redondear a 1 decimal.

### D9 — Monetización (roadmap)
Planes ya existen en DB (`basico`, `pro`, `premium`): escalan `max_eventos` y `max_miembros`, y habilitan reseñas premium y publicidad nativa (no invasiva, integrada como componente de UI). No bloquear el desarrollo actual.

### D10 — Categorías: dropdown con "+ Nueva categoría"
En el formulario de evento, el dropdown de categoría incluye la opción de crear una categoría nueva inline (nombre mínimo) sin salir del formulario.

### D11 — Reportes y Configuración del admin (por definir)
Se proponen en 8.10 y 8.11. Confirmar alcance con el dueño del producto.

---

## 17. Gaps detectados (schema/código actual vs. esta especificación)

| # | Gap | Acción |
|---|---|---|
| G1 | `usuarios` no tiene `slug` (dominio `/host/<slug>`) | Agregar columna `slug` a `schema.sql` + entidad + DTOs + validación de unicidad |
| G2 | No existe el dominio `/host/[slug]` en `frontend/` (route group con layout/nav propios: vista pública + gestión del organizador) | Crear route group `frontend/src/app/host/[slug]/` con `layout.tsx` dedicado (nav del host, sin Home/Mapa/Explorar) |
| G3 | La ventana de selección "Crear evento" (URL vs formulario, 5.2) no existe en el frontend: falta en el nav del host (7.1), en el navbar usuario para organizadores (6.1) y en el "Crear evento rápido" del admin (8.1). Para usuarios normales NO se debe mostrar (transición directa a `/host/<slug>`) | Implementar modal de elección A/B reutilizable en los 3 puntos de entrada |
| G4 | El sidebar del admin aún tiene "Establecimientos" (tabla eliminada) y le faltan Tickets, Categorías, Registro | Actualizar `admin-sidebar.tsx` |
| G5 | `frontend/admin/` usa formularios desactualizados (eventos, usuarios) | Refactorizar contra la nueva API |
| G6 | Cloudinary no integrado | Integrar subida de imágenes |
| G7 | Detección de conflicto de horarios de artistas pendiente | Implementar validación (R8) |
| G8 | Job de borrado físico a los 90 días pendiente | Cron/scheduled job + reporte automático (R16) |
| G9 | `reportes/` (ASP.NET) usa consultas de la estructura anterior | Actualizar consultas SQL |
| G10 | `scripts/seed.cjs` desactualizado | Actualizar a la nueva estructura |
| G11 | Renombrado reservas → tickets (D1) | Migración en `schema.sql` + API + frontend |
| G12 | Verificación de pago (foto de cédula) ya está en DTO pero falta en UI y en revisión del admin | Completar flujo |
| G13 | Rutas del mapa (OSRM) y compartir a Google Maps pendientes | Implementar (pendiente en ESTADO.md) |
| G14 | Endpoint de scraping existe pero sin integrar al flujo de creación | Conectar con el modal de creación |
| G15 | `estado_reserva_enum` en `enums.ts` no incluye `reportada` (sí está en schema.sql) | Sincronizar enums |
| G16 | API social incompleta para los listados sociales (6.10): `GET social/seguidores/:id` no filtra por nombre ni pagina, no existe `GET social/siguiendo/:id`, y el acceso al listado debe requerir sesión (ambos endpoints públicos hoy) | Añadir filtro `q` (nombre/apellido) + paginación, crear endpoint de `siguiendo`, y proteger con `JwtAuthGuard` |
| G17 | Frontend: no existe el modal de seguidores/siguiendo con buscador (6.10); los contadores del header no son clicables | Implementar modal estilo Instagram (search por nombre, paginación, toggle Seguir/Siguiendo) y enlazarlo desde 6.6/6.7/6.8/7.2 |
| G18 | Eventos online no diferenciados en la implementación: `schema.sql` obligaba `ubicacion_id NOT NULL`, faltaba `link_online`, y Mapa/Explorar/Detalle no manejan el badge ni el filtro de modalidad | (a) `schema.sql`: `ubicacion_id` nullable + `link_online TEXT NULL` + `CHECK (online = TRUE OR ubicacion_id IS NOT NULL)`; (b) API: DTO `ubicacionId` opcional, campo `linkOnline`, validación condicional en el service (presencial exige ubicación); (c) UI: badge "En línea" + filtro Modalidad en Explorar, excluir online sin ubicación del Mapa, botón "Evento en línea" en el detalle |

---

## 18. Preguntas abiertas para confirmar

**Confirmado ✅ (2026-09-05) — separación de dominios por entidad (3.1/3.2):** path `/host/[slug]`, route group `host/[slug]` en `frontend/` (G2), subdominio `admin.` para el panel, y cambio de dominio 100% por URL sin `modo_activo` (D5/G1).

**Confirmado ✅ (2026-09-05) — listados sociales y métricas (6.10):** (a) el perfil del organizador (`/host/[slug]`) muestra **followers, saved y score** — el "following" vive solo en el perfil de usuario normal (`/perfil`) de 6.6; (b) contadores de followers/following **clicables** → modal estilo Instagram con buscador por nombre; (c) abrir el modal **requiere sesión**; (d) un usuario normal puede seguir **desde el host**, pero un organizador en modo organizador **no** puede seguir a otros (solo desde su perfil de usuario normal); (e) gaps técnicos registrados en G16 (API) y G17 (frontend), sin cambios de schema.

**Confirmado ✅ (2026-09-05) — flujo "Crear evento" (5.2):** la **ventana de selección A/B** (A) Publicar desde URL (Instagram/Facebook/TikTok/otro, scraping de metadatos, ver 9.6) / (B) Crear con formulario (9.5) la ven **organizadores** (nav del host y navbar usuario) y el **admin** (botón "Crear evento rápido"). Un usuario con `rol = 'usuario'` **no ve** esa ventana: al hacer clic en "Crear evento" su cuenta pasa a `organizador` y se abre `/host/<slug>` en una nueva pestaña. Gap G3 cubre el modal reutilizable en los 3 puntos de entrada.

**Confirmado ✅ (2026-09-05) — eventos online (9.5/9.6/6.x, G18):** toggle "Evento online" que desactiva la **obligatoriedad** de la ubicación (si se completa, el online también aparece en el Mapa y filtros regionales) + campo opcional **Link del evento en línea** (precargado con la URL en el flujo por link). `schema.sql`: `ubicacion_id` nullable + `link_online TEXT` + `CHECK (online = TRUE OR ubicacion_id IS NOT NULL)`. UI: badge "En línea", filtro Modalidad en Explorar, online sin ubicación fuera del Mapa, botón "Evento en línea" en el detalle.

1. **¿Confirmas el renombrado `reservas` → `tickets` (D1)?** El documento ya usa "ticket" como terminología principal.
2. **¿Para eventos gratuitos el paso de WhatsApp es obligatorio o basta una notificación in-app?** (Sugerencia S1.)
3. **¿Quién puede marcar un ticket como `verificada`?** (Se propone: solo admin, excepcional y con motivo. El organizador solo reporta no-pago.)
4. **¿Agregamos el campo `banco` a la información de pago?** (D4.)
5. **¿La puntuación de reseñas es 1–5?** (D2; la DB ya lo restringe.)
6. **¿El apartado "Registro" del admin es la bitácora de auditoría (`bitacora_auditoria`)?** (Se asume que sí.)
7. **¿Alcance de "Reportes" y "Configuración" del admin?** (Propuestas en 8.10 y 8.11.)
8. **¿Un miembro aceptado con rol `usuario` pasa a `organizador`?** (Se asume que sí, según `ReemplanteoProyecto.txt`.)
9. **¿El teléfono del usuario se usa ya para envíos (SMS/WhatsApp) o solo queda registrado para el admin?** (R13: se asume registrado + uso futuro.)