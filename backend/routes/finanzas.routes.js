// ============================================================
// routes/finanzas.routes.js — Módulo Salud Financiera
// /calcular es pública (sin JWT) para la landing.
// El resto requiere autenticación para persistir en Supabase.
// ============================================================

const { Router } = require('express');
const finanzasController = require('../controllers/finanzas.controller');
const { verificarToken }  = require('../middlewares/auth.middleware');
const {
  validarPerfilFinanciero,
  validarEntradaMensual,
} = require('../middlewares/validate.middleware');

const router = Router();

// POST /api/v1/finanzas/calcular — Pública (calculadora sin login)
router.post('/calcular', finanzasController.calcular);

// GET  /api/v1/finanzas/perfil — Requiere JWT
router.get('/perfil', verificarToken, finanzasController.obtenerPerfil);

// POST /api/v1/finanzas/perfil — Requiere JWT
router.post('/perfil', verificarToken, validarPerfilFinanciero, finanzasController.guardarPerfil);

// GET  /api/v1/finanzas/registro/:anio/:mes — Requiere JWT
router.get('/registro/:anio/:mes', verificarToken, finanzasController.obtenerRegistroMensual);

// POST /api/v1/finanzas/registro/entrada — Requiere JWT
router.post('/registro/entrada', verificarToken, validarEntradaMensual, finanzasController.agregarEntrada);

module.exports = router;
