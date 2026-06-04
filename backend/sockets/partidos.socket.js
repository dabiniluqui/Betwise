// ============================================================
// sockets/partidos.socket.js — Clase 8: WebSockets + PubSub
// Emite partidos en vivo a todos los clientes conectados
// cada 60 segundos sin que el usuario recargue.
// ============================================================

const footballService    = require('../services/football.service');
const { transformarPartido } = footballService;

const INTERVALO_MS = 60 * 1000; // 60 segundos

function iniciarSocketPartidos(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Emitir datos inmediatamente al conectarse
    emitirPartidos(socket);

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

module.exports = { iniciarSocketPartidos };
