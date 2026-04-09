// ============================================================
// controllers/auth.controller.js — Clase 4 y 10
// Lógica de registro y login. Usa bcrypt para encriptar
// contraseñas y JWT para emitir tokens de sesión.
// ============================================================

const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const supabase = require('../config/supabase');

const SALT_ROUNDS = 10; // Clase 10: encriptación con bcrypt

// ── POST /api/v1/auth/register ───────────────────────────────
async function register(req, res, next) {
  try {
    const { email, password, nombre } = req.body;

    // Verificar si ya existe el usuario
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existente) {
      return res.status(409).json({ ok: false, mensaje: 'El email ya está registrado' });
    }

    // Encriptar contraseña — Clase 10: encriptación simétrica con hash
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Guardar en Supabase — Clase 7: base de datos
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert({ email, password: hashPassword, nombre })
      .select('id, email, nombre, created_at')
      .single();

    if (error) throw error;

    // Emitir JWT — Clase 4: autorización
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      ok: true,
      mensaje: '¡Cuenta creada exitosamente!',
      token,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    });
  } catch (error) {
    next(error);
  }
}

// ── POST /api/v1/auth/login ──────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, email, nombre, password')
      .eq('email', email)
      .single();

    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    // Comparar contraseña con el hash — Clase 10
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    // Emitir nuevo JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      mensaje: 'Sesión iniciada correctamente',
      token,
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre },
    });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/v1/auth/me ──────────────────────────────────────
async function me(req, res, next) {
  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, email, nombre, created_at')
      .eq('id', req.usuario.id)
      .single();

    res.json({ ok: true, usuario });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };
