// ============================================================
// routes/scraping.routes.js — Clase 9: Web Scraping
// Ruta pública: las noticias se muestran sin necesidad de login.
// ============================================================

const { Router } = require('express');
const scrapingController = require('../controllers/scraping.controller');

const router = Router();

// GET /api/v1/scraping/noticias?limite=10
router.get('/noticias', scrapingController.obtenerNoticias);

module.exports = router;
