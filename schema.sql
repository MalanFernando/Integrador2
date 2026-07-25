-- =============================================================================
-- HASTA LA VUELTA - FARRAPP
-- Migración SQL para PostgreSQL 15+ / PostGIS
-- =============================================================================

-- 1. ACTIVACIÓN DE EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. ELIMINACIÓN DE TRIGGERS Y FUNCIONES
DROP TRIGGER IF EXISTS trg_check_max_establecimientos ON establecimientos CASCADE;
DROP TRIGGER IF EXISTS trg_update_usuarios_updated_at ON usuarios CASCADE;
DROP TRIGGER IF EXISTS trg_update_organizaciones_updated_at ON organizaciones CASCADE;
DROP TRIGGER IF EXISTS trg_update_miembros_updated_at ON miembros_organizacion CASCADE;
DROP TRIGGER IF EXISTS trg_update_establecimientos_updated_at ON establecimientos CASCADE;
DROP TRIGGER IF EXISTS trg_update_eventos_updated_at ON eventos CASCADE;
DROP TRIGGER IF EXISTS trg_update_reservas_updated_at ON reservas CASCADE;
DROP TRIGGER IF EXISTS trg_update_resenas_updated_at ON resenas CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_max_establecimientos() CASCADE;

-- 3. ELIMINACIÓN DE TABLAS EN ORDEN (Si se requiere reiniciar)
DROP TABLE IF EXISTS bitacora_auditoria CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS seguidores CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS resenas CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS localidades CASCADE;
DROP TABLE IF EXISTS evento_artistas CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS establecimientos CASCADE;
DROP TABLE IF EXISTS miembros_organizacion CASCADE;
DROP TABLE IF EXISTS organizaciones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS ubicaciones CASCADE;
DROP TABLE IF EXISTS ciudades CASCADE;
DROP TABLE IF EXISTS provincias CASCADE;

-- 4. ELIMINACIÓN Y CREACIÓN DE TIPOS ENUMERADOS
DROP TYPE IF EXISTS rol_usuario_enum CASCADE;
CREATE TYPE rol_usuario_enum AS ENUM ('admin', 'organizador', 'artista', 'usuario');

DROP TYPE IF EXISTS estado_usuario_enum CASCADE;
CREATE TYPE estado_usuario_enum AS ENUM ('activo', 'suspendido', 'pendiente');

DROP TYPE IF EXISTS rol_organizacion_enum CASCADE;
CREATE TYPE rol_organizacion_enum AS ENUM ('propietario', 'editor', 'visor');

DROP TYPE IF EXISTS estado_organizacion_enum CASCADE;
CREATE TYPE estado_organizacion_enum AS ENUM ('activo', 'suspendido');

DROP TYPE IF EXISTS estado_miembro_enum CASCADE;
CREATE TYPE estado_miembro_enum AS ENUM ('activo', 'inactivo');

DROP TYPE IF EXISTS estado_establecimiento_enum CASCADE;
CREATE TYPE estado_establecimiento_enum AS ENUM ('pendiente', 'aprobado', 'rechazado', 'suspendido');

DROP TYPE IF EXISTS tipo_categoria_enum CASCADE;
CREATE TYPE tipo_categoria_enum AS ENUM ('evento', 'establecimiento');

DROP TYPE IF EXISTS estado_evento_enum CASCADE;
CREATE TYPE estado_evento_enum AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado', 'cancelado', 'finalizado');

DROP TYPE IF EXISTS estado_localidad_enum CASCADE;
CREATE TYPE estado_localidad_enum AS ENUM ('disponible', 'agotado');

DROP TYPE IF EXISTS estado_reserva_enum CASCADE;
CREATE TYPE estado_reserva_enum AS ENUM ('confirmada', 'verificada', 'cancelada');

DROP TYPE IF EXISTS estado_resena_enum CASCADE;
CREATE TYPE estado_resena_enum AS ENUM ('visible', 'reportada', 'oculta');

DROP TYPE IF EXISTS tipo_seguido_enum CASCADE;
CREATE TYPE tipo_seguido_enum AS ENUM ('usuario', 'organizacion');


-- =============================================================================
-- 5. TABLAS DE GEOGRAFÍA Y POSTGIS (Escalabilidad Multiciudad)
-- =============================================================================

CREATE TABLE provincias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_iso VARCHAR(10)
);

CREATE TABLE ciudades (
    id SERIAL PRIMARY KEY,
    provincia_id INT NOT NULL REFERENCES provincias(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    latitud_centro DECIMAL(10,8),
    longitud_centro DECIMAL(11,8),
    CONSTRAINT uk_provincia_ciudad UNIQUE (provincia_id, nombre)
);

CREATE TABLE ubicaciones (
    id BIGSERIAL PRIMARY KEY,
    ciudad_id INT NOT NULL REFERENCES ciudades(id) ON DELETE RESTRICT,
    direccion_linea1 VARCHAR(255) NOT NULL,
    referencia TEXT,
    codigo_postal VARCHAR(20),
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    geom GEOGRAPHY(Point, 4326) NOT NULL
);

CREATE INDEX idx_ubicaciones_geom ON ubicaciones USING GIST(geom);


-- =============================================================================
-- 6. TABLAS DE USUARIOS, ORGANIZACIONES Y PERMISOS
-- =============================================================================

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    foto_perfil_url TEXT,
    biografia TEXT,
    redes_sociales JSONB DEFAULT '{}'::jsonb,
    rol rol_usuario_enum NOT NULL DEFAULT 'usuario',
    estado estado_usuario_enum NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by BIGINT NULL REFERENCES usuarios(id)
);

