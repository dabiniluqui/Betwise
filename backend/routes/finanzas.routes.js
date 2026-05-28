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
  validarResultadoEntrada,
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

// DELETE /api/v1/finanzas/registro/entrada/:indice — Requiere JWT
router.delete('/registro/entrada/:indice', verificarToken, finanzasController.eliminarEntrada);

// PUT /api/v1/finanzas/registro/entrada/:indice — Requiere JWT
router.put('/registro/entrada/:indice', verificarToken, validarEntradaMensual, finanzasController.editarEntrada);

// GET /api/v1/finanzas/historial — Requiere JWT
router.get('/historial', verificarToken, finanzasController.obtenerHistorial);

// PATCH /api/v1/finanzas/registro/:registroId/entrada/:indice/resultado — Requiere JWT
router.patch('/registro/:registroId/entrada/:indice/resultado', verificarToken, validarResultadoEntrada, finanzasController.actualizarResultadoEntrada);

module.exports = router;
