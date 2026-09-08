const process = require('node:process');
const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

/*
================================================================================
 CREDENCIALES DEMO — Hasta la Vuelta
================================================================================

 ORGANIZADORES:
   valentina@lunacultura.com  / Luna.Demo.2026!     (slug: lunacultura)
   marco@feriaroots.com       / Feria.Demo.2026!    (slug: feriaroots)
   ana@plazasonora.com        / Sonora.Demo.2026!   (slug: plazasonora)

 USUARIOS:
   camila.pazmino@demo.com    / User.Demo.2026!    (slug: camilapazmino)
   diego.andrade@demo.com     / User.Demo.2026!    (slug: diegoandrade)

 NOTA: Las contraseñas de hashing lento son hasheadas con bcrypt rounds=10.
       Las contraseñas plain-text listadas arriba son las que usan los
       usuarios para hacer login.

================================================================================
*/

try {
  process.loadEnvFile();
} catch {
}

try {
  process.loadEnvFile();
} catch {
}

const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const USUARIOS = [
  {
    email: 'valentina@lunacultura.com',
    password: 'Luna.Demo.2026!',
    nombre: 'Valentina',
    apellido: 'Ríos',
    rol: 'organizador',
    slug: 'lunacultura',
    telefono: '+593991234567',
    biografia: 'Productora cultural con más de 8 años de experiencia en la organización de eventos artísticos y culturales en Quito. Apasionada por promover el talento local.',
    etiqueta: 'Productora Cultural',
    redes: { instagram: 'https://instagram.com/lunacultura', facebook: 'https://facebook.com/lunacultura' },
    ubicacion: { ciudad: 'Quito', lat: -0.180653, lng: -78.467838 },
  },
  {
    email: 'marco@feriaroots.com',
    password: 'Feria.Demo.2026!',
    nombre: 'Marco',
    apellido: 'Salazar',
    rol: 'organizador',
    slug: 'feriaroots',
    telefono: '+593982345678',
    biografia: 'Fundador de Feria Roots, un proyecto dedicado a crear espacios de encuentro para la comunidad quiteña. Más de 5 años organizando ferias gastronómicas y culturales.',
    etiqueta: 'Organizador de Ferias',
    redes: { instagram: 'https://instagram.com/feriaroots' },
    ubicacion: { ciudad: 'Quito', lat: -0.210653, lng: -78.487838 },
  },
  {
    email: 'ana@plazasonora.com',
    password: 'Sonora.Demo.2026!',
    nombre: 'Ana Belén',
    apellido: 'Torres',
    rol: 'organizador',
    slug: 'plazasonora',
    telefono: '+593993456789',
    biografia: 'Músico y organizador de eventos. creadora de Plaza Sonora, un espacio dedicado a la música en vivo y las experiencias sonoras immersivas.',
    etiqueta: 'Músico y Productor',
    redes: { instagram: 'https://instagram.com/plazasonora', twitter: 'https://twitter.com/plazasonora' },
    ubicacion: { ciudad: 'Guayaquil', lat: -2.170997, lng: -79.922359 },
  },
  {
    email: 'camila.pazmino@demo.com',
    password: 'User.Demo.2026!',
    nombre: 'Camila',
    apellido: 'Pazmiño',
    rol: 'usuario',
    slug: 'camilapazmino',
    telefono: '+593994567890',
    biografia: 'Amante de la música y el teatro. Siempre buscando nuevas experiencias culturales en la ciudad.',
    etiqueta: 'Entusiasta Cultural',
    redes: {},
    ubicacion: { ciudad: 'Quito', lat: -0.175653, lng: -78.460838 },
  },
  {
    email: 'diego.andrade@demo.com',
    password: 'User.Demo.2026!',
    nombre: 'Diego',
    apellido: 'Andrade',
    rol: 'usuario',
    slug: 'diegoandrade',
    telefono: '+593995678901',
    biografia: 'Comediante y amante del stand-up. Frequentador de eventos de humor y cine independiente.',
    etiqueta: 'Comediante',
    redes: { instagram: 'https://instagram.com/diegoandrade' },
    ubicacion: { ciudad: 'Quito', lat: -0.190653, lng: -78.475838 },
  },
];

