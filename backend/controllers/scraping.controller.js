// ============================================================
// controllers/scraping.controller.js — Clase 9: Web Scraping
// Devuelve noticias de fútbol scrapeadas de TyC Sports.
// ============================================================

const scraperService = require('../services/scraper.service');

// ── GET /api/v1/scraping/noticias ────────────────────────────
async function obtenerNoticias(req, res, next) {
  try {
    // Permitir limitar cuántas noticias devolver via query param
    const limite = Math.min(Number(req.query.limite) || 10, 30);

    const noticias = await scraperService.obtenerNoticias(limite);

    res.json({ ok: true, total: noticias.length, noticias });
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerNoticias };
