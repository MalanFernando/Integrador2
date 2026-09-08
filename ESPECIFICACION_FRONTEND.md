# ESPECIFICACIÓN FRONTEND — Hasta la Vuelta

> Documento fuente para desarrollo del frontend. Unifica funcionalidad UI y sistema de diseño.
> Fuente funcional: `ESPECIFICACION_FUNCIONAL.md`. Referencias visuales: `UI-especificaciones/*.md`.
> **Las capturas PNG son la fuente visual de verdad**: ante conflicto con texto, manda la apariencia de las capturas.
> Última actualización: 2026-09-06 · Consolidado.

---

## 1. Fuentes y principios

| Fuente | Rol |
|---|---|
| `ESPECIFICACION_FUNCIONAL.md` | Fuente de verdad funcional (reglas, API, BD) |
| `ESPECIFICACION_FRONTEND.md` | Este documento: sistema de diseño + pantallas |
| `UI-especificaciones/README_UI_Hasta_la_Vuelta.md` | Spec visual público (Home, Explore, Map, Event Detail, Auth) |
| `UI-especificaciones/README_Figma_Hasta_la_Vuelta.md` | Design System: tokens, componentes, medidas, responsive |
| `UI-especificaciones/perfil_usuario_visitante.md` | Perfil visitado (usuario y organizador) |
| `UI-especificaciones/perfil_organizador.md` | Área del organizador |
| `UI-especificaciones/panel_admin_hasta_la_vuelta.md` | Panel administrativo |

**Prohibido:** instalar Tailwind solo para reproducir este diseño · convertir clases Figma en dependencias · reemplazar Clash Grotesk / Inter · inventar colores nuevos · rediseñar componentes.

---

## 2. Separación de dominios por tipo de usuario

| Entidad | Dominio | Navegación |
|---|---|---|
| **Usuario** | `/` | Home, Mapa, Explorar, detalle, perfiles públicos |
| **Organizador** | `/host/[slug]` (otra pestaña) | Gestión: Eventos, Reseñas, Miembros, Tickets, Configuración |
| **Admin** | `frontend/admin/` (puerto 3002) | Panel completo |

**Regla:** organizar = usuario con `rol = 'organizador'` + `perfilActivo = 'organizador'`. El cambio entre dominios es por URL (nueva pestaña).

---

## 3. Sistema de diseño

### 3.1 Identidad visual

Estética **negra, editorial, urbana, cinematográfica**: fondo negro dominante, tipografía Clash Grotesk (titulares) + Inter (UI), naranja como acento, fotografías protagonistas, mucho espacio negativo.

### 3.2 Colores

```css
:root {
  --black: #000000;
  --white: #F5F5F5;
  --gray-100: #D0D0D0;
  --gray-300: #A0A0A0;
  --gray-500: #666666;
  --gray-700: #2A2A2A;
  --gray-800: #191919;
  --gray-900: #101010;
  --orange: #F59E0B;
  --orange-bright: #FF9D00;
  --green-free-bg: #EAF9E3;
  --green-free-text: #3DC069;
  --surface: #101010;
  --surface-2: #181818;
  --surface-3: #242424;
  --text: #F5F5F5;
  --text-secondary: #B0B0B0;
  --text-muted: #777;
  --border: #333;
  --accent: #F59E0B;
}
```

### 3.3 Tipografía

- **Clash Grotesk** (Fontshare): branding y titulares. Hero: 132px semibold, line-height ≈ 0.84.
- **Inter**: UI, navegación, formularios. Escala: 12/14/16/20/24/32px.

### 3.4 Radius

- Sistema: **8px** (principal). También sm=6px, md=8px, lg=12px.
- Imágenes internas: 4px.
- No `9999px` excepto pills, avatars, clusters.

### 3.5 Espaciado

```
--space-1: 4px ... --space-2: 8px ... --space-3: 12px ... --space-4: 16px ...
--space-5: 24px ... --space-6: 32px ... --space-7: 48px ... --space-8: 64px ...
```

### 3.6 Imágenes de eventos

- `object-fit: cover`; no deformar.
- **SIN imágenes de relleno.** Si no hay imagen del evento, usar `<EventImagePlaceholder>` (iniciales + color de categoría).
- Placeholders: `/images/event1.jpg` → **ELIMINADO**. Usar componente reutilizable.

### 3.7 Iconografía

- Solo `lucide-react` (lineales, minimalistas, stroke fino/medio).
- Tamaños: 16/18/22/24/28/36/42px.
- **Sin emojis.**

---

## 4. Navegación por dominio

### 4.1 Navbar — dominio usuario (`/`)

| Elemento | Notas |
|---|---|
| Logotipo | Link a `/inicio` |
| Explorar | Link a `/explorar` |
| Mapa | Link a `/mapa` |
| Crear evento | Solo visible para `perfilActivo === 'organizador'`; para usuarios normales → habilita organizador + abre pestaña nueva |
| Iniciar sesión | Solo invitados → `/login` |
| Avatar + nombre | Logueados. Dropdown: Ver perfil · Modo organizador (si `rol === 'organizador'`) · Cerrar sesión |

### 4.2 Navbar — dominio host (`/host/[slug]`)

| Elemento | Notas |
|---|---|
| Logotipo | Solo visual (sin link) |
| Eventos / Reseñas / Miembros / Tickets / Configuración | Links del host |
| Crear evento | Solo dueño |
| Avatar + nombre | Dropdown: Cambiar a modo usuario (abre `/` en otra pestaña) · Cerrar sesión |

### 4.3 Admin sidebar