async function upsertUsuario(usuario) {
  const existente = await client.query('SELECT id FROM usuarios WHERE email = $1', [usuario.email]);
  if (existente.rows.length > 0) {
    return existente.rows[0].id;
  }
  const passwordHash = await bcrypt.hash(usuario.password, 10);
  const r = await client.query(
    `INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, biografia, etiqueta, redes_sociales, ubicacion, rol, estado, slug)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'activo', $11) RETURNING id`,
    [
      usuario.email,
      passwordHash,
      usuario.nombre,
      usuario.apellido,
      usuario.telefono,
      usuario.biografia,
      usuario.etiqueta,
      JSON.stringify(usuario.redes),
      JSON.stringify(usuario.ubicacion),
      usuario.rol,
      usuario.slug,
    ],
  );
  return r.rows[0].id;
}

async function getCategoriaId(nombre) {
  const r = await client.query('SELECT id FROM categorias WHERE LOWER(nombre) = LOWER($1)', [nombre]);
  if (r.rows.length > 0) return r.rows[0].id;
  return null;
}

async function upsertCategoria(nombre, descripcion, colorHex) {
  const r = await client.query('SELECT id FROM categorias WHERE LOWER(nombre) = LOWER($1)', [nombre]);
  if (r.rows.length > 0) return r.rows[0].id;
  const res = await client.query(
    'INSERT INTO categorias (nombre, descripcion, color_hex) VALUES ($1, $2, $3) RETURNING id',
    [nombre, descripcion, colorHex],
  );
  return res.rows[0].id;
}

async function crearUbicacion(ciudad, direccion, lat, lng) {
  let ciudadId;
  const c = await client.query('SELECT id FROM ciudades WHERE LOWER(nombre) = LOWER($1)', [ciudad]);
  if (c.rows.length > 0) {
    ciudadId = c.rows[0].id;
  } else {
    const prov = await client.query('SELECT id FROM provincias LIMIT 1');
    const provId = prov.rows[0]?.id;
    if (!provId) return null;
    const r = await client.query(
      'INSERT INTO ciudades (provincia_id, nombre, latitud_centro, longitud_centro) VALUES ($1, $2, $3, $4) RETURNING id',
      [provId, ciudad, lat, lng],
    );
    ciudadId = r.rows[0].id;
  }
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const r = await client.query(
    `INSERT INTO ubicaciones (ciudad_id, direccion_linea1, latitud, longitud, geom)
     VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($4::numeric, $3::numeric), 4326)::geography)
     ON CONFLICT DO NOTHING RETURNING id`,
    [ciudadId, direccion, latNum, lngNum],
  );
  return r.rows[0]?.id;
}

async function crearEvento(evento) {
  const existente = await client.query('SELECT id FROM eventos WHERE titulo = $1 AND organizador_id = $2', [evento.titulo, evento.organizadorId]);
  if (existente.rows.length > 0) return existente.rows[0].id;
  const r = await client.query(
    `INSERT INTO eventos (organizador_id, categoria_id, ubicacion_id, creado_por, titulo, descripcion, fecha_inicio, fecha_fin, aforo, online, link_online, es_gratuito, localidades, visibilidad, estado, etiquetas, usuarios_cartelera)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'publico', 'aprobado', '[]'::jsonb, $14) RETURNING id`,
    [
      evento.organizadorId,
      evento.categoriaId,
      evento.ubicacionId,
      evento.organizadorId,
      evento.titulo,
      evento.descripcion,
      evento.fechaInicio,
      evento.fechaFin,
      evento.aforo,
      evento.online,
      evento.linkOnline || null,
      evento.esGratuito,
      JSON.stringify(evento.localidades),
      JSON.stringify(evento.usuariosCartelera ?? []),
    ],
  );
  return r.rows[0].id;
}

