// ============================================================
// controllers/finanzas.controller.js — Módulo Salud Financiera
// Gestiona el perfil financiero del usuario y el registro
// mensual de gastos. Toda la lógica de cálculo está en el service.
// ============================================================

const supabase        = require('../config/supabase');
const finanzasService = require('../services/finanzas.service');

// ── POST /api/v1/finanzas/calcular (pública, sin JWT) ────────
// Permite usar la calculadora sin estar logueado
async function calcular(req, res, next) {
  try {
    const resultado = finanzasService.calcularSaludFinanciera(req.body);
    res.json({ ok: true, resultado });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/v1/finanzas/perfil ──────────────────────────────
async function obtenerPerfil(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('perfil_financiero')
      .select('*')
      .eq('usuario_id', req.usuario.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    res.json({ ok: true, perfil: data || null });
  } catch (error) {
    next(error);
  }
}

// ── POST /api/v1/finanzas/perfil ─────────────────────────────
// Upsert: crea si no existe, actualiza si existe
async function guardarPerfil(req, res, next) {
  try {
    const perfilData = {
      usuario_id:            req.usuario.id,
      sueldo_neto:           Number(req.body.sueldo_neto)           || 0,
      gasto_alquiler:        Number(req.body.gasto_alquiler)        || 0,
      gasto_servicios:       Number(req.body.gasto_servicios)       || 0,
      gasto_transporte:      Number(req.body.gasto_transporte)      || 0,
      gasto_cuotas:          Number(req.body.gasto_cuotas)          || 0,
      gasto_alimentacion:    Number(req.body.gasto_alimentacion)    || 0,
      gasto_entretenimiento: Number(req.body.gasto_entretenimiento) || 0,
      gasto_otros:           Number(req.body.gasto_otros)           || 0,
      nivel_ahorro:          req.body.nivel_ahorro || 'recomendado_20',
      updated_at:            new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('perfil_financiero')
      .upsert(perfilData, { onConflict: 'usuario_id' })
      .select()
      .single();

    if (error) throw error;

    // Calcular y devolver resultados actualizados
    const resultado = finanzasService.calcularSaludFinanciera(data);

    res.json({ ok: true, mensaje: 'Perfil guardado', perfil: data, resultado });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/v1/finanzas/registro/:anio/:mes ─────────────────
async function obtenerRegistroMensual(req, res, next) {
  try {
    const { anio, mes } = req.params;

    const { data, error } = await supabase
      .from('registro_mensual')
      .select('*')
      .eq('usuario_id', req.usuario.id)
      .eq('anio', Number(anio))
      .eq('mes', Number(mes))
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    let progreso = null;
    if (data) {
      progreso = finanzasService.calcularProgresoMensual(
        data.limite_calculado,
        data.total_registrado,
        data.entradas
      );
    }

    res.json({ ok: true, registro: data || null, progreso });
  } catch (error) {
    next(error);
  }
}

// ── POST /api/v1/finanzas/registro/entrada ───────────────────
// Agrega una entrada de gasto al registro del mes actual
async function agregarEntrada(req, res, next) {
  try {
    const { monto, descripcion } = req.body;
    const ahora = new Date();
    const mes   = ahora.getMonth() + 1;
    const anio  = ahora.getFullYear();

    // Obtener perfil para saber el límite calculado
    const { data: perfil } = await supabase
      .from('perfil_financiero')
      .select('*')
      .eq('usuario_id', req.usuario.id)
      .single();

    const limite = perfil
      ? finanzasService.calcularSaludFinanciera(perfil).limite_apuestas
      : 0;

    // Buscar registro existente del mes
    const { data: registroExistente } = await supabase
      .from('registro_mensual')
      .select('*')
      .eq('usuario_id', req.usuario.id)
      .eq('mes', mes)
      .eq('anio', anio)
      .single();

    const nuevaEntrada = {
      monto:       Number(monto),
      descripcion: descripcion.trim(),
      fecha:       ahora.toISOString(),
    };

    let registroActualizado;

    if (registroExistente) {
      // Actualizar registro existente
      const entradasActualizadas = [...(registroExistente.entradas || []), nuevaEntrada];
      const nuevoTotal = registroExistente.total_registrado + Number(monto);

      const { data, error } = await supabase
        .from('registro_mensual')
        .update({
          entradas:        entradasActualizadas,
          total_registrado: nuevoTotal,
        })
        .eq('id', registroExistente.id)
        .select()
        .single();

      if (error) throw error;
      registroActualizado = data;
    } else {
      // Crear nuevo registro para este mes
      const { data, error } = await supabase
        .from('registro_mensual')
        .insert({
          usuario_id:       req.usuario.id,
          mes,
          anio,
          limite_calculado: limite,
          total_registrado: Number(monto),
          entradas:         [nuevaEntrada],
        })
        .select()
        .single();

      if (error) throw error;
      registroActualizado = data;
    }

    const progreso = finanzasService.calcularProgresoMensual(
      registroActualizado.limite_calculado,
      registroActualizado.total_registrado,
      registroActualizado.entradas
    );

    res.status(201).json({
      ok:       true,
      mensaje:  'Gasto registrado',
      registro: registroActualizado,
      progreso,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { calcular, obtenerPerfil, guardarPerfil, obtenerRegistroMensual, agregarEntrada };
