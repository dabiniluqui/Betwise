// ============================================================
// controllers/favoritos.controller.js — Clase 7: Base de datos
// CRUD completo de partidos favoritos del usuario en Supabase.
// ============================================================

const supabase = require('../config/supabase');

// ── GET /api/v1/favoritos ────────────────────────────────────
async function obtener(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('favoritos')
      .select('*')
      .eq('usuario_id', req.usuario.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ ok: true, total: data.length, favoritos: data });
  } catch (error) {
    next(error);
  }
}

// ── POST /api/v1/favoritos ───────────────────────────────────
async function agregar(req, res, next) {
  try {
    const { fixture_id, equipo_local, equipo_visitante, liga } = req.body;

    if (!fixture_id || !equipo_local || !equipo_visitante || !liga) {
      return res.status(400).json({
        ok: false,
        mensaje: 'fixture_id, equipo_local, equipo_visitante y liga son requeridos',
      });
    }

    const { data, error } = await supabase
      .from('favoritos')
      .insert({
        usuario_id:       req.usuario.id,
        fixture_id:       Number(fixture_id),
        equipo_local,
        equipo_visitante,
        liga,
      })
      .select()
      .single();

    if (error) {
      // Error de duplicado (UNIQUE constraint)
      if (error.code === '23505') {
        return res.status(409).json({ ok: false, mensaje: 'Este partido ya está en tus favoritos' });
      }
      throw error;
    }

    res.status(201).json({ ok: true, mensaje: 'Partido agregado a favoritos', favorito: data });
  } catch (error) {
    next(error);
  }
}

// ── DELETE /api/v1/favoritos/:id ─────────────────────────────
async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    // Verificar que el favorito pertenece al usuario antes de borrar
    const { data: existente } = await supabase
      .from('favoritos')
      .select('id')
      .eq('id', id)
      .eq('usuario_id', req.usuario.id)
      .single();

    if (!existente) {
      return res.status(404).json({ ok: false, mensaje: 'Favorito no encontrado' });
    }

    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ ok: true, mensaje: 'Favorito eliminado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { obtener, agregar, eliminar };
