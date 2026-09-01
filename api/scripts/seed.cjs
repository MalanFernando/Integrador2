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

async function upsertUsuario(email, password, nombre, apellido, rol) {
  const existente = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
  if (existente.rows.length > 0) {
    return existente.rows[0].id;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const r = await client.query(
    'INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [email, passwordHash, nombre, apellido, rol, 'activo'],
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
    'Administrador',
    'Hasta la Vuelta',
    'admin',
  );
  const organizadorId = await upsertUsuario(
    'organizador@demo.com',
    'Demo.2026!',
    'María',
    'Fernández',
    'organizador',
  );
  const artistaId = await upsertUsuario(
    'artista@demo.com',
    'Demo.2026!',
    'Carlos',
    'Pérez',
    'artista',
  );
  await upsertUsuario('fan@demo.com', 'Demo.2026!', 'Lucía', 'Gómez', 'usuario');
  console.log('Usuarios: OK (admin@hastalavuelta.com, organizador@demo.com, artista@demo.com, fan@demo.com)');

  // Miembro de organización: el organizador tiene un editor
  const miembroExistente = await client.query(
    'SELECT id FROM miembros_organizacion WHERE organizador_id = $1 AND usuario_id = $2',
    [organizadorId, adminId],
  );
  if (miembroExistente.rows.length === 0) {
    await client.query(
      'INSERT INTO miembros_organizacion (organizador_id, usuario_id, rol_organizacion, estado) VALUES ($1, $2, $3, $4)',
      [organizadorId, adminId, 'editor', 'activo'],
    );
    console.log('Miembro organización: OK (admin como editor del organizador)');
  }

  // Crear evento de ejemplo
  const ev = await client.query('SELECT id FROM eventos WHERE titulo = $1', ['Noche de Jazz en Quito']);
  if (ev.rows.length === 0) {
    const categoria = await client.query('SELECT id FROM categorias WHERE nombre = $1', ['Música en Vivo']);
    if (categoria.rows.length === 0) {
      throw new Error('Categoría "Música en Vivo" no encontrada. Ejecuta schema.sql primero.');
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

    const localidades = JSON.stringify([
      { nombre: 'Entrada General', aforo: 150, precio: 20 },
      { nombre: 'VIP', aforo: 50, precio: 45 },
    ]);
    const imagenes = JSON.stringify([
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
    ]);
    const usuariosCartelera = JSON.stringify([
      { usuarioId: artistaId, nombre: 'Carlos Pérez', rol: 'Artista principal', orden: 1 },
    ]);
    const preguntasFrecuentes = JSON.stringify([
      { titulo: '¿Hay estacionamiento?', respuesta: 'Sí, con tarifa preferencial.' },
    ]);
    const etiquetas = JSON.stringify(['jazz', 'en vivo', 'quito']);

    await client.query(
      `INSERT INTO eventos
         (organizador_id, categoria_id, ubicacion_id, creado_por, titulo, descripcion,
          fecha_inicio, fecha_fin, aforo, imagenes, online, usuarios_cartelera,
          restriccion_acceso, etiquetas, visibilidad, localidades,
          preguntas_frecuentes, estado, revisado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        organizadorId,
        categoria.rows[0].id,
        ubId,
        organizadorId,
        'Noche de Jazz en Quito',
        'Una velada con los mejores exponentes del jazz ecuatoriano.',
        fechaInicio,
        fechaFin,
        200,
        imagenes,
        false,
        usuariosCartelera,
        'Todo público',
        etiquetas,
        'publico',
        localidades,
        preguntasFrecuentes,
        'aprobado',
        adminId,
      ],
    );
    console.log('Evento: OK (Noche de Jazz en Quito, aprobado, con 2 localidades)');
  }

  // Crear reserva de ejemplo
  const eventoSeed = await client.query("SELECT id FROM eventos WHERE titulo = 'Noche de Jazz en Quito'");
  const fanUser = await client.query("SELECT id FROM usuarios WHERE email = 'fan@demo.com'");
  if (eventoSeed.rows.length > 0 && fanUser.rows.length > 0) {
    const eventoId = eventoSeed.rows[0].id;
    const fanId = fanUser.rows[0].id;
    const reservaExistente = await client.query(
      'SELECT id FROM reservas WHERE evento_id = $1 AND usuario_id = $2',
      [eventoId, fanId],
    );
    if (reservaExistente.rows.length === 0) {
      await client.query(
        `INSERT INTO reservas (evento_id, usuario_id, localidad_nombre, cantidad_tickets, codigo_ticket, qr_payload, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [eventoId, fanId, 'Entrada General', 2, 'TKT-DEMO-001', 'hlt:TKT-DEMO-001', 'confirmada'],
      );
      console.log('Reserva: OK (2 tickets Entrada General para fan@demo.com)');
    }
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