```
GENERAL:  Dashboard · Reportes
GESTIÓN:  Usuarios · Organizadores · Eventos · Reseñas · Tickets · Categorías
SISTEMA:  Registro · Configuración · Cerrar sesión
```

---

## 5. Home (`/inicio`)

**Hero:** solo con el wordmark "HASTA LA VUELTA" (sin imágenes decorativas). Tipografía grande, Clash Grotesk, fondo negro, CTA "Comenzar" → `/explorar`.

Slider de categorías → `/explorar?categoriaId=X`.
Cards de eventos destacados.
Slider de organizadores.

---

## 6. Explorar (`/explorar`)

- Banner destacado: imagen de fondo desenfocada + overlay + info del evento (nítido).
- Título: "Eventos Populares en Quito".
- Filtros: búsqueda por texto · Distancia · Precio · Fecha · Sort.
- Pills de categorías.
- Grid de EventCards (4 columnas desktop, 1-2 mobile).
- **Filtro precio:** checkbox "Gratis" + range slider [mín-máx].
- **Filtro distancia:** geolocation + range slider 1-50km.
- **Filtro fecha:** Hoy / Esta semana / Fecha específica.
- **Sort:** A-Z / Z-A.

---

## 7. Mapa (`/mapa`)

- Leaflet con tiles en grayscale.
- Clusters negros circulares, labels negros.
- Sidebar con resultados (izquierda).
- Filtros iguales a Explorar.
- Card flotante al clickear marcador: imagen, título, ubicación, fecha, precio, botón "Ver rutas".

---

## 8. Detalle de evento (`/eventos/[id]`)

1. Slider de imágenes.
2. Título + etiqueta.
3. Ubicación + fecha/hora (badge "En línea" si es online).
4. Restricción de acceso.
5. Descripción.
6. Card del organizador → `/host/[slug]`.
7. Cartelera.
8. Preguntas frecuentes.
9. **Localidades**: nombre + aforo + precio + IVA informativo + badge "Agotado" si lleno.
10. Sticky bottom: "Entradas desde $X" + botón Comprar.
11. **Formulario de reseñas**: (visible si el usuario tiene reserva confirmada) estrella 1-5 + textarea + botón Publicar → `POST /resenas`.

---

## 9. Perfil de usuario (`/perfil`)

- Hero: cover + avatar + nombre + bio + counters (Followers / Following / Saved).
- Tabs: **Eventos guardados** · **Mis tickets** · **Eventos participante** · **Configuración**.
- Editar perfil: foto · portada · nombre · apellido · teléfono · etiqueta · bio · redes sociales.

---

## 10. Perfil de organizador — público (`/host/[slug]`)

- Hero: cover + avatar + nombre + ubicación + bio + counters (Followers / Saved / Score) + botón Seguir.
- Tabs: **Próximos eventos** · **Eventos pasados** · **Reseñas**.
- Score: mostrar valor real del backend (no hardcoded "—").

---

## 11. Perfil de otro usuario (`/perfil/[id]`)

- Hero: igual que propio pero sin "Editar perfil".
- Tabs: **Eventos guardados** · **Eventos participante**.
- Botón Seguir.

---

## 12. Panel admin (`frontend/admin/`)

- Layout: sidebar fija + header + contenido.
- Dashboard: KPIs + gráficas + actividades recientes.
- CRUD completo de Usuarios, Organizadores, Eventos, Reseñas, Tickets, Categorías.
- Bitácora de auditoría.
- Register: **eliminado** (admin creado solo via seed).

---

## 13. Categorías

Las categorías oficiales (alineadas a Buenplan):

`Actividad · Teatro · Deporte · Fiesta · Concierto · Familiar · Feria · Corporativo · Cultural · Autocine · En vivo · Nightlife · Película · Stand up · Taller`

---

## 14. Compra de tickets

**Evento pagado:** selección de localidad → checkout (nombre, cédula, correo, celular) → aceptación términos → información de pago del organizador (solo lectura) → botón Comprar → WhatsApp con datos prellenados → ticket generado (`confirmada`).

**Evento gratuito:** mismo flujo sin información de pago.

**QR:** generado con `qr_payload = tipo/codigo/eventoId/localidad`.

---

## 15. Estados de tickets (badges en español)

- `confirmada` → verde
- `verificada` → azul
- `cancelada` → rojo
- `invalidada` → rojo
- `reportada` → rojo borde

---

## 16. Reglas UI transversales

- No emojis (solo `lucide-react`).
- Listas del admin con `<ol>`/`<ul>`, no `<table>`.
- Cards de eventos: vertical en Explorar/guardados; **horizontal** en "Eventos participante".
- Menús de acciones con botón de 3 puntos (⋮).
- Nav activa marcada con `border-bottom: 2px solid #F5F5F5`.
- Catch de errores: `console.error` + toast visible, **no catch silencioso**.

---

## 17. Responsive breakpoints

- **Desktop:** 1280px (contenido 1152px).
- **Tablet:** 768–1199px.
- **Mobile:** `<768px` — header compacto, nav iconos, grids 1-2 col, sidebar mapa a panel inferior.

---

## 18. Fidelity checklist

- [x] Fondo negro en todas las páginas
- [x] Header consistente con nav activa
- [x] Botones del estilo especificado
- [x] Inputs de auth con línea inferior
- [x] Títulos pesados Clash Grotesk
- [x] Naranja solo acento
- [x] Cards oscuras
- [x] Sin imágenes de relleno (placeholders con iniciales)
- [x] Footer con wordmark gigante
- [x] Responsive desktop + mobile
- [x] Sin estilos Bootstrap/SaaS
