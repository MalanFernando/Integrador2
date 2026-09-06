
-- 1. ACTIVACIÃ“N DE EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;


-- =============================================================================
-- 2. ELIMINACIÃ“N DE TRIGGERS Y FUNCIONES
-- =============================================================================

DROP TRIGGER IF EXISTS trg_check_max_eventos_organizador ON eventos CASCADE;
DROP TRIGGER IF EXISTS trg_check_max_miembros ON miembros_organizacion CASCADE;
DROP TRIGGER IF EXISTS trg_update_usuarios_updated_at ON usuarios CASCADE;
DROP TRIGGER IF EXISTS trg_update_miembros_updated_at ON miembros_organizacion CASCADE;
DROP TRIGGER IF EXISTS trg_update_eventos_updated_at ON eventos CASCADE;
DROP TRIGGER IF EXISTS trg_update_reservas_updated_at ON reservas CASCADE;
DROP TRIGGER IF EXISTS trg_update_resenas_updated_at ON resenas CASCADE;
DROP TRIGGER IF EXISTS trg_update_reportes_eventos_updated_at ON reportes_eventos CASCADE;
DROP TRIGGER IF EXISTS trg_update_reportes_reservas_updated_at ON reportes_reservas CASCADE;
DROP TRIGGER IF EXISTS trg_update_preferencias_usuario_updated_at ON preferencias_usuario CASCADE;
DROP TRIGGER IF EXISTS trg_update_event_visitas_updated_at ON event_visitas CASCADE;
DROP TRIGGER IF EXISTS trg_update_suscripciones_updated_at ON suscripciones CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_max_eventos_organizador() CASCADE;
DROP FUNCTION IF EXISTS check_max_miembros() CASCADE;


-- =============================================================================
-- 3. ELIMINACIÃ“N DE TABLAS EN ORDEN DE DEPENDENCIA (FK hijas primero)
-- =============================================================================

DROP TABLE IF EXISTS bitacora_auditoria CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS seguidores CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS reportes_reservas CASCADE;
DROP TABLE IF EXISTS reportes_eventos CASCADE;
DROP TABLE IF EXISTS event_visitas CASCADE;
DROP TABLE IF EXISTS resenas CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS miembros_organizacion CASCADE;
DROP TABLE IF EXISTS suscripciones CASCADE;
DROP TABLE IF EXISTS preferencias_usuario CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS planes CASCADE;
DROP TABLE IF EXISTS ubicaciones CASCADE;
DROP TABLE IF EXISTS ciudades CASCADE;
DROP TABLE IF EXISTS provincias CASCADE;


-- =============================================================================
-- 4. ELIMINACIÃ“N Y CREACIÃ“N DE TIPOS ENUMERADOS
-- =============================================================================

DROP TYPE IF EXISTS rol_usuario_enum CASCADE;
CREATE TYPE rol_usuario_enum AS ENUM ('admin', 'organizador', 'usuario');

DROP TYPE IF EXISTS estado_usuario_enum CASCADE;
CREATE TYPE estado_usuario_enum AS ENUM ('activo', 'suspendido', 'inactivo');

DROP TYPE IF EXISTS rol_organizacion_enum CASCADE;
CREATE TYPE rol_organizacion_enum AS ENUM ('editor', 'moderador');

DROP TYPE IF EXISTS estado_miembro_enum CASCADE;
CREATE TYPE estado_miembro_enum AS ENUM ('activo', 'inactivo', 'pendiente');

DROP TYPE IF EXISTS estado_evento_enum CASCADE;
CREATE TYPE estado_evento_enum AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado', 'cancelado', 'finalizado');

DROP TYPE IF EXISTS visibilidad_enum CASCADE;
CREATE TYPE visibilidad_enum AS ENUM ('publico', 'oculto', 'privado');

DROP TYPE IF EXISTS estado_reserva_enum CASCADE;
CREATE TYPE estado_reserva_enum AS ENUM ('confirmada', 'verificada', 'cancelada', 'invalidada', 'reportada');

DROP TYPE IF EXISTS estado_resena_enum CASCADE;
CREATE TYPE estado_resena_enum AS ENUM ('visible', 'reportada', 'oculta');

DROP TYPE IF EXISTS estado_reporte_evento_enum CASCADE;
CREATE TYPE estado_reporte_evento_enum AS ENUM ('pendiente', 'revisado', 'desestimado');

DROP TYPE IF EXISTS estado_reporte_reserva_enum CASCADE;
CREATE TYPE estado_reporte_reserva_enum AS ENUM ('pendiente', 'revisado', 'desestimado');

