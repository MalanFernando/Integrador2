const process = require('node:process');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

try {
  process.loadEnvFile();
} catch {
  // .env opcional; se usan los valores por defecto
}

const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const PROVINCIAS = {
  Guayas: {
    iso: 'EC-G',
    ciudades: [
      { nombre: 'Guayaquil', lat: '-2.1709979', lng: '-79.9223592' },
      { nombre: 'Samborondón', lat: '-1.9632', lng: '-79.7259' },
    ],
  },
  Azuay: {
    iso: 'EC-A',
    ciudades: [{ nombre: 'Cuenca', lat: '-2.9009979', lng: '-79.0059' }],
  },
  Imbabura: {
    iso: 'EC-I',
    ciudades: [
      { nombre: 'Ibarra', lat: '0.3516', lng: '-78.1222' },
      { nombre: 'Otavalo', lat: '0.2337', lng: '-78.2631' },
    ],
  },
  Tungurahua: {
    iso: 'EC-T',
    ciudades: [
      { nombre: 'Ambato', lat: '-1.2491', lng: '-78.6168' },
      { nombre: 'Baños de Agua Santa', lat: '-1.3969', lng: '-78.4253' },
    ],
  },
  Loja: {
    iso: 'EC-L',
    ciudades: [{ nombre: 'Loja', lat: '-3.9931', lng: '-79.2042' }],
  },
  Manabí: {
    iso: 'EC-M',
    ciudades: [
      { nombre: 'Manta', lat: '-0.9514', lng: '-80.7337' },
      { nombre: 'Portoviejo', lat: '-1.0546', lng: '-80.4545' },
    ],
  },
};

async function upsertGeografia() {
  let pichincha = await client.query('SELECT id FROM provincias WHERE nombre = $1', ['Pichincha']);
  if (pichincha.rows.length === 0) {
    const r = await client.query(
      'INSERT INTO provincias (nombre, codigo_iso) VALUES ($1, $2) RETURNING id',
      ['Pichincha', 'EC-P'],
    );
    pichincha = r;
  }
  const pichinchaId = pichincha.rows[0].id;

  const quito = await client.query(
    'SELECT id FROM ciudades WHERE provincia_id = $1 AND nombre = $2',
    [pichinchaId, 'Quito'],
  );
  if (quito.rows.length === 0) {
    await client.query(
      'INSERT INTO ciudades (provincia_id, nombre, latitud_centro, longitud_centro) VALUES ($1, $2, $3, $4)',
      [pichinchaId, 'Quito', '-0.180653', '-78.467838'],
    );
  }

  for (const [nombreProv, datos] of Object.entries(PROVINCIAS)) {
    const prov = await client.query('SELECT id FROM provincias WHERE nombre = $1', [nombreProv]);
    let provId;
    if (prov.rows.length === 0) {
      const r = await client.query(
        'INSERT INTO provincias (nombre, codigo_iso) VALUES ($1, $2) RETURNING id',
        [nombreProv, datos.iso],
      );
      provId = r.rows[0].id;
    } else {
      provId = prov.rows[0].id;
    }
    for (const ciudad of datos.ciudades) {
      const c = await client.query(
        'SELECT id FROM ciudades WHERE provincia_id = $1 AND nombre = $2',
        [provId, ciudad.nombre],
      );
      if (c.rows.length === 0) {
        await client.query(
          'INSERT INTO ciudades (provincia_id, nombre, latitud_centro, longitud_centro) VALUES ($1, $2, $3, $4)',
          [provId, ciudad.nombre, ciudad.lat, ciudad.lng],
        );
      }
    }
  }
  console.log('Geografía: OK (provincias y ciudades)');
}

