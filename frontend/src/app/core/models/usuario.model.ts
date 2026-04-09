// ============================================================
// core/models/usuario.model.ts
// ============================================================

export interface Usuario {
  id:     string;
  email:  string;
  nombre: string;
}

export interface PerfilFinanciero {
  sueldo_neto:           number;
  gasto_alquiler:        number;
  gasto_servicios:       number;
  gasto_transporte:      number;
  gasto_cuotas:          number;
  gasto_alimentacion:    number;
  gasto_entretenimiento: number;
  gasto_otros:           number;
  nivel_ahorro:          string;
}

export interface ResultadoFinanciero {
  sueldo_neto:       number;
  gastos_fijos:      number;
  gastos_variables:  number;
  ahorro_meta:       number;
  disponible:        number;
  limite_apuestas:   number;
  indice_salud:      number;
  estado_salud:      'Excelente' | 'Bueno' | 'Regular' | 'Crítico';
  nivel_ahorro_pct:  number;
}

export interface EntradaMensual {
  monto:       number;
  descripcion: string;
  fecha:       string;
}

export interface RegistroMensual {
  id:               string;
  mes:              number;
  anio:             number;
  limite_calculado: number;
  total_registrado: number;
  entradas:         EntradaMensual[];
}

export interface ProgresoMensual {
  limite_calculado:  number;
  total_registrado:  number;
  restante:          number;
  porcentaje_usado:  number;
  alerta:            'dentro_del_limite' | 'mitad_alcanzada' | 'limite_proximo' | 'limite_superado';
  cantidad_entradas: number;
}