DROP TYPE IF EXISTS estado_suscripcion_enum CASCADE;
CREATE TYPE estado_suscripcion_enum AS ENUM ('activa', 'cancelada', 'expirada', 'suspendida');


-- =============================================================================
-- 5. TABLAS DE GEOGRAFÃA Y POSTGIS
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
-- 6. TABLA DE PLANES (monetizaciÃ³n â€” debe crearse antes que usuarios por FK)
-- =============================================================================

CREATE TABLE planes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    max_eventos INT NOT NULL DEFAULT 5,
    max_miembros INT NOT NULL DEFAULT 2,
    resenas_premium BOOLEAN DEFAULT FALSE,
    precio_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- 7. TABLA DE USUARIOS
-- =============================================================================

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150) NOT NULL DEFAULT '',
    telefono VARCHAR(20),
    foto_perfil_url TEXT,
    foto_portada TEXT,
    biografia TEXT,
    etiqueta VARCHAR(150),
    redes_sociales JSONB DEFAULT '{}'::jsonb,
    ubicacion JSONB DEFAULT NULL,
    rol rol_usuario_enum NOT NULL DEFAULT 'usuario',
    estado estado_usuario_enum NOT NULL DEFAULT 'activo',
    plan_id INT NULL REFERENCES planes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by BIGINT NULL REFERENCES usuarios(id),
    fecha_eliminacion TIMESTAMPTZ NULL,
    slug VARCHAR(100) NULL UNIQUE
);

CREATE TABLE preferencias_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    notificaciones_eventos BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_seguidores BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_email BOOLEAN NOT NULL DEFAULT TRUE,
    listado_como_artista BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- 8. TOKENS DE RESETEO DE CONTRASEÃ‘A
-- =============================================================================

CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_usuario ON password_reset_tokens(usuario_id);


-- =============================================================================
-- 9. SUSCRIPCIONES (relaciÃ³n usuario â†” plan)
-- =============================================================================

CREATE TABLE suscripciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES planes(id) ON DELETE RESTRICT,
    estado estado_suscripcion_enum NOT NULL DEFAULT 'activa',
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- 10. MIEMBROS DE ORGANIZACIÃ“N (un organizador puede tener max 2 miembros)
-- =============================================================================

CREATE TABLE miembros_organizacion (
    id BIGSERIAL PRIMARY KEY,
    organizador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    usuario_id BIGINT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    email_invitacion VARCHAR(150),
    nombre_invitado VARCHAR(150),
    rol_organizacion rol_organizacion_enum NOT NULL DEFAULT 'editor',
    estado estado_miembro_enum NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_org_usuario UNIQUE (organizador_id, usuario_id),
    CONSTRAINT ck_miembro_identidad CHECK (
        (usuario_id IS NOT NULL) OR (email_invitacion IS NOT NULL)
    )
);


-- =============================================================================
-- 11. CATEGORÃAS Y EVENTOS
-- =============================================================================

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono_url TEXT,
    color_hex VARCHAR(10) DEFAULT '#000000'
);

CREATE TABLE eventos (
    id BIGSERIAL PRIMARY KEY,
    organizador_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    ubicacion_id BIGINT REFERENCES ubicaciones(id) ON DELETE SET NULL,
    creado_por BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    aforo INT NOT NULL DEFAULT 1 CHECK (aforo BETWEEN 1 AND 50000),
    imagenes JSONB DEFAULT '[]'::jsonb,
    online BOOLEAN NOT NULL DEFAULT FALSE,
    link_online TEXT DEFAULT NULL,
    usuarios_cartelera JSONB DEFAULT '[]'::jsonb,
    restriccion_acceso VARCHAR(100) DEFAULT 'Todo pÃºblico',
    etiquetas JSONB DEFAULT '[]'::jsonb,
    visibilidad visibilidad_enum NOT NULL DEFAULT 'publico',
    es_gratuito BOOLEAN NOT NULL DEFAULT FALSE,
    localidades JSONB DEFAULT '[]'::jsonb,
    informacion_pago JSONB DEFAULT NULL,
    preguntas_frecuentes JSONB DEFAULT '[]'::jsonb,
    estado estado_evento_enum NOT NULL DEFAULT 'borrador',
    revisado_por BIGINT NULL REFERENCES usuarios(id),
    motivo_rechazo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT ck_fechas_validas CHECK (fecha_fin > fecha_inicio),
    CONSTRAINT ck_online_ubicacion CHECK (online = TRUE OR ubicacion_id IS NOT NULL)
);

