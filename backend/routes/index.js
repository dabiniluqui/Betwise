// ============================================================
// routes/index.js — Clase 2: HTTP / Clase 3: Express
// Router raíz que agrupa todas las rutas bajo /api/v1.
// Cada módulo tiene su propio archivo de rutas.
// ============================================================

const { Router } = require('express');

const authRoutes     = require('./auth.routes');
const partidosRoutes = require('./partidos.routes');
const finanzasRoutes = require('./finanzas.routes');
const favoritosRoutes = require('./favoritos.routes');
const scrapingRoutes = require('./scraping.routes');
const chatbotRoutes  = require('./chatbot.routes');

const router = Router();

router.use('/auth',     authRoutes);
router.use('/partidos', partidosRoutes);
router.use('/finanzas', finanzasRoutes);
router.use('/favoritos', favoritosRoutes);
router.use('/scraping', scrapingRoutes);
router.use('/chatbot',  chatbotRoutes);

module.exports = router;