async function upsertUsuario(email, password, nombreCompleto, rol) {
  const existente = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
  if (existente.rows.length > 0) {
    return existente.rows[0].id;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const r = await client.query(
    'INSERT INTO usuarios (email, password_hash, nombre_completo, rol, estado) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [email, passwordHash, nombreCompleto, rol, 'activo'],
  );
  return r.rows[0].id;
}

async function crearUbicacion(ciudadId, direccion, referencia, codigoPostal, lat, lng) {
  const r = await client.query(
    `INSERT INTO ubicaciones
       (ciudad_id, direccion_linea1, referencia, codigo_postal, latitud, longitud, geom)
     VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography)
     RETURNING id`,
    [ciudadId, direccion, referencia, codigoPostal, lat, lng, lng, lat],
  );
  return r.rows[0].id;
}

async function main() {
  await client.connect();
  console.log('Conexión a la base: OK');

  await upsertGeografia();

  const adminId = await upsertUsuario(
    'admin@hastalavuelta.com',
    'Admin.2026!',
    'Administrador Hasta la Vuelta',
    'admin',
  );
  const organizadorId = await upsertUsuario(
    'organizador@demo.com',
    'Demo.2026!',
    'María Fernández',
    'organizador',
  );
  await upsertUsuario('fan@demo.com', 'Demo.2026!', 'Carlos Pérez', 'usuario');
  console.log('Usuarios: OK (admin@hastalavuelta.com, organizador@demo.com, fan@demo.com)');

  const org = await client.query('SELECT id FROM organizaciones WHERE slug = $1', ['la-movida-quitena']);
  let orgId;
  if (org.rows.length === 0) {
    const r = await client.query(
      `INSERT INTO organizaciones
         (propietario_id, nombre, slug, descripcion, email_contacto, telefono, sitio_web, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        organizadorId,
        'La Movida Quiteña',
        'la-movida-quitena',
        'Productora de eventos culturales y de música en vivo en Quito.',
        'contacto@lamovidaquitena.ec',
        '+593 99 000 0000',
        'https://lamovidaquitena.ec',
        'activo',
      ],
    );
    orgId = r.rows[0].id;
    await client.query(
      'INSERT INTO miembros_organizacion (organizacion_id, usuario_id, rol_organizacion, estado) VALUES ($1, $2, $3, $4)',
      [orgId, organizadorId, 'propietario', 'activo'],
    );
    console.log('Organización: OK (La Movida Quiteña)');
  } else {
    orgId = org.rows[0].id;
  }

  const est = await client.query(
    'SELECT id FROM establecimientos WHERE organizacion_id = $1 AND nombre_comercial = $2',
    [orgId, 'Casa de la Música'],
  );
  let establecimientoId = null;
  if (est.rows.length === 0) {
    const ubId = await crearUbicacion(
      1,
      'Av. Amazonas N37-51',
      'Frente al parque La Carolina',
      '170516',
      '-0.180653',
      '-78.467838',
    );
    const r = await client.query(
      `INSERT INTO establecimientos
         (organizacion_id, ubicacion_id, nombre_comercial, descripcion, capacidad_maxima, tipo_establecimiento, servicios, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        orgId,
        ubId,
        'Casa de la Música',
        'Sala de conciertos con capacidad para 250 personas.',
        250,
        'Sala de conciertos',
        JSON.stringify([
          { nombre: 'Barra completa' },
          { nombre: 'Estacionamiento' },
          { nombre: 'Sonido profesional' },
        ]),
        'aprobado',
      ],
    );
    establecimientoId = r.rows[0].id;
    console.log('Establecimiento: OK (Casa de la Música)');
  } else {
    establecimientoId = est.rows[0].id;
  }

  const ev = await client.query('SELECT id FROM eventos WHERE titulo = $1', ['Noche de Jazz en Quito']);
  if (ev.rows.length === 0) {
    const categoria = await client.query('SELECT id FROM categorias WHERE nombre = $1', ['Música en Vivo']);
    if (categoria.rows.length === 0) {
      throw new Error('Categoría Música en Vivo no encontrada');
    }
    const ubId = await crearUbicacion(
      1,
      'Av. de los Shyris 610',
      'Terraza del centro comercial',
      '170525',
      '-0.180653',
      '-78.467838',
    );
    const fechaInicio = new Date(Date.now() + 15 * 24 * 3600 * 1000);
    const fechaFin = new Date(fechaInicio.getTime() + 4 * 3600 * 1000);
    const r = await client.query(
      `INSERT INTO eventos
         (organizacion_id, establecimiento_id, categoria_id, ubicacion_id, creado_por, titulo, descripcion,
          fecha_inicio, fecha_fin, capacidad_total, imagen_principal_url, restriccion_acceso, etiquetas,
          presentado_por, preguntas_frecuentes, aviso_asistentes, estado, revisado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id`,
      [
        orgId,
        establecimientoId,
        categoria.rows[0].id,
        ubId,
        organizadorId,
        'Noche de Jazz en Quito',
        'Una velada con los mejores exponentes del jazz ecuatoriano.',
        fechaInicio,
        fechaFin,
        200,
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
        'Todo público',
        JSON.stringify(['jazz', 'en vivo', 'quito']),
        'La Movida Quiteña',
        JSON.stringify([
          { pregunta: '¿Hay estacionamiento?', respuesta: 'Sí, con tarifa preferencial.' },
        ]),
        'Puertas abren a las 19:00.',
        'aprobado',
        adminId,
      ],
    );
    const eventoId = r.rows[0].id;
    await client.query(
      `INSERT INTO localidades (evento_id, nombre, descripcion, precio, capacidad_total, tickets_reservados, estado) VALUES
       ($1, 'Entrada General', 'Acceso a pista general', '20.00', 150, 0, 'disponible'),
       ($1, 'VIP', 'Mesa cercana al escenario + una bebida', '45.00', 50, 0, 'disponible')`,
      [eventoId],
    );
    await client.query(
      `INSERT INTO evento_artistas (evento_id, nombre_artista, rol_en_evento, orden) VALUES
       ($1, 'Trío Jazz Ecuador', 'Artista principal', 1)`,
      [eventoId],
    );
    console.log('Evento: OK (Noche de Jazz en Quito, aprobado, con 2 localidades)');
  }

  await client.end();
  console.log('Seed completado.');
}

main().catch(async (err) => {
  console.error('Seed falló:', err.message);
  try {
    await client.end();
  } catch {
    // sin conexión
  }
  process.exit(1);
});