async function crearResena(resena) {
  const existente = await client.query('SELECT id FROM resenas WHERE autor_id = $1 AND evento_id = $2', [resena.autorId, resena.eventoId]);
  if (existente.rows.length > 0) return existente.rows[0].id;
  const r = await client.query(
    `INSERT INTO resenas (autor_id, evento_id, puntuacion, comentario, estado)
     VALUES ($1, $2, $3, $4, 'visible') RETURNING id`,
    [resena.autorId, resena.eventoId, resena.puntuacion, resena.comentario],
  );
  return r.rows[0].id;
}

async function crearReserva(reserva) {
  const existente = await client.query('SELECT id FROM reservas WHERE codigo_ticket = $1', [reserva.codigoTicket]);
  if (existente.rows.length > 0) return existente.rows[0].id;
  const qrPayload = `HLV:${reserva.codigoTicket}:${reserva.eventoId}`;
  const r = await client.query(
    `INSERT INTO reservas (evento_id, usuario_id, localidad_nombre, cantidad_tickets, codigo_ticket, qr_payload, estado)
     VALUES ($1, $2, $3, $4, $5, $6, 'confirmada') RETURNING id`,
    [reserva.eventoId, reserva.usuarioId, reserva.localidadNombre, reserva.cantidadTickets, reserva.codigoTicket, qrPayload],
  );
  return r.rows[0].id;
}

