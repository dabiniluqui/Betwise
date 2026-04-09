// ============================================================
// routes/auth.routes.js — Clase 4: Autenticación
// Define los endpoints de autenticación.
// ============================================================

const { Router } = require('express');
const authController  = require('../controllers/auth.controller');
const { validarRegistro, validarLogin } = require('../middlewares/validate.middleware');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

// POST /api/v1/auth/register
router.post('/register', validarRegistro, authController.register);

// POST /api/v1/auth/login
router.post('/login', validarLogin, authController.login);

// GET  /api/v1/auth/me  — Ruta protegida: requiere JWT
router.get('/me', verificarToken, authController.me);

module.exports = router;
