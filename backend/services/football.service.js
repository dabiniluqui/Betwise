// ============================================================
// services/football.service.js — Clase 2: HTTP / Clase 3: Node
// Wrapper de API-Football v3. Tiene cache en memoria de 60s
// para no quemar los 100 requests/día del plan gratuito.
// ============================================================

const axios = require('axios');

// IDs de las ligas que mostramos
const LIGAS = {
  liga_argentina:  128,
  premier_league:   39,
  la_liga:         140,
  bundesliga:       78,
  ligue_1:          61,
  serie_a:         135,
  champions:          2,
  copa_libertadores: 13,
};

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

  // Ligas que queremos: string separado por guión
  const ligasParam = Object.values(LIGAS).join('-');

  const { data } = await clienteApi.get('/fixtures', {
    params: { live: 'all', league: ligasParam },
  });

  const resultado = data.response || [];
  guardarEnCache(clave, resultado);
  return resultado;
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
  obtenerEstadisticasPartido,
  obtenerEventosPartido,
  LIGAS,
};
