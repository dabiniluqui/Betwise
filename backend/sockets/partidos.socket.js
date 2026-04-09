// ============================================================
// sockets/partidos.socket.js — Clase 8: WebSockets + PubSub
// Emite partidos en vivo y Pulse Scores a todos los clientes
// conectados cada 60 segundos sin que el usuario recargue.
// ============================================================

const footballService    = require('../services/football.service');
const { transformarPartido } = footballService;
const pulseService       = require('../services/pulse.service');

const INTERVALO_MS = 60 * 1000; // 60 segundos

function iniciarSocketPartidos(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Emitir datos inmediatamente al conectarse
    emitirPartidos(socket);

    // El cliente puede suscribirse a un partido específico para su Pulse
    socket.on('suscribir:partido', async (fixtureId) => {
      const sala = `partido:${fixtureId}`;
      socket.join(sala);
      console.log(`📺 ${socket.id} se suscribió a ${sala}`);
      await emitirPulsePartido(io, fixtureId);
    });

    socket.on('desuscribir:partido', (fixtureId) => {
      socket.leave(`partido:${fixtureId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });

  // Polling global cada 60 segundos — emite a TODOS los clientes
  setInterval(async () => {
    await emitirPartidosGlobal(io);
  }, INTERVALO_MS);

  console.log('✅ Socket de partidos inicializado');
}

// ── Emite lista completa de partidos en vivo a un socket ─────
async function emitirPartidos(socket) {
  try {
    const raw      = await footballService.obtenerPartidosEnVivo();
    const partidos = raw.map(transformarPartido);
    socket.emit('partidos:actualizacion', {
      timestamp: new Date().toISOString(),
      total:     partidos.length,
      partidos,
    });
  } catch (error) {
    socket.emit('partidos:error', { mensaje: 'No se pudieron cargar los partidos' });
  }
}

// ── Emite a TODOS los clientes conectados (broadcast) ────────
async function emitirPartidosGlobal(io) {
  try {
    const raw      = await footballService.obtenerPartidosEnVivo();
    const partidos = raw.map(transformarPartido);
    io.emit('partidos:actualizacion', {
      timestamp: new Date().toISOString(),
      total:     partidos.length,
      partidos,
    });
  } catch (error) {
    console.error('[SOCKET] Error al emitir partidos:', error.message);
  }
}

// ── Emite Pulse Score solo a la sala de ese partido ──────────
async function emitirPulsePartido(io, fixtureId) {
  try {
    const [stats, eventos, partidos] = await Promise.all([
      footballService.obtenerEstadisticasPartido(fixtureId),
      footballService.obtenerEventosPartido(fixtureId),
      footballService.obtenerPartidosEnVivo(),
    ]);

    const partido      = partidos.find((p) => p.fixture.id === Number(fixtureId));
    const minutoActual = partido?.fixture?.status?.elapsed || 0;
    const scores       = pulseService.calcularPulseScore(stats, eventos, minutoActual);

    io.to(`partido:${fixtureId}`).emit('pulse:actualizacion', {
      fixtureId,
      timestamp: new Date().toISOString(),
      pulse: {
        local:     { score: scores.local,     momentum: pulseService.describeMomentum(scores.local) },
        visitante: { score: scores.visitante, momentum: pulseService.describeMomentum(scores.visitante) },
      },
    });
  } catch (error) {
    console.error(`[SOCKET] Error al emitir pulse de ${fixtureId}:`, error.message);
  }
}

module.exports = { iniciarSocketPartidos };
