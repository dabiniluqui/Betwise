// ============================================================
// middlewares/auth.middleware.js — Clase 4: Autenticación
// Verifica el JWT en el header Authorization antes de que
// el request llegue a rutas protegidas.
// ============================================================

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // El token viene en el header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token de autorización requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Adjuntamos el usuario decodificado al request para usarlo en controllers
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(403).json({
      ok: false,
      mensaje: 'Token inválido o expirado',
    });
  }
}

module.exports = { verificarToken };
