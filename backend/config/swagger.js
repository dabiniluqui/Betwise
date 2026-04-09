// ============================================================
// config/swagger.js — Clase 11: Documentación con Swagger
// Exporta la configuración de opciones para swagger-ui-express
// ============================================================

const opciones = {
  customSiteTitle: 'BetWise API Docs',
  customCss: `
    .swagger-ui .topbar { background-color: #0a0c10; }
    .swagger-ui .topbar-wrapper img { content: none; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
  },
};

module.exports = opciones;
