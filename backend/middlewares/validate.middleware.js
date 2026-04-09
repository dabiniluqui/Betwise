// ============================================================
// middlewares/validate.middleware.js — Clase 2: HTTP
// Funciones de validación de body. Se usan directamente
// en las rutas antes de llegar al controller.
// ============================================================

function validarRegistro(req, res, next) {
  const { email, password, nombre } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Email y contraseña son requeridos',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, mensaje: 'Email inválido' });
  }

  if (password.length < 6) {
    return res.status(400).json({
      ok: false,
      mensaje: 'La contraseña debe tener al menos 6 caracteres',
    });
  }

  next();
}

function validarLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Email y contraseña son requeridos',
    });
  }

  next();
}

function validarPerfilFinanciero(req, res, next) {
  const { sueldo_neto } = req.body;

  if (sueldo_neto === undefined || isNaN(sueldo_neto) || Number(sueldo_neto) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'El sueldo neto es requerido y debe ser un número positivo',
    });
  }

  next();
}

function validarEntradaMensual(req, res, next) {
  const { monto, descripcion } = req.body;

  if (!monto || isNaN(monto) || Number(monto) <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'El monto debe ser un número positivo',
    });
  }

  if (!descripcion || descripcion.trim().length === 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'La descripción es requerida',
    });
  }

  next();
}

module.exports = {
  validarRegistro,
  validarLogin,
  validarPerfilFinanciero,
  validarEntradaMensual,
};
