// ============================================================
// middlewares/error.middleware.js — Clase 2: HTTP
// Manejo centralizado de errores. Cualquier error que llegue
// aquí se responde con el status HTTP correcto y un JSON limpio.
// ============================================================

function errorMiddleware(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const status  = err.status  || 500;
  const mensaje = err.message || 'Error interno del servidor';

  res.status(status).json({
    ok:     false,
    status,
    mensaje,
    // Solo mostrar el stack en desarrollo
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorMiddleware;
