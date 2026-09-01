# PLANIFICACIÓN Y ARQUITECTURA DEL PROYECTO: "HASTA LA VUELTA"

---

## 1. RESUMEN EJECUTIVO Y ESTRATEGIA DE PROYECTO

### 1.1 Visión General

**"Hasta la Vuelta"** es una plataforma web integral basada en geolocalización que centraliza la oferta de actividades sociales, culturales, bares, cafeterías temáticas y eventos independientes.

### 1.2 Retos y Definiciones Clave

- **Plazo de Entrega:** Menos de 2 meses (8 semanas).
- **Entregable Inmediato (Semana 1):** Avance funcional con Autenticación (Login/Registro), estructura base del sistema y primeras vistas del Frontend.
- **Modalidad de Trabajo:** Desarrollo individual / ágil con entregas incrementales semanalmente.
- **Requisito Obligatorio Tecnológico:** Incorporación de **ASP.NET (C#)** en al menos un módulo sustancial (Módulo de Reportes, Analítica y Exportaciones).
- **Escalabilidad Multiciudad:** Diseño enfocado inicialmente en la ciudad de **Quito**, pero preparado a nivel de base de datos y arquitectura para extenderse a cualquier ciudad de Ecuador (Guayaquil, Cuenca, Manta, etc.) sin reescritura de código.

---

## 2. ARQUITECTURA DE SOFTWARE ESTRATÉGICA

Arquitectura de **Microservicios Desacoplados / API-First Modular**.

```
                           +-------------------------------------+
                           |         FRONTEND CLIENTE            |
                           |   Next.js 16+ (React + TypeScript)  |
                           |   Tailwind CSS / Leaflet + OSM      |
                           +------------------+------------------+
                                              |
                                     (HTTP / JSON REST API)
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v                                                 v
   +------------------------------------+            +------------------------------------+
   +    BACKEND CORE (API PRINCIPAL)    +            +    MÓDULO DE REPORTES Y ANALÍTICA  +
   +      NestJS (Node.js / TS)         +            +         ASP.NET (C#)              +
   +  Auth, Eventos, Geoloc, Social     +            +   PDFs, QRs, Excel, Exportaciones   +
   +-----------------+------------------+            +-----------------+------------------+
                     |                                                 |
                     |             (PostgreSQL / PostGIS)              |
                     +------------------------+------------------------+
                                              |
                                              v
                           +-------------------------------------+
                           |            BASE DE DATOS            |
                           |       PostgreSQL 15+ + PostGIS      |
                           +-------------------------------------+
                                              |
                                              v
                           +-------------------------------------+
                           |            MEDIA STORAGE            |
                           |            Cloudinary API           |
                           +-------------------------------------+
```

### 2.1 Justificación del Stack Tecnológico

1. **Frontend (Next.js 16 / React + Leaflet + OpenStreetMap):**
   - Permite desarrollo ultra rápido de interfaces dinámicas y atractivas.
   - Excelente soporte SSR (Server-Side Rendering) y SEO para la visibilidad de los eventos.
   - Integración nativa de **React-Leaflet** con tiles gratuitas de OpenStreetMap.

2. **Backend Core (NestJS + TypeScript):**
   - Arquitectura modular nativa, mantenible y limpia.
   - Manejo eficiente de Swagger/OpenAPI automático.
   - Integración fluida con TypeORM y soporte de extensiones para PostGIS.

3. **Módulo de Reportes & Documentos (ASP.NET - C#):**
   - **Cumplimiento de Requisito Obligatorio:** Se aísla como un servicio Web API independiente en C#.
   - **Responsabilidades Delimitadas:**
     - Generación de reportes ejecutivos en PDF (asistencia, reservas).
     - Exportación masiva de datos en Excel (listados de tickets, bitácora de auditoría).
     - Generación y renderizado de Tickets digitales con códigos QR (librería `QRCoder` + `QuestPDF` + `ClosedXML`).

4. **Base de Datos (PostgreSQL 15 + PostGIS):**
   - **PostGIS:** Manejo avanzado de datos espaciales mediante `GEOGRAPHY(Point, 4326)`. Permite realizar consultas radiales ("Eventos a menos de 3km de mi posición actual") con índices espaciales GiST ultra rápidos.

5. **Cloudinary:**
   - Hosting de imágenes (fotos de perfil, banners de eventos, avatares).

---

## 3. MODELO ENTIDAD-RELACIÓN OPTIMIZADO (ERD)

### 3.1 Diagrama Lógico de Tablas

```
 [ provincias ] 1---N [ ciudades ] 1---N [ ubicaciones ]
                                               | 1
                                               |
                                               v
 [ usuarios ] 1---N [ miembros_organizacion ]  |
      |                                        |
      | 1                                      |
      +------------------+                     v
                         |              [  eventos  ] N---1 [ categorias ]
                         v                 1 | 1
              [ bitacora_auditoria ]         | |
                                            N | | N
                                              v v
                                        [ reservas ]  [ resenas ]
                                              |              ^
                                            1 |              |
                                              v              |
                                         [ favoritos ] ------+
```

### 3.2 Estructura Detallada de Tablas

#### A. Geografía y Coordenadas (Escalabilidad Multiciudad)

1. **`provincias`**: `id` (PK), `nombre` (ej: Pichincha, Guayas, Azuay), `codigo_iso`.
2. **`ciudades`**: `id` (PK), `provincia_id` (FK), `nombre` (ej: Quito, Guayaquil, Cuenca), `latitud_centro`, `longitud_centro`.
3. **`ubicaciones`**:
   - `id` (PK), `ciudad_id` (FK), `direccion_linea1`, `referencia`, `codigo_postal`
   - `latitud` (DECIMAL 10,8), `longitud` (DECIMAL 11,8)
   - **`geom`**: `GEOGRAPHY(Point, 4326)` (Campo espacial PostGIS indexado con GiST)

#### B. Usuarios y Organización

4. **`usuarios`**:
   - `id` (PK BIGSERIAL), `email` (UNIQUE), `password_hash`, `nombre`, `apellido`, `telefono`, `foto_perfil_url`, `foto_portada`, `biografia`, `etiqueta` (ej: "artista", "comediante")
   - `redes_sociales` (JSONB), `ubicacion` (JSONB, opcional para organizadores)
   - `rol`: ENUM (`admin`, `organizador`, `artista`, `usuario`)
   - `estado`: ENUM (`activo`, `suspendido`, `pendiente`)
   - `created_at`, `updated_at`, `deleted_at` (Soft Delete), `deleted_by`
   - **Nota:** Los organizadores son usuarios con `rol = 'organizador'`. No existe tabla `organizaciones`.

5. **`miembros_organizacion`**:
   - `id` (PK), `organizador_id` (FK usuarios), `usuario_id` (FK, NULLable), `email_invitacion`, `nombre_invitado`
   - `rol_organizacion` (ENUM: `editor`, `visor`), `estado` (ENUM: `activo`, `inactivo`, `pendiente`)
   - **Regla de Negocio:** Máximo 2 miembros activos por organizador.

#### C. Eventos

6. **`categorias`**:
   - `id` (PK), `nombre` (ej: Música en Vivo, Bar/Discoteca, Arte & Cultura, Gastronomía), `descripcion`, `icono_url`, `color_hex`

7. **`eventos`**:
   - `id` (PK), `organizador_id` (FK usuarios), `categoria_id` (FK), `ubicacion_id` (FK ubicaciones), `creado_por` (FK usuarios)
   - `titulo`, `descripcion`, `fecha_inicio` (TIMESTAMPTZ), `fecha_fin` (TIMESTAMPTZ), `aforo` (INT)
   - `imagenes` (JSONB), `online` (BOOLEAN), `usuarios_cartelera` (JSONB, max 5 artistas)
   - `restriccion_acceso`, `etiquetas` (JSONB), `visibilidad` (ENUM: `publico`, `oculto`, `privado`)
   - `localidades` (JSONB, max 4 — cada una con: nombre, aforo, precio)
   - `informacion_pago` (JSONB — nombre destinatario, número contacto, cuenta bancaria, tipo cuenta, cédula, foto verificación)
   - `preguntas_frecuentes` (JSONB — título + respuesta)
   - `estado`: ENUM (`borrador`, `pendiente`, `aprobado`, `rechazado`, `cancelado`, `finalizado`)
   - `revisado_por` (FK usuarios), `motivo_rechazo` (TEXT)
   - `created_at`, `updated_at`, `deleted_at`
   - **Regla de Negocio:** Máximo 5 eventos activos por organizador.

#### D. Transacciones, Reservas y Social

8. **`reservas`**:
   - `id` (PK UUID), `evento_id` (FK), `usuario_id` (FK), `localidad_nombre` (VARCHAR 100), `cantidad_tickets` (INT)
   - `codigo_ticket` (VARCHAR 20, UNIQUE), `qr_payload` (TEXT)
   - `estado`: ENUM (`confirmada`, `verificada`, `cancelada`)
   - `fecha_reserva`, `fecha_verificacion`, `verificado_por` (FK usuarios), `created_at`, `updated_at`

9. **`resenas`**:
   - `id` (PK), `autor_id` (FK usuarios), `evento_id` (FK)
   - `puntuacion` (INT 1-5), `comentario` (TEXT), `estado` (ENUM: `visible`, `reportada`, `oculta`), `motivo_reporte` (TEXT)
   - `created_at`, `updated_at`

10. **`favoritos`**:
    - `usuario_id` (FK), `evento_id` (FK), `created_at` (PK compuesta usuario_id + evento_id)

11. **`seguidores`**:
    - `id` (PK), `seguidor_id` (FK usuarios), `seguido_id` (FK usuarios), `created_at`
    - **Nota:** Solo seguimiento entre usuarios (sin organizaciones).

12. **`notificaciones`**:
    - `id` (PK), `usuario_id` (FK), `tipo` (VARCHAR 50), `titulo`, `mensaje`, `datos_json` (JSONB), `leida` (BOOLEAN), `created_at`

13. **`bitacora_auditoria`**:
    - `id` (PK), `usuario_id` (FK), `accion` (VARCHAR 100), `tabla_afectada`, `registro_id`, `detalles_antes_despues` (JSONB), `ip_address`, `created_at`

### 3.3 Evaluación Técnica del Modelo ER

1. **Estructura:** Organizada bajo el principio de **Bounded Contexts (Límites de Dominio)**, aislando la capa geográfica (`provincias`/`ciudades`/`ubicaciones`), la capa de identidad (`usuarios`/`miembros_organizacion`), el núcleo del negocio (`eventos`/`categorias`) y la capa transaccional/social (`reservas`/`resenas`/`favoritos`/`seguidores`).
2. **Normalización:** Cumple estrictamente con **Tercera Forma Normal (3FN)** con desnormalizaciones justificadas para alto rendimiento (`localidades` y `usuarios_cartelera` como JSONB en `eventos`).
3. **Relaciones:** Todas las relaciones respetan las reglas de negocio (ej: `eventos` a `localidades` como JSONB con max 4, `reservas` con llaves foráneas y códigos únicos QR).
