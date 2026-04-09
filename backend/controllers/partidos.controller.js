// ============================================================
// controllers/partidos.controller.js — Clase 2: HTTP
// Orquesta los servicios de fútbol y Pulse Score,
// y responde al cliente con el formato correcto.
// ============================================================

const footballService  = require('../services/football.service');
const { transformarPartido } = footballService;
const pulseService     = require('../services/pulse.service');

// ── GET /api/v1/partidos/en-vivo ─────────────────────────────
async function enVivo(req, res, next) {
  try {
    const partidos = await footballService.obtenerPartidosEnVivo();

    // Formato limpio para el frontend Angular
    const respuesta = partidos.map(transformarPartido);

    res.json({ ok: true, total: respuesta.length, partidos: respuesta });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/v1/partidos/:id/pulse ───────────────────────────
async function pulse(req, res, next) {
  try {
    const fixtureId = Number(req.params.id);

    // Obtenemos stats y eventos en paralelo para no esperar dos veces
    const [stats, eventos] = await Promise.all([
      footballService.obtenerEstadisticasPartido(fixtureId),
      footballService.obtenerEventosPartido(fixtureId),
    ]);

    // Necesitamos el minuto actual — lo buscamos en los partidos en vivo
    const partidos    = await footballService.obtenerPartidosEnVivo();
    const partido     = partidos.find((p) => p.fixture.id === fixtureId);
    const minutoActual = partido?.fixture?.status?.elapsed || 0;

    const scores = pulseService.calcularPulseScore(stats, eventos, minutoActual);

    res.json({
      ok:      true,
      fixture: fixtureId,
      pulse: {
        local: {
          score:    scores.local,
          momentum: pulseService.describeMomentum(scores.local),
        },
        visitante: {
          score:    scores.visitante,
          momentum: pulseService.describeMomentum(scores.visitante),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { enVivo, pulse };
