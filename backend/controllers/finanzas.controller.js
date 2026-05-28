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

    // Sincronizar limite_calculado del mes actual si ya existe un registro
    const ahora      = new Date();
    const mesActual  = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear();
    await supabase
      .from('registro_mensual')
      .update({ limite_calculado: resultado.limite_apuestas })
      .eq('usuario_id', req.usuario.id)
      .eq('mes', mesActual)
      .eq('anio', anioActual);

    res.json({ ok: true, mensaje: 'Perfil guardado', perfil: data, resultado });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/v1/finanzas/registro/:anio/:mes ─────────────────
async function obtenerRegistroMensual(req, res, next) {
  try {
    const { anio, mes } = req.params;

    const [{ data: perfil }, { data, error }] = await Promise.all([
      supabase.from('perfil_financiero').select('*').eq('usuario_id', req.usuario.id).single(),
      supabase.from('registro_mensual').select('*')
        .eq('usuario_id', req.usuario.id)
        .eq('anio', Number(anio))
        .eq('mes', Number(mes))
        .single(),
    ]);

    if (error && error.code !== 'PGRST116') throw error;

    const limiteActual = perfil
      ? finanzasService.calcularSaludFinanciera(perfil).limite_apuestas
      : null;

    let registroFinal = data || null;

    if (registroFinal && limiteActual !== null && registroFinal.limite_calculado !== limiteActual) {
      const { data: updated } = await supabase
        .from('registro_mensual')
        .update({ limite_calculado: limiteActual })
        .eq('id', registroFinal.id)
        .select()
        .single();
      if (updated) registroFinal = updated;
    }

    let progreso = null;
    if (registroFinal) {
      progreso = finanzasService.calcularProgresoMensual(
        registroFinal.limite_calculado,
        registroFinal.total_registrado,
        registroFinal.entradas
      );
    }

    res.json({ ok: true, registro: registroFinal, progreso });
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

// ── DELETE /api/v1/finanzas/registro/entrada/:indice ─────────
async function eliminarEntrada(req, res, next) {
  try {
    const indice = Number(req.params.indice);
    const ahora  = new Date();
    const mes    = ahora.getMonth() + 1;
    const anio   = ahora.getFullYear();

    const { data: registro, error: errBuscar } = await supabase
      .from('registro_mensual')
      .select('*')
      .eq('usuario_id', req.usuario.id)
      .eq('mes', mes)
      .eq('anio', anio)
      .single();

    if (errBuscar || !registro) {
      return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado' });
    }

    const entradas = registro.entradas || [];
    if (indice < 0 || indice >= entradas.length) {
      return res.status(400).json({ ok: false, mensaje: 'Índice inválido' });
    }

    const nuevasEntradas  = entradas.filter((_, i) => i !== indice);
    const nuevoTotal      = nuevasEntradas.reduce((sum, e) => sum + Number(e.monto), 0);

    const { data, error } = await supabase
      .from('registro_mensual')
      .update({ entradas: nuevasEntradas, total_registrado: nuevoTotal })
      .eq('id', registro.id)
      .select()
      .single();

    if (error) throw error;

    const progreso = finanzasService.calcularProgresoMensual(
      data.limite_calculado, data.total_registrado, data.entradas
    );

    res.json({ ok: true, mensaje: 'Entrada eliminada', registro: data, progreso });
  } catch (error) {
    next(error);
  }
}

// ── PUT /api/v1/finanzas/registro/entrada/:indice ────────────
async function editarEntrada(req, res, next) {
  try {
    const indice      = Number(req.params.indice);
    const { monto, descripcion } = req.body;
    const ahora  = new Date();
    const mes    = ahora.getMonth() + 1;
    const anio   = ahora.getFullYear();

    const { data: registro, error: errBuscar } = await supabase
      .from('registro_mensual')
      .select('*')
      .eq('usuario_id', req.usuario.id)
      .eq('mes', mes)
      .eq('anio', anio)
      .single();

    if (errBuscar || !registro) {
      return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado' });
    }

    const entradas = registro.entradas || [];
    if (indice < 0 || indice >= entradas.length) {
      return res.status(400).json({ ok: false, mensaje: 'Índice inválido' });
    }

    entradas[indice] = {
      ...entradas[indice],
      monto:       Number(monto),
      descripcion: descripcion.trim(),
    };

    const nuevoTotal = entradas.reduce((sum, e) => sum + Number(e.monto), 0);

    const { data, error } = await supabase
      .from('registro_mensual')
      .update({ entradas, total_registrado: nuevoTotal })
      .eq('id', registro.id)
      .select()
      .single();

    if (error) throw error;

    const progreso = finanzasService.calcularProgresoMensual(
      data.limite_calculado, data.total_registrado, data.entradas
    );

    res.json({ ok: true, mensaje: 'Entrada actualizada', registro: data, progreso });
  } catch (error) {
    next(error);
  }
}

// ── GET /api/v1/finanzas/historial ───────────────────────────
async function obtenerHistorial(req, res, next) {
  try {
    const ahora     = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear();

    const { data, error } = await supabase
      .from('registro_mensual')
      .select('id, mes, anio, limite_calculado, total_registrado, entradas')
      .eq('usuario_id', req.usuario.id)
      .order('anio', { ascending: false })
      .order('mes',  { ascending: false });

    if (error) throw error;

    // Excluir el mes actual (ya se muestra en el registro activo)
    const historial = (data || []).filter(
      r => !(r.mes === mesActual && r.anio === anioActual)
    );

    res.json({ ok: true, registros: historial });
  } catch (error) {
    next(error);
  }
}

// ── PATCH /api/v1/finanzas/registro/:registroId/entrada/:indice/resultado ──
async function actualizarResultadoEntrada(req, res, next) {
  try {
    const { registroId, indice } = req.params;
    const { resultado, ganancia_neta } = req.body;

    const { data: registro, error: errBuscar } = await supabase
      .from('registro_mensual')
      .select('*')
      .eq('id', registroId)
      .eq('usuario_id', req.usuario.id)
      .single();

    if (errBuscar || !registro) {
      return res.status(404).json({ ok: false, mensaje: 'Registro no encontrado' });
    }

    const entradas = registro.entradas || [];
    const idx = Number(indice);
    if (idx < 0 || idx >= entradas.length) {
      return res.status(400).json({ ok: false, mensaje: 'Índice inválido' });
    }

    entradas[idx] = {
      ...entradas[idx],
      resultado,
      ganancia_neta: Number(ganancia_neta),
    };

    const { data, error } = await supabase
      .from('registro_mensual')
      .update({ entradas })
      .eq('id', registroId)
      .select()
      .single();

    if (error) throw error;

    res.json({ ok: true, mensaje: 'Resultado actualizado', registro: data });
  } catch (error) {
    next(error);
  }
}

module.exports = { calcular, obtenerPerfil, guardarPerfil, obtenerRegistroMensual, agregarEntrada, eliminarEntrada, editarEntrada, obtenerHistorial, actualizarResultadoEntrada };
