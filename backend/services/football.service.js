// ============================================================
// services/football.service.js — Clase 2: HTTP / Clase 3: Node
// Wrapper de API-Football v3. Tiene cache en memoria de 60s
// para no quemar los 100 requests/día del plan gratuito.
// ============================================================

const axios = require('axios');

// Orden de prioridad de ligas (de mayor a menor importancia)
const PRIORIDAD_LIGAS = [
  2,    // UEFA Champions League
  3,    // UEFA Europa League
  848,  // UEFA Europa Conference League
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A
  78,   // Bundesliga
  61,   // Ligue 1
  13,   // Copa Libertadores
  11,   // Copa Sudamericana
  128,  // Liga Argentina (Binance Cup)
  130,  // Liga Argentina (Primera División)
  9,    // Copa América
  10,   // FIFA World Cup
  1,    // World Cup - Qualification
  15,   // FIFA Club World Cup
  34,   // Premier League 2
  45,   // FA Cup
  48,   // League Cup
  143,  // Copa del Rey
  137,  // Coppa Italia
  81,   // DFB Pokal
];

// Cache simple en memoria: { clave: { data, expira } }
const cache = {};
const CACHE_TTL_MS = 60 * 1000; // 60 segundos

function obtenerDeCache(clave) {
  const entrada = cache[clave];
  if (!entrada) return null;
  if (Date.now() > entrada.expira) {
    delete cache[clave];
    return null;
  }
  return entrada.data;
}

function guardarEnCache(clave, data) {
  cache[clave] = { data, expira: Date.now() + CACHE_TTL_MS };
}

// Cliente Axios preconfigurado para API-Football
const clienteApi = axios.create({
  baseURL: process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': process.env.API_FOOTBALL_KEY,
  },
});

// ── Obtener todos los partidos en vivo ───────────────────────
async function obtenerPartidosEnVivo() {
  const clave = 'partidos_en_vivo';
  const cached = obtenerDeCache(clave);
  if (cached) return cached;

  // Traemos TODOS los partidos en vivo del mundo sin filtrar por liga
  const { data } = await clienteApi.get('/fixtures', {
    params: { live: 'all' },
  });

  const todos = data.response || [];

  // Ordenamos por prioridad de liga; los que no están en la lista van al final
  const ordenados = [...todos].sort((a, b) => {
    const rankA = PRIORIDAD_LIGAS.indexOf(a.league.id);
    const rankB = PRIORIDAD_LIGAS.indexOf(b.league.id);
    const pA = rankA === -1 ? 999 : rankA;
    const pB = rankB === -1 ? 999 : rankB;
    return pA - pB;
  });

  // Devolvemos los 20 más importantes
  const resultado = ordenados.slice(0, 20);
  guardarEnCache(clave, resultado);
  return resultado;
}

// ── Transforma el formato crudo de API-Football al formato del frontend ──
function transformarPartido(p) {
  return {
    id:      p.fixture.id,
    estado:  p.fixture.status.short,
    minuto:  p.fixture.status.elapsed,
    liga: {
      id:     p.league.id,
      nombre: p.league.name,
      pais:   p.league.country,
      logo:   p.league.logo,
    },
    equipoLocal: {
      id:     p.teams.home.id,
      nombre: p.teams.home.name,
      logo:   p.teams.home.logo,
      goles:  p.goals.home,
    },
    equipoVisitante: {
      id:     p.teams.away.id,
      nombre: p.teams.away.name,
      logo:   p.teams.away.logo,
      goles:  p.goals.away,
    },
  };
}

// ── Obtener estadísticas de un partido específico ────────────
async function obtenerEstadisticasPartido(fixtureId) {
  const clave = `stats_${fixtureId}`;
  const cached = obtenerDeCache(clave);
  if (cached) return cached;

  const { data } = await clienteApi.get('/fixtures/statistics', {
    params: { fixture: fixtureId },
  });

  const resultado = data.response || [];
  guardarEnCache(clave, resultado);
  return resultado;
}

// ── Obtener eventos de un partido (goles, tarjetas, etc.) ────
async function obtenerEventosPartido(fixtureId) {
  const clave = `eventos_${fixtureId}`;
  const cached = obtenerDeCache(clave);
  if (cached) return cached;

  const { data } = await clienteApi.get('/fixtures/events', {
    params: { fixture: fixtureId },
  });

  const resultado = data.response || [];
  guardarEnCache(clave, resultado);
  return resultado;
}

module.exports = {
  obtenerPartidosEnVivo,
  transformarPartido,
  obtenerEstadisticasPartido,
  obtenerEventosPartido,
  PRIORIDAD_LIGAS,
};
