// ============================================================
// config/supabase.js — Clase 7: Base de datos
// Inicializa y exporta el cliente de Supabase (PostgreSQL).
// Se usa desde controllers y services para todas las queries.
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
