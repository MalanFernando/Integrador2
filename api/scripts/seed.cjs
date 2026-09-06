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

async function main() {
  await client.connect();
  console.log('Conexión a la base: OK');

  await upsertGeografia();

  await upsertUsuario(
    'admin@hastalavuelta.com',
    'Admin.2026!',
    'Administrador',
    'Hasta la Vuelta',
    'admin',
  );
  console.log('Usuarios: OK (admin@hastalavuelta.com)');

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
