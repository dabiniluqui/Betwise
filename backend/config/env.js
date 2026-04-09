// ============================================================
// config/env.js — Clase 3: Estructura Node.js
// Valida que todas las variables de entorno necesarias existan
// antes de que el servidor arranque. Falla rápido y claro.
// ============================================================

const VARS_REQUERIDAS = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'JWT_SECRET',
  'API_FOOTBALL_KEY',
];

function validarEnv() {
  const faltantes = VARS_REQUERIDAS.filter((v) => !process.env[v]);

  if (faltantes.length > 0) {
    console.error('❌ Faltan variables de entorno:');
    faltantes.forEach((v) => console.error(`   → ${v}`));
    console.error('Copiá .env.example a .env y completalo.');
    process.exit(1);
  }

  console.log('✅ Variables de entorno validadas correctamente');
}

module.exports = { validarEnv };
