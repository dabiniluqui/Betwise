// ============================================================
// services/pulse.service.js — Servicio propio de BetWise
// Calcula el "Match Pulse": índice de momentum 0-100 por equipo
// basado en estadísticas reales del partido en vivo.
// ============================================================

/**
 * Extrae un valor numérico de las estadísticas de la API-Football.
 * Las stats vienen como string ("55%", "12") o null.
 */
function extraerNumero(valor) {
  if (!valor) return 0;
  const str = String(valor).replace('%', '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Busca una estadística específica en el array de stats de un equipo.
 */
function obtenerStat(stats, tipo) {
  const stat = stats.find((s) => s.type === tipo);
  return stat ? extraerNumero(stat.value) : 0;
}

/**
 * Calcula el Pulse Score para ambos equipos de un partido.
 *
 * Fórmula:
 *   posesion          × 0.25
 *   remates al arco   × 0.30  (normalizado sobre total del partido)
 *   corners           × 0.15  (normalizado)
 *   pases precisos %  × 0.20
 *   goles recientes   × 0.10  (bonus si metió gol en últimos 15 min)
 *
 * @param {Array}  statsResponse  - data.response de /fixtures/statistics
 * @param {Array}  eventosResponse - data.response de /fixtures/events
 * @param {number} minutoActual   - minuto del partido
 * @returns {{ local: number, visitante: number }}
 */
function calcularPulseScore(statsResponse, eventosResponse, minutoActual) {
  if (!statsResponse || statsResponse.length < 2) {
    return { local: 0, visitante: 0 };
  }

  const statsLocal     = statsResponse[0]?.statistics || [];
  const statsVisitante = statsResponse[1]?.statistics || [];

  // ── Posesión ─────────────────────────────────────────────
  const posesionLocal     = obtenerStat(statsLocal,     'Ball Possession');
  const posesionVisitante = obtenerStat(statsVisitante, 'Ball Possession');

  // ── Remates al arco ──────────────────────────────────────
  const rematesLocal     = obtenerStat(statsLocal,     'Shots on Goal');
  const rematesVisitante = obtenerStat(statsVisitante, 'Shots on Goal');
  const totalRemates     = rematesLocal + rematesVisitante || 1;
  const pctRematesLocal     = (rematesLocal     / totalRemates) * 100;
  const pctRematesVisitante = (rematesVisitante / totalRemates) * 100;

  // ── Córners ──────────────────────────────────────────────
  const cornersLocal     = obtenerStat(statsLocal,     'Corner Kicks');
  const cornersVisitante = obtenerStat(statsVisitante, 'Corner Kicks');
  const totalCorners     = cornersLocal + cornersVisitante || 1;
  const pctCornersLocal     = (cornersLocal     / totalCorners) * 100;
  const pctCornersVisitante = (cornersVisitante / totalCorners) * 100;

  // ── Pases precisos % ─────────────────────────────────────
  const pasesLocal     = obtenerStat(statsLocal,     'Passes %');
  const pasesVisitante = obtenerStat(statsVisitante, 'Passes %');

  // ── Bonus por gol reciente (últimos 15 minutos) ──────────
  const minutoBonusDesde = Math.max(0, minutoActual - 15);
  let bonusLocal = 0, bonusVisitante = 0;

  if (eventosResponse) {
    eventosResponse.forEach((evento) => {
      if (evento.type !== 'Goal') return;
      const minuto = evento.time?.elapsed || 0;
      if (minuto < minutoBonusDesde) return;

      // Determinamos a cuál equipo pertenece el gol
      // statsResponse[0] es siempre el equipo local
      const esLocal = evento.team?.id === statsResponse[0]?.team?.id;
      if (esLocal) bonusLocal     = 100; // full bonus
      else         bonusVisitante = 100;
    });
  }

  // ── Fórmula final ────────────────────────────────────────
  const pulseLocal = Math.round(
    posesionLocal     * 0.25 +
    pctRematesLocal   * 0.30 +
    pctCornersLocal   * 0.15 +
    pasesLocal        * 0.20 +
    bonusLocal        * 0.10
  );

  const pulseVisitante = Math.round(
    posesionVisitante     * 0.25 +
    pctRematesVisitante   * 0.30 +
    pctCornersVisitante   * 0.15 +
    pasesVisitante        * 0.20 +
    bonusVisitante        * 0.10
  );

  return {
    local:     Math.min(100, Math.max(0, pulseLocal)),
    visitante: Math.min(100, Math.max(0, pulseVisitante)),
  };
}

/**
 * Traduce el Pulse Score a un texto descriptivo de momentum.
 */
function describeMomentum(score) {
  if (score >= 75) return 'Dominante 🔥';
  if (score >= 55) return 'Superior ⬆️';
  if (score >= 45) return 'Equilibrado ↔️';
  if (score >= 30) return 'Bajo presión ⬇️';
  return 'Defensivo 🛡️';
}

module.exports = { calcularPulseScore, describeMomentum };