CREATE TABLE event_visitas (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    usuario_id BIGINT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    fecha_visita TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- 12. RESERVAS (TICKETS), RESEÃ‘AS Y SOCIAL
-- =============================================================================

CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    localidad_nombre VARCHAR(100) NOT NULL,
    cantidad_tickets INT NOT NULL DEFAULT 1 CHECK (cantidad_tickets > 0),
    codigo_ticket VARCHAR(20) NOT NULL UNIQUE,
    qr_payload TEXT NOT NULL,
    estado estado_reserva_enum NOT NULL DEFAULT 'confirmada',
    fecha_reserva TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_verificacion TIMESTAMPTZ NULL,
    verificado_por BIGINT NULL REFERENCES usuarios(id),
    intervenido_por BIGINT NULL REFERENCES usuarios(id),
    motivo_intervencion TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resenas (
    id BIGSERIAL PRIMARY KEY,
    autor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    estado estado_resena_enum NOT NULL DEFAULT 'visible',
    motivo_reporte TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_autor_evento UNIQUE (autor_id, evento_id)
);

CREATE TABLE reportes_eventos (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    motivo TEXT NOT NULL,
    estado estado_reporte_evento_enum NOT NULL DEFAULT 'pendiente',
    gestionado_por BIGINT NULL REFERENCES usuarios(id),
    observacion_gestion TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usuario_evento_reporte UNIQUE (usuario_id, evento_id)
);

CREATE TABLE reportes_reservas (
    id BIGSERIAL PRIMARY KEY,
    reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    motivo TEXT NOT NULL,
    estado estado_reporte_reserva_enum NOT NULL DEFAULT 'pendiente',
    gestionado_por BIGINT NULL REFERENCES usuarios(id),
    observacion_gestion TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usuario_reserva_reporte UNIQUE (usuario_id, reserva_id)
);

CREATE TABLE favoritos (
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, evento_id)
);

CREATE TABLE seguidores (
    id BIGSERIAL PRIMARY KEY,
    seguidor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    seguido_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_seguidor UNIQUE (seguidor_id, seguido_id),
    CONSTRAINT ck_no_auto_seguir CHECK (seguidor_id != seguido_id)
);

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
-- 13. TRIGGERS
-- =============================================================================

-- 13a. Trigger genÃ©rico para actualizar updated_at automÃ¡ticamente
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

CREATE TRIGGER trg_update_miembros_updated_at
    BEFORE UPDATE ON miembros_organizacion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_eventos_updated_at
    BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_reservas_updated_at
    BEFORE UPDATE ON reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_resenas_updated_at
    BEFORE UPDATE ON resenas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_reportes_eventos_updated_at
    BEFORE UPDATE ON reportes_eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_reportes_reservas_updated_at
    BEFORE UPDATE ON reportes_reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_preferencias_usuario_updated_at
    BEFORE UPDATE ON preferencias_usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_event_visitas_updated_at
    BEFORE UPDATE ON event_visitas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_suscripciones_updated_at
    BEFORE UPDATE ON suscripciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13b. Trigger para mÃ¡ximo 5 eventos activos por organizador
CREATE OR REPLACE FUNCTION check_max_eventos_organizador()
RETURNS TRIGGER AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM eventos
    WHERE organizador_id = NEW.organizador_id
      AND estado NOT IN ('cancelado', 'finalizado')
      AND deleted_at IS NULL
      AND id != COALESCE(NEW.id, 0);

    IF v_count >= 5 THEN
        RAISE EXCEPTION 'Un organizador no puede tener mÃ¡s de 5 eventos activos (actualmente tiene %)', v_count;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_max_eventos_organizador
    BEFORE INSERT OR UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION check_max_eventos_organizador();

-- 13c. Trigger para mÃ¡ximo 2 miembros por organizador
CREATE OR REPLACE FUNCTION check_max_miembros()
RETURNS TRIGGER AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM miembros_organizacion
    WHERE organizador_id = NEW.organizador_id
      AND estado = 'activo'
      AND id != COALESCE(NEW.id, 0);

    IF v_count >= 2 THEN
        RAISE EXCEPTION 'Un organizador no puede tener mÃ¡s de 2 miembros activos (actualmente tiene %)', v_count;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_max_miembros
    BEFORE INSERT OR UPDATE ON miembros_organizacion
    FOR EACH ROW EXECUTE FUNCTION check_max_miembros();


