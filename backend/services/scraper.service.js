// ============================================================
// services/scraper.service.js — Clase 9: Web Scraping
// Scrapea noticias de fútbol de TyC Sports usando Cheerio.
// Se cachea el resultado 10 minutos para no sobrecargar el sitio.
// ============================================================

const axios   = require('axios');
const cheerio = require('cheerio');

const URL_TYC   = 'https://www.tycsports.com/futbol';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

let cacheNoticias = { data: null, expira: 0 };

async function obtenerNoticias(limite = 10) {
  // Usar cache si es válida
  if (cacheNoticias.data && Date.now() < cacheNoticias.expira) {
    return cacheNoticias.data.slice(0, limite);
  }

  try {
    const { data: html } = await axios.get(URL_TYC, {
      headers: {
        // Headers para simular un navegador real
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'es-AR,es;q=0.9',
      },
      timeout: 8000,
    });

    const $        = cheerio.load(html);
    const noticias = [];

    // Selectores de TyC Sports (ajustar si cambia el HTML del sitio)
    $('article, .card-note, .news-item').each((_i, el) => {
      const titulo = $(el).find('h2, h3, .title').first().text().trim();
      const href   = $(el).find('a').first().attr('href');
      const imagen = $(el).find('img').first().attr('src')
                  || $(el).find('img').first().attr('data-src');
      const fecha  = $(el).find('time, .date').first().text().trim();

      if (!titulo || !href) return; // saltar elementos vacíos

      noticias.push({
        titulo,
        url:    href.startsWith('http') ? href : `https://www.tycsports.com${href}`,
        imagen: imagen || null,
        fecha:  fecha  || null,
        fuente: 'TyC Sports',
      });
    });

    // Guardar en cache
    cacheNoticias = { data: noticias, expira: Date.now() + CACHE_TTL };

    return noticias.slice(0, limite);
  } catch (error) {
    console.error('[SCRAPER] Error al scrapear TyC Sports:', error.message);

    // Si falla, devolver noticias de ejemplo para no romper el front
    return [
      {
        titulo: 'No se pudieron cargar las noticias en este momento',
        url:    'https://www.tycsports.com',
        imagen: null,
        fecha:  new Date().toLocaleDateString('es-AR'),
        fuente: 'TyC Sports',
      },
    ];
  }
}

module.exports = { obtenerNoticias };
