# 🚀 PLANIFICACIÓN Y ARQUITECTURA DEL PROYECTO: "HASTA LA VUELTA - FARRAPP"

---

## 📋 1. RESUMEN EJECUTIVO Y ESTRATEGIA DE PROYECTO

### 1.1 Visión General

**"Hasta la vuelta"** es una plataforma web integral basada en geolocalización que centraliza la oferta de actividades sociales, culturales, bares, cafeterías temáticas y eventos independientes.

### 1.2 Retos y Definiciones Clave

- **Plazo de Entrega:** Menos de 2 meses (8 semanas).
- **Entregable Inmediato (Semana 1):** Avance funcional con Autenticación (Login/Registro), estructura base del sistema y primeras vistas del Frontend.
- **Modalidad de Trabajo:** Desarrollo individual / ágil con entregas incrementales semanalmente.
- **Requisito Obligatorio Tecnológico:** Incorporación de **ASP.NET Framework 4.8.1 (C#)** en al menos un módulo sustancial (Módulo de Reportes, Analítica y Exportaciones).
- **Escalabilidad Multiciudad:** Diseño enfocado inicialmente en la ciudad de **Quito**, pero preparado a nivel de base de datos y arquitectura para extenderse a cualquier ciudad de Ecuador (Guayaquil, Cuenca, Manta, etc.) sin reescritura de código.

---

## 🏗️ 2. ARQUITECTURA DE SOFTWARE ESTRATÉGICA

Para maximizar la velocidad de desarrollo solo en < 2 meses sin sacrificar calidad ni violar los requisitos del proyecto, se propone una **Arquitectura de Microservicios Desacoplados / API-First Modular**.

```
                           +-------------------------------------+
                           |         FRONTEND CLIENTE            |
                           |   Next.js 14+ (React + TypeScript)  |
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
   +      NestJS (Node.js / TS)         +            +    ASP.NET Framework 4.8.1 (C#)    +
   +  Auth, Eventos, Org, Geoloc, Social+            +   PDFs, QRs, Excel, Exportaciones   +
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

1. **Frontend (Next.js 14 / React + Leaflet + OpenStreetMap):**
   - Permite desarrollo ultra rápido de interfaces dinámicas y atractivas.
   - Excelente soporte SSR (Server-Side Rendering) y SEO para la visibilidad de los eventos.
   - Integración nativa de **React-Leaflet** con tiles gratuitas de OpenStreetMap.

2. **Backend Core (NestJS + TypeScript):**
   - Arquitectura modular nativa, mantenible y limpia.
   - Manejo eficiente de Swagger/OpenAPI automático.
   - Integración fluida con TypeORM/Prisma y soporte de extensiones para PostGIS.

3. **Módulo de Reportes & Documentos (ASP.NET Framework 4.8.1 - C# / Web API 2):**
   - **Cumplimiento de Requisito Obligatorio:** Se aísla como un servicio Web API independiente en C# (.NET 4.8.1).
   - **Responsabilidades Delimitadas:**
     - Generación de reportes ejecutivos en PDF (asistencia, reservas, calificaciones de organizadores).
     - Exportación masiva de datos en Excel (listados de tickets, bitácora de auditoría para administradores).
     - Generación y renderizado de Tickets digitales con códigos QR (librería `QRCoder` + `iTextSharp` / `ClosedXML` / `EPPlus`).

4. **Base de Datos (PostgreSQL 15 + PostGIS):**
   - **PostGIS:** Manejo avanzado de datos espaciales mediante `GEOGRAPHY(Point, 4326)`. Permite realizar consultas radiales ("Eventos a menos de 3km de mi posición actual") con índices espaciales GiST ultra rápidos.
   - Supera ampliamente a SQL Server en cálculo de coordenadas y soporte libre.

5. **Cloudinary:**
   - Hosting de imágenes (logos de organizaciones, fotos de establecimientos, banners de eventos, avatares).

---

## 🗄️ 3. MODELO ENTIDAD-RELACIÓN OPTIMIZADO (ERD)

Se ha unificado y depurado la información del sistema, eliminando redundancias y añadiendo soporte multiciudad y PostGIS.

### 3.1 Diagrama Lógico de Tablas

```
 [ provincias ] 1---N [ ciudades ] 1---N [ ubicaciones ]
                                               | 1
                                               |
                                               v
 [ usuarios ] 1---N [ miembros_organizacion ] N---1 [ organizaciones ] 1---3 [ establecimientos ]
      |                                                    |                       |
      | 1                                                1 |                       | 1
      +------------------+                                 v                       v
                         |                         [  eventos  ] N---------------N [ categorias ]
                         v                            1 | 1
              [ bitacora_auditoria ]                    | |
                                                      N | | N
                                         [ localidades ]  [ resenas ]
                                                |              ^
                                              1 |              |
                                                v              |
                                           [ reservas ] N------+
```

### 3.2 Estructura Detallada de Tablas

#### A. Geografía y Coordenadas (Escalabilidad Multiciudad)

1. **`provincias`**: `id` (PK), `nombre` (ej: Pichincha, Guayas, Azuay), `codigo_iso`.
2. **`ciudades`**: `id` (PK), `provincia_id` (FK), `nombre` (ej: Quito, Guayaquil, Cuenca), `latitud_centro`, `longitud_centro`.
3. **`ubicaciones`**:
   - `id` (PK), `ciudad_id` (FK), `direccion_linea1`, `referencia`, `codigo_postal`
   - `latitud` (DECIMAL 10,8), `longitud` (DECIMAL 11,8)
   - **`geom`**: `GEOGRAPHY(Point, 4326)` (Campo espacial PostGIS indexado con GiST)

#### B. Usuarios, Roles y Seguridad

4. **`usuarios`**:
   - `id` (PK UUID/BIGINT), `email` (UNIQUE), `password_hash`, `nombre_completo`, `telefono`, `foto_perfil_url`, `biografia`
   - `rol`: ENUM (`admin`, `organizador`, `artista`, `usuario`)
   - `estado`: ENUM (`activo`, `suspendido`, `pendiente`)
   - `created_at`, `updated_at`, `deleted_at` (Soft Delete), `deleted_by`

5. **`organizaciones`**:
   - `id` (PK), `propietario_id` (FK usuarios), `nombre`, `slug` (UNIQUE), `descripcion`, `logo_url`, `email_contacto`, `telefono`, `sitio_web`, `redes_sociales` (JSONB)
   - `calificacion_promedio` (DECIMAL 3,2), `estado` (ENUM: `activo`, `suspendido`)
   - `created_at`, `updated_at`, `deleted_at`

6. **`miembros_organizacion`**:
   - `id` (PK), `organizacion_id` (FK), `usuario_id` (FK), `rol_organizacion` (ENUM: `propietario`, `editor`, `visor`), `estado` (ENUM: `activo`, `inactivo`)

#### C. Establecimientos y Eventos

7. **`establecimientos`**:
   - `id` (PK), `organizacion_id` (FK), `ubicacion_id` (FK ubicaciones), `nombre_comercial`, `descripcion`, `capacidad_maxima`, `tipo_establecimiento`, `servicios` (JSONB)
   - `estado` (ENUM: `pendiente`, `aprobado`, `rechazado`, `suspendido`)
   - `created_at`, `updated_at`, `deleted_at`
   - **Regla de Negocio:** Máximo 3 establecimientos activos por organización.

8. **`categorias`**:
   - `id` (PK), `nombre` (ej: Música en Vivo, Bar/Discoteca, Arte & Cultura, Gastronomía), `descripcion`, `icono_url`, `color_hex`, `tipo` (ENUM: `evento`, `establecimiento`)

9. **`eventos`**:
   - `id` (PK), `organizacion_id` (FK), `establecimiento_id` (FK, NULL si es en espacio público), `categoria_id` (FK), `ubicacion_id` (FK ubicaciones), `creado_por` (FK usuarios)
   - `titulo`, `descripcion`, `fecha_inicio` (TIMESTAMPTZ), `fecha_fin` (TIMESTAMPTZ), `capacidad_total`, `imagen_principal_url`, `galeria_imagenes` (JSONB)
   - `estado`: ENUM (`borrador`, `pendiente`, `aprobado`, `rechazado`, `cancelado`, `finalizado`)
   - `revisado_por` (FK usuarios), `motivo_rechazo` (TEXT)
   - `created_at`, `updated_at`, `deleted_at`

10. **`localidades`**:
    - `id` (PK), `evento_id` (FK), `nombre` (VIP, General, Presencial), `descripcion`, `precio` (DECIMAL 10,2 - 0 para gratuitos), `capacidad_total`, `tickets_reservados` (INT), `estado` (ENUM: `disponible`, `agotado`)

#### D. Transacciones, Reservas y Notificaciones

11. **`reservas`**:
    - `id` (PK UUID), `evento_id` (FK), `localidad_id` (FK), `usuario_id` (FK), `cantidad_tickets` (INT)
    - `codigo_ticket` (VARCHAR 20, UNIQUE), `qr_payload` (TEXT)
    - `estado`: ENUM (`confirmada`, `verificada`, `cancelada`)
    - `fecha_reserva`, `fecha_verificacion`, `verificado_por` (FK usuarios), `created_at`, `updated_at`

12. **`resenas`**:
    - `id` (PK), `autor_id` (FK usuarios), `organizacion_id` (FK), `evento_id` (FK, NULLable), `establecimiento_id` (FK, NULLable)
    - `puntuacion` (INT 1-5), `comentario` (TEXT), `estado` (ENUM: `visible`, `reportada`, `oculta`), `motivo_reporte` (TEXT)
    - `created_at`, `updated_at`

13. **`favoritos`**:
    - `usuario_id` (FK), `evento_id` (FK), `created_at` (PK compuesta usuario_id + evento_id)

14. **`seguidores`**:
    - `seguidor_id` (FK usuarios), `seguido_id` (FK usuarios/organizacion), `created_at` (PK compuesta)

15. **`notificaciones`**:
    - `id` (PK), `usuario_id` (FK), `tipo` (VARCHAR 50), `titulo`, `mensaje`, `datos_json` (JSONB), `leida` (BOOLEAN), `created_at`

16. **`bitacora_auditoria`**:
    - `id` (PK), `usuario_id` (FK), `accion` (VARCHAR 100), `tabla_afectada`, `registro_id`, `detalles_antes_despues` (JSONB), `ip_address`, `created_at`

### 3.3 Evaluación Técnica del Modelo ER

1. **Estructura:** Organizada bajo el principio de **Bounded Contexts (Límites de Dominio)**, aislando la capa geográfica (`provincias`/`ciudades`/`ubicaciones`), la capa de identidad (`usuarios`/`organizaciones`), el núcleo del negocio (`establecimientos`/`eventos`/`localidades`) y la capa transaccional/social (`reservas`/`resenas`).
2. **Normalización:** Cumple estrictamente con **Tercera Forma Normal (3FN)** con desnormalizaciones justificadas para alto rendimiento (`calificacion_promedio` en `organizaciones` y `tickets_reservados` en `localidades`).
3. **Relaciones:** Todas las relaciones respetan las reglas de negocio (ej: `organizaciones` a `establecimientos` 1:0..3, `eventos` a `localidades` 1:N, `reservas` con llaves foráneas y códigos únicos QR).