-- =============================================================================
-- 14. ÃNDICES DE RENDIMIENTO
-- =============================================================================

-- Usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_deleted ON usuarios(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_plan ON usuarios(plan_id);
CREATE INDEX idx_usuarios_slug ON usuarios(slug) WHERE slug IS NOT NULL;

-- Suscripciones
CREATE INDEX idx_suscripciones_usuario ON suscripciones(usuario_id);
CREATE INDEX idx_suscripciones_plan ON suscripciones(plan_id);
CREATE INDEX idx_suscripciones_activa ON suscripciones(usuario_id) WHERE estado = 'activa';

-- Miembros
CREATE INDEX idx_miembros_org ON miembros_organizacion(organizador_id);
CREATE INDEX idx_miembros_usuario ON miembros_organizacion(usuario_id);

-- Eventos
CREATE INDEX idx_eventos_org ON eventos(organizador_id);
CREATE INDEX idx_eventos_categoria ON eventos(categoria_id);
CREATE INDEX idx_eventos_ubicacion ON eventos(ubicacion_id);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_inicio, fecha_fin);
CREATE INDEX idx_eventos_estado ON eventos(estado);
CREATE INDEX idx_eventos_deleted ON eventos(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_eventos_creado_por ON eventos(creado_por);

-- Visitas a eventos
CREATE INDEX idx_event_visitas_evento ON event_visitas(evento_id);
CREATE INDEX idx_event_visitas_fecha ON event_visitas(fecha_visita);

-- Reservas
CREATE INDEX idx_reservas_codigo ON reservas(codigo_ticket);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_evento ON reservas(evento_id);
CREATE INDEX idx_reservas_evento_localidad ON reservas(evento_id, localidad_nombre);

-- ReseÃ±as
CREATE INDEX idx_resenas_evento ON resenas(evento_id);
CREATE INDEX idx_resenas_autor ON resenas(autor_id);

-- Reportes de eventos
CREATE INDEX idx_reportes_evento ON reportes_eventos(evento_id);
CREATE INDEX idx_reportes_usuario ON reportes_eventos(usuario_id);
CREATE INDEX idx_reportes_estado ON reportes_eventos(estado);

-- Reportes de reservas
CREATE INDEX idx_reportes_reservas_reserva ON reportes_reservas(reserva_id);
CREATE INDEX idx_reportes_reservas_usuario ON reportes_reservas(usuario_id);
CREATE INDEX idx_reportes_reservas_estado ON reportes_reservas(estado);

-- Favoritos
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);

-- Seguidores
CREATE INDEX idx_seguidores_seguidor ON seguidores(seguidor_id);
CREATE INDEX idx_seguidores_seguido ON seguidores(seguido_id);

-- Notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

-- AuditorÃ­a
CREATE INDEX idx_bitacora_usuario ON bitacora_auditoria(usuario_id);
CREATE INDEX idx_bitacora_tabla ON bitacora_auditoria(tabla_afectada);
CREATE INDEX idx_bitacora_fecha ON bitacora_auditoria(created_at);


-- =============================================================================
-- 15. DATOS SEMILLA INICIALES
-- =============================================================================

INSERT INTO planes (nombre, descripcion, max_eventos, max_miembros, resenas_premium, precio_mensual) VALUES
('basico', 'Plan gratuito - 5 eventos, 2 miembros', 5, 2, FALSE, 0),
('pro', 'Plan Pro - 15 eventos, 5 miembros, reseÃ±as premium', 15, 5, TRUE, 19.99),
('premium', 'Plan Premium - 50 eventos, 15 miembros, reseÃ±as premium + publicidad nativa', 50, 15, TRUE, 49.99);

INSERT INTO provincias (nombre, codigo_iso) VALUES ('Pichincha', 'EC-P');

INSERT INTO ciudades (provincia_id, nombre, latitud_centro, longitud_centro)
VALUES (1, 'Quito', -0.180653, -78.467838);

INSERT INTO categorias (nombre, descripcion, icono_url, color_hex) VALUES
('MÃºsica en Vivo', 'Conciertos, bandas independientes y acÃºsticos', 'music', '#E63946'),
('Bar & Discoteca', 'Bares, pub crawls y fiesta nocturna', 'beer', '#F4A261'),
('Arte & Cultura', 'Exposiciones, teatro y cultura urbana', 'palette', '#2A9D8F'),
('GastronomÃ­a & CafÃ©s', 'CafeterÃ­as culturales y ferias gastronÃ³micas', 'coffee', '#E76F51');
