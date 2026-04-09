// ============================================================
// routes/partidos.routes.js — Clase 2: HTTP
// Endpoints de partidos en vivo y Pulse Score.
// Rutas públicas: no requieren JWT.
// ============================================================

const { Router } = require('express');
const partidosController = require('../controllers/partidos.controller');

const router = Router();

// GET /api/v1/partidos/en-vivo
router.get('/en-vivo', partidosController.enVivo);

// GET /api/v1/partidos/:id/pulse
router.get('/:id/pulse', partidosController.pulse);

module.exports = router;