CREATE TABLE organizaciones (
    id BIGSERIAL PRIMARY KEY,
    propietario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT,
    logo_url TEXT,
    email_contacto VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    sitio_web VARCHAR(255),
    redes_sociales JSONB DEFAULT '{}'::jsonb,
    calificacion_promedio DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    estado estado_organizacion_enum NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE miembros_organizacion (
    id BIGSERIAL PRIMARY KEY,
    organizacion_id BIGINT NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_organizacion rol_organizacion_enum NOT NULL DEFAULT 'editor',
    estado estado_miembro_enum NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_org_usuario UNIQUE (organizacion_id, usuario_id)
);


-- =============================================================================
-- 7. ESTABLECIMIENTOS, CATEGORÍAS Y EVENTOS
-- =============================================================================

CREATE TABLE establecimientos (
    id BIGSERIAL PRIMARY KEY,
    organizacion_id BIGINT NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    ubicacion_id BIGINT NOT NULL REFERENCES ubicaciones(id) ON DELETE RESTRICT,
    nombre_comercial VARCHAR(150) NOT NULL,
    descripcion TEXT,
    capacidad_maxima INT NOT NULL DEFAULT 50,
    tipo_establecimiento VARCHAR(100),
    servicios JSONB DEFAULT '[]'::jsonb,
    estado estado_establecimiento_enum NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono_url TEXT,
    color_hex VARCHAR(10) DEFAULT '#000000',
    tipo tipo_categoria_enum NOT NULL DEFAULT 'evento'
);

CREATE TABLE eventos (
    id BIGSERIAL PRIMARY KEY,
    organizacion_id BIGINT NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    establecimiento_id BIGINT NULL REFERENCES establecimientos(id) ON DELETE SET NULL,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    ubicacion_id BIGINT NOT NULL REFERENCES ubicaciones(id) ON DELETE RESTRICT,
    creado_por BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    capacidad_total INT NOT NULL DEFAULT 100,
    imagen_principal_url TEXT NOT NULL,
    galeria_imagenes JSONB DEFAULT '[]'::jsonb,
    restriccion_acceso VARCHAR(100) DEFAULT 'Todo público',
    etiquetas JSONB DEFAULT '[]'::jsonb,
    presentado_por VARCHAR(255),
    preguntas_frecuentes JSONB DEFAULT '[]'::jsonb,
    aviso_asistentes TEXT,
    estado estado_evento_enum NOT NULL DEFAULT 'borrador',
    revisado_por BIGINT NULL REFERENCES usuarios(id),
    motivo_rechazo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE evento_artistas (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    artista_id BIGINT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_artista VARCHAR(150) NOT NULL,
    rol_en_evento VARCHAR(100) DEFAULT 'Artista principal',
    orden INT DEFAULT 1
);

CREATE TABLE localidades (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    capacidad_total INT NOT NULL DEFAULT 50,
    tickets_reservados INT NOT NULL DEFAULT 0,
    estado estado_localidad_enum NOT NULL DEFAULT 'disponible',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);


-- =============================================================================
-- 8. RESERVAS (TICKETS), RESEÑAS Y SOCIAL
-- =============================================================================

CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    localidad_id BIGINT NOT NULL REFERENCES localidades(id) ON DELETE RESTRICT,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cantidad_tickets INT NOT NULL DEFAULT 1,
    codigo_ticket VARCHAR(20) NOT NULL UNIQUE,
    qr_payload TEXT NOT NULL,
    estado estado_reserva_enum NOT NULL DEFAULT 'confirmada',
    fecha_reserva TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_verificacion TIMESTAMPTZ NULL,
    verificado_por BIGINT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resenas (
    id BIGSERIAL PRIMARY KEY,
    autor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    organizacion_id BIGINT NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    evento_id BIGINT NULL REFERENCES eventos(id) ON DELETE SET NULL,
    establecimiento_id BIGINT NULL REFERENCES establecimientos(id) ON DELETE SET NULL,
    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    estado estado_resena_enum NOT NULL DEFAULT 'visible',
    motivo_reporte TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favoritos (
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, evento_id)
);

CREATE TABLE seguidores (
    seguidor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    seguido_usuario_id BIGINT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    seguido_organizacion_id BIGINT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    tipo_seguido tipo_seguido_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_seguido_exclusivo CHECK (
        (seguido_usuario_id IS NOT NULL AND seguido_organizacion_id IS NULL AND tipo_seguido = 'usuario') OR
        (seguido_usuario_id IS NULL AND seguido_organizacion_id IS NOT NULL AND tipo_seguido = 'organizacion')
    )
);

CREATE UNIQUE INDEX uk_seguidor_usuario ON seguidores(seguidor_id, seguido_usuario_id) WHERE seguido_usuario_id IS NOT NULL;
CREATE UNIQUE INDEX uk_seguidor_org ON seguidores(seguidor_id, seguido_organizacion_id) WHERE seguido_organizacion_id IS NOT NULL;

CREATE TABLE notificaciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    datos_json JSONB DEFAULT '{}'::jsonb,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bitacora_auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id TEXT NULL,
    detalles_antes_despues JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- 9. TRIGGERS
-- =============================================================================

-- 9a. Trigger genérico para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_organizaciones_updated_at
    BEFORE UPDATE ON organizaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_miembros_updated_at
    BEFORE UPDATE ON miembros_organizacion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_establecimientos_updated_at
    BEFORE UPDATE ON establecimientos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_eventos_updated_at
    BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_localidades_updated_at
    BEFORE UPDATE ON localidades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_reservas_updated_at
    BEFORE UPDATE ON reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_resenas_updated_at
    BEFORE UPDATE ON resenas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9b. Trigger para máximo 3 establecimientos activos por organización
CREATE OR REPLACE FUNCTION check_max_establecimientos()
RETURNS TRIGGER AS $$
DECLARE
    v_count INT;
BEGIN
    IF NEW.estado = 'aprobado' THEN
        SELECT COUNT(*) INTO v_count
        FROM establecimientos
        WHERE organizacion_id = NEW.organizacion_id
          AND estado = 'aprobado'
          AND deleted_at IS NULL
          AND id != NEW.id;

        IF v_count >= 3 THEN
            RAISE EXCEPTION 'Una organización no puede tener más de 3 establecimientos activos (actualmente tiene %)', v_count;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_max_establecimientos
    BEFORE INSERT OR UPDATE ON establecimientos
    FOR EACH ROW EXECUTE FUNCTION check_max_establecimientos();


-- =============================================================================
-- 10. ÍNDICES DE RENDIMIENTO
-- =============================================================================

-- Usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_deleted ON usuarios(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Organizaciones
CREATE INDEX idx_organizaciones_slug ON organizaciones(slug);
CREATE INDEX idx_organizaciones_propietario ON organizaciones(propietario_id);
CREATE INDEX idx_organizaciones_deleted ON organizaciones(deleted_at) WHERE deleted_at IS NULL;

-- Miembros
CREATE INDEX idx_miembros_org ON miembros_organizacion(organizacion_id);
CREATE INDEX idx_miembros_usuario ON miembros_organizacion(usuario_id);

-- Establecimientos
CREATE INDEX idx_establecimientos_org ON establecimientos(organizacion_id);
CREATE INDEX idx_establecimientos_ubicacion ON establecimientos(ubicacion_id);
CREATE INDEX idx_establecimientos_deleted ON establecimientos(deleted_at) WHERE deleted_at IS NULL;

-- Eventos
CREATE INDEX idx_eventos_org ON eventos(organizacion_id);
CREATE INDEX idx_eventos_categoria ON eventos(categoria_id);
CREATE INDEX idx_eventos_ubicacion ON eventos(ubicacion_id);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_inicio, fecha_fin);
CREATE INDEX idx_eventos_estado ON eventos(estado);
CREATE INDEX idx_eventos_deleted ON eventos(deleted_at) WHERE deleted_at IS NULL;

-- Localidades
CREATE INDEX idx_localidades_evento ON localidades(evento_id);

-- Reservas
CREATE INDEX idx_reservas_codigo ON reservas(codigo_ticket);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_evento ON reservas(evento_id);

-- Reseñas
CREATE INDEX idx_resenas_org ON resenas(organizacion_id);
CREATE INDEX idx_resenas_autor ON resenas(autor_id);

-- Favoritos
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);

-- Seguidores
CREATE INDEX idx_seguidores_usuario ON seguidores(seguidor_id);
CREATE INDEX idx_seguidores_tipo ON seguidores(tipo_seguido);

-- Notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

-- Auditoría
CREATE INDEX idx_bitacora_usuario ON bitacora_auditoria(usuario_id);
CREATE INDEX idx_bitacora_tabla ON bitacora_auditoria(tabla_afectada);
CREATE INDEX idx_bitacora_fecha ON bitacora_auditoria(created_at);


-- =============================================================================
-- 11. DATOS SEMILLA INICIALES (SEED DATA FOR QUITO)
-- =============================================================================

INSERT INTO provincias (nombre, codigo_iso) VALUES ('Pichincha', 'EC-P');

INSERT INTO ciudades (provincia_id, nombre, latitud_centro, longitud_centro)
VALUES (1, 'Quito', -0.180653, -78.467838);

INSERT INTO categorias (nombre, descripcion, icono_url, color_hex, tipo) VALUES
('Música en Vivo', 'Conciertos, bandas independientes y acústicos', 'music', '#E63946', 'evento'),
('Bar & Discoteca', 'Bares, pub crawls y fiesta nocturna', 'beer', '#F4A261', 'establecimiento'),
('Arte & Cultura', 'Exposiciones, teatro y cultura urbana', 'palette', '#2A9D8F', 'evento'),
('Gastronomía & Cafés', 'Cafeterías culturales y ferias gastronómicas', 'coffee', '#E76F51', 'establecimiento');