async function main() {
  await client.connect();
  console.log('Conexión a la base: OK');

  console.log('\n=== inserting usuarios demo ===');
  const usuarioIds = {};
  for (const u of USUARIOS) {
    const id = await upsertUsuario(u);
    usuarioIds[u.email] = id;
    console.log(`  ${u.email} -> ${id} (slug: ${u.slug})`);
  }

  console.log('\n=== creating ubicaciones ===');
  const ubicaciones = {
    quitoCentro: await crearUbicacion('Quito', 'Plaza de la Independencia', -0.180653, -78.467838),
    quitoNorte: await crearUbicacion('Quito', 'CC El Ejido', -0.195653, -78.477838),
    quitoSur: await crearUbicacion('Quito', 'Parque_LINEAL', -0.290653, -78.547838),
    quitoWest: await crearUbicacion('Quito', 'Café de la Respirar', -0.200653, -78.500838),
    guayaquil: await crearUbicacion('Guayaquil', 'Malecón 2000', -2.170997, -79.922359),
  };
  console.log('  Ubicaciones creadas:', ubicaciones);

  console.log('\n=== creating categorias ===');
  const cats = {
    comedia: await upsertCategoria('Comedia', 'Eventos de comedia y stand-up', '#FF5722'),
    teatro: await upsertCategoria('Teatro', 'Obras de teatro y performances', '#9C27B0'),
    concierto: await upsertCategoria('Concierto', 'Conciertos y eventos musicales', '#E91E63'),
    feria: await upsertCategoria('Feria', 'Ferias gastronómicas y artesanales', '#FF9800'),
    cine: await upsertCategoria('Cine', 'Proyecciones y festivales de cine', '#673AB7'),
    social: await upsertCategoria('Social', 'Eventos sociales y networking', '#00BCD4'),
    deporte: await upsertCategoria('Deporte', 'Eventos deportivos', '#4CAF50'),
  };
  console.log('  Categorías:', cats);

  const hoy = new Date();
  const enUnaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
  const enUnMes = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
  const haceUnaSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
  const haceDosSemanas = new Date(hoy.getTime() - 14 * 24 * 60 * 60 * 1000);
  const haceUnMes = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

  function fmt(d) { return d.toISOString(); }

  console.log('\n=== inserting eventos demo ===');
  const eventos = [
    {
      titulo: 'Maratón de Cine de Terror',
      descripcion: 'Evento pasado - Maratón de películas de terror clásico. Gran ambiente y clásicos imperecederos.',
      fechaInicio: fmt(haceDosSemanas),
      fechaFin: fmt(new Date(haceDosSemanas.getTime() + 5 * 60 * 60 * 1000)),
      aforo: 80,
      online: false,
      ubicacionId: ubicaciones.quitoCentro,
      categoriaId: cats.cine,
      organizadorId: usuarioIds['valentina@lunacultura.com'],
      esGratuito: false,
      localidades: [
        { nombre: 'General', precio: 8, disponibilidad: 80 },
      ],
    },
    {
      titulo: 'Noche de Stand-Up Comedy',
      descripcion: 'Una noche de risas con los mejores comediantes locales de Quito. Perfecta para desconectar y disfrutar.',
      fechaInicio: fmt(haceUnaSemana),
      fechaFin: fmt(new Date(haceUnaSemana.getTime() + 3 * 60 * 60 * 1000)),
      aforo: 100,
      online: false,
      ubicacionId: ubicaciones.quitoCentro,
      categoriaId: cats.comedia,
      organizadorId: usuarioIds['valentina@lunacultura.com'],
      esGratuito: true,
      localidades: [{ nombre: 'General', precio: 0, disponibilidad: 100 }],
      usuariosCartelera: [
        { nombre: 'Mateo Racancoet', rol: 'Presentador', orden: 1 },
        { nombre: 'Sofia Burgos', rol: 'Comediante invitada', orden: 2 },
        { nombre: 'Diego Montenegro', rol: 'Comediante', orden: 3 },
      ],
    },
    {
      titulo: 'Feria Roots: Sabores del Ecuador',
      descripcion: 'La feria gastronómica más grande de Quito. Más de 50 puestos con comida tradicional y de autor.',
      fechaInicio: fmt(haceUnMes),
      fechaFin: fmt(new Date(haceUnMes.getTime() + 6 * 60 * 60 * 1000)),
      aforo: 500,
      online: false,
      ubicacionId: ubicaciones.quitoWest,
      categoriaId: cats.feria,
      organizadorId: usuarioIds['marco@feriaroots.com'],
      esGratuito: false,
      localidades: [
        { nombre: 'Entrada', precio: 5, disponibilidad: 400 },
        { nombre: 'VIP', precio: 15, disponibilidad: 100 },
      ],
    },
    {
      titulo: 'Festival de Cine Independiente',
      descripcion: 'Proyección de cortometrajes de directores emergentes nacionales e internacionales.',
      fechaInicio: fmt(haceDosSemanas),
      fechaFin: fmt(new Date(haceDosSemanas.getTime() + 4 * 60 * 60 * 1000)),
      aforo: 150,
      online: false,
      ubicacionId: ubicaciones.quitoNorte,
      categoriaId: cats.cine,
      organizadorId: usuarioIds['valentina@lunacultura.com'],
      esGratuito: false,
      localidades: [
        { nombre: 'Estudiante', precio: 5, disponibilidad: 75 },
        { nombre: 'General', precio: 15, disponibilidad: 75 },
      ],
    },
    {
      titulo: 'Concierto Acústico: Plaza Sonora',
      descripcion: 'Una experiencia musical íntima con artistas locales. Plazas limitadas para una conexión directa con la música.',
      fechaInicio: fmt(haceUnaSemana),
      fechaFin: fmt(new Date(haceUnaSemana.getTime() + 2 * 60 * 60 * 1000)),
      aforo: 80,
      online: false,
      ubicacionId: ubicaciones.quitoCentro,
      categoriaId: cats.concierto,
      organizadorId: usuarioIds['ana@plazasonora.com'],
      esGratuito: false,
      localidades: [
        { nombre: 'General', precio: 30, disponibilidad: 60 },
        { nombre: 'Preferencia', precio: 60, disponibilidad: 20 },
      ],
      usuariosCartelera: [
        { nombre: 'Valentina Solis', rol: 'Voz y guitarra', orden: 1 },
        { nombre: 'Andrés Peñaherrera', rol: 'Percusión', orden: 2 },
        { nombre: 'Camila Pazmiño', rol: 'Violín', orden: 3 },
      ],
    },
    {
      titulo: 'Torneo de Fútbol 5 Amateur',
      descripcion: 'Competencia de fútbol 5 abierta a todos los equipos amateurs de Quito.',
      fechaInicio: fmt(haceUnMes),
      fechaFin: fmt(new Date(haceUnMes.getTime() + 4 * 60 * 60 * 1000)),
      aforo: 200,
      online: false,
      ubicacionId: ubicaciones.quitoSur,
      categoriaId: cats.deporte,
      organizadorId: usuarioIds['marco@feriaroots.com'],
      esGratuito: false,
      localidades: [
        { nombre: 'Equipo', precio: 60, disponibilidad: 32 },
      ],
    },
    {
      titulo: 'Workshop de Improvisación Teatral',
      descripcion: 'Aprende los fundamentos de la improvisación teatral con actores profesionales.',
      fechaInicio: fmt(enUnaSemana),
      fechaFin: fmt(new Date(enUnaSemana.getTime() + 3 * 60 * 60 * 1000)),
      aforo: 30,
      online: false,
      ubicacionId: ubicaciones.quitoNorte,
      categoriaId: cats.teatro,
      organizadorId: usuarioIds['valentina@lunacultura.com'],
      esGratuito: true,
      localidades: [{ nombre: 'Taller', precio: 0, disponibilidad: 30 }],
    },
    {
      titulo: 'Encuentro Social: Networking Creativo',
      descripcion: 'Evento de networking para profesionales del sector creativo. Ideal para hacer contactos y compartir ideas.',
      fechaInicio: fmt(new Date(hoy.getTime() + 4 * 24 * 60 * 60 * 1000)),
      fechaFin: fmt(new Date(hoy.getTime() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)),
      aforo: 60,
      online: false,
      ubicacionId: ubicaciones.quitoWest,
      categoriaId: cats.social,
      organizadorId: usuarioIds['marco@feriaroots.com'],
      esGratuito: false,
      localidades: [
        { nombre: 'Asistente', precio: 10, disponibilidad: 50 },
      ],
    },
    {
      titulo: 'Streaming: Sesión de Jazz en Vivo',
      descripcion: 'Disfruta de una sesión de jazz en directo desde Plaza Sonora. Disponible online para todo el mundo.',
      fechaInicio: fmt(new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000)),
      fechaFin: fmt(new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)),
      aforo: 1000,
      online: true,
      linkOnline: 'https://plazasonora.com/live/jazz-sesion1',
      categoriaId: cats.concierto,
      organizadorId: usuarioIds['ana@plazasonora.com'],
      esGratuito: true,
      localidades: [{ nombre: 'Online', precio: 0, disponibilidad: 1000 }],
    },
    {
      titulo: 'Clase Magistral de Teatro Físico',
      descripcion: 'Una masterclass con un reconocido director de teatro contemporáneo.',
      fechaInicio: fmt(new Date(enUnMes.getTime() + 5 * 24 * 60 * 60 * 1000)),
      fechaFin: fmt(new Date(enUnMes.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)),
      aforo: 40,
      online: false,
      ubicacionId: ubicaciones.quitoNorte,
      categoriaId: cats.teatro,
      organizadorId: usuarioIds['ana@plazasonora.com'],
      esGratuito: false,
      localidades: [
        { nombre: 'Estudiante', precio: 15, disponibilidad: 20 },
        { nombre: 'Profesional', precio: 30, disponibilidad: 20 },
      ],
    },
  ];

  const eventoIds = {};
  for (const ev of eventos) {
    const id = await crearEvento(ev);
    eventoIds[ev.titulo] = id;
    console.log(`  ${ev.titulo} -> ${id}`);
  }

  console.log('\n=== inserting resenas ===');
  const resenas = [
    { autorId: usuarioIds['camila.pazmino@demo.com'], eventoId: eventoIds['Noche de Stand-Up Comedy'], puntuacion: 5, comentario: 'Una noche increíble. Los comediantes estaban en su mejor momento.' },
    { autorId: usuarioIds['camila.pazmino@demo.com'], eventoId: eventoIds['Festival de Cine Independiente'], puntuacion: 4, comentario: 'Muy buenas películas y ambiente agradable.' },
    { autorId: usuarioIds['diego.andrade@demo.com'], eventoId: eventoIds['Concierto Acústico: Plaza Sonora'], puntuacion: 5, comentario: 'La mejor experiencia musical que he tenido en Quito.' },
    { autorId: usuarioIds['diego.andrade@demo.com'], eventoId: eventoIds['Maratón de Cine de Terror'], puntuacion: 4, comentario: 'Maratón increíble con películas clásicos del terror. Volvería sin dudarlo.' },
    { autorId: usuarioIds['camila.pazmino@demo.com'], eventoId: eventoIds['Feria Roots: Sabores del Ecuador'], puntuacion: 5, comentario: 'Comida deliciosa y gran ambiente familiar.' },
    { autorId: usuarioIds['diego.andrade@demo.com'], eventoId: eventoIds['Torneo de Fútbol 5 Amateur'], puntuacion: 4, comentario: 'Excelente organización. Los campos estaban en perfectas condiciones.' },
  ];

  for (const r of resenas) {
    const id = await crearResena(r);
    console.log(`  Reseña ${id}: usuario=${r.autorId} evento=${r.eventoId}`);
  }

  console.log('\n=== inserting reservas ===');
  const reservas = [
    { eventoId: eventoIds['Noche de Stand-Up Comedy'], usuarioId: usuarioIds['camila.pazmino@demo.com'], localidadNombre: 'General', cantidadTickets: 2, codigoTicket: 'TKT-DEMO-001' },
    { eventoId: eventoIds['Concierto Acústico: Plaza Sonora'], usuarioId: usuarioIds['diego.andrade@demo.com'], localidadNombre: 'General', cantidadTickets: 1, codigoTicket: 'TKT-DEMO-002' },
    { eventoId: eventoIds['Festival de Cine Independiente'], usuarioId: usuarioIds['camila.pazmino@demo.com'], localidadNombre: 'General', cantidadTickets: 2, codigoTicket: 'TKT-DEMO-003' },
  ];

  for (const res of reservas) {
    const id = await crearReserva(res);
    console.log(`  Reserva ${id}: ${res.codigoTicket}`);
  }

  console.log('\n=== CREDENCIALES DEMO ===');
  console.log('');
  console.log('┌─────────────────────────────────┬──────────────────────┬────────────┬─────────────┐');
  console.log('│ Email                           │ Password             │ Rol        │ Slug       │');
  console.log('├─────────────────────────────────┼──────────────────────┼────────────┼─────────────┤');
  for (const u of USUARIOS) {
    const slug = u.slug || '-';
    console.log(`│ ${u.email.padEnd(31)} │ ${u.password.padEnd(22)} │ ${u.rol.padEnd(10)} │ ${slug.padEnd(11)} │`);
  }
  console.log('└─────────────────────────────────┴──────────────────────┴────────────┴─────────────┘');
  console.log('');

  await client.end();
  console.log('Seed demo completado.');
}

main().catch(async (err) => {
  console.error('Seed demo falló:', err.message);
  try {
    await client.end();
  } catch {
  }
  process.exit(1);
});
