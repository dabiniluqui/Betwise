// ============================================================
// services/finanzas.service.js — Módulo Salud Financiera
// Toda la lógica de cálculo financiero centralizada aquí.
// Los controllers solo llaman a estas funciones.
// ============================================================

// Porcentajes de ahorro según el nivel elegido
const NIVELES_AHORRO = {
  bajo_5:          0.05,
  moderado_10:     0.10,
  recomendado_20:  0.20,
  alto_30:         0.30,
  agresivo_50:     0.50,
};

/**
 * Calcula el resumen financiero completo y el límite de apuestas.
 *
 * @param {object} datos - Campos del perfil financiero
 * @returns {object}     - Resultado con todos los valores calculados
 */
function calcularSaludFinanciera(datos) {
  const {
    sueldo_neto           = 0,
    gasto_alquiler        = 0,
    gasto_servicios       = 0,
    gasto_transporte      = 0,
    gasto_cuotas          = 0,
    gasto_alimentacion    = 0,
    gasto_entretenimiento = 0,
    gasto_otros           = 0,
    nivel_ahorro          = 'recomendado_20',
  } = datos;

  // Convertir todo a Number por seguridad
  const sueldo       = Number(sueldo_neto);
  const fijos        = Number(gasto_alquiler) + Number(gasto_servicios)
                     + Number(gasto_transporte) + Number(gasto_cuotas);
  const variables    = Number(gasto_alimentacion) + Number(gasto_entretenimiento)
                     + Number(gasto_otros);

  const pctAhorro    = NIVELES_AHORRO[nivel_ahorro] ?? 0.20;
  const montoAhorro  = sueldo * pctAhorro;

  const disponible   = sueldo - fijos - variables - montoAhorro;
  const limiteApuestas = Math.max(0, disponible * 0.05); // 5% del disponible

  // Índice de salud: qué % del sueldo queda libre después de todo
  const indice = sueldo > 0
    ? Math.round((Math.max(0, disponible) / sueldo) * 100)
    : 0;

  // Clasificación del índice
  let estadoSalud;
  if (indice >= 30)      estadoSalud = 'Excelente';
  else if (indice >= 20) estadoSalud = 'Bueno';
  else if (indice >= 10) estadoSalud = 'Regular';
  else                   estadoSalud = 'Crítico';

  return {
    sueldo_neto:       sueldo,
    gastos_fijos:      fijos,
    gastos_variables:  variables,
    ahorro_meta:       montoAhorro,
    disponible:        disponible,
    limite_apuestas:   limiteApuestas,
    indice_salud:      indice,
    estado_salud:      estadoSalud,
    nivel_ahorro_pct:  pctAhorro * 100,
  };
}

/**
 * Calcula el progreso del mes actual comparando lo registrado vs el límite.
 *
 * @param {number} limiteCalculado
 * @param {number} totalRegistrado
 * @param {Array}  entradas
 * @returns {object}
 */
function calcularProgresoMensual(limiteCalculado, totalRegistrado, entradas = []) {
  const porcentajeUsado = limiteCalculado > 0
    ? Math.round((totalRegistrado / limiteCalculado) * 100)
    : 0;

  const restante = Math.max(0, limiteCalculado - totalRegistrado);

  let alerta;
  if (porcentajeUsado >= 100)    alerta = 'limite_superado';
  else if (porcentajeUsado >= 80) alerta = 'limite_proximo';
  else if (porcentajeUsado >= 50) alerta = 'mitad_alcanzada';
  else                            alerta = 'dentro_del_limite';

  return {
    limite_calculado: limiteCalculado,
    total_registrado: totalRegistrado,
    restante,
    porcentaje_usado: Math.min(100, porcentajeUsado),
    alerta,
    cantidad_entradas: entradas.length,
  };
}

module.exports = { calcularSaludFinanciera, calcularProgresoMensual, NIVELES_AHORRO };
