export interface Gasto {
  codGasto: number;
  codInmueble: number;
  concepto: string;
  monto: number;
  fecha: string;
  categoria?: string;
}

export interface CrearGastoRequest {
  codInmueble: number;
  concepto: string;
  monto: number;
  fecha?: string;
  categoria?: string;
}

export interface ActualizarGastoRequest {
  concepto?: string;
  monto?: number;
  fecha?: string;
  categoria?: string;
}

// "Caja Fuerte" del dashboard — ver GET /privado/gastos/resumen.
export interface ResumenGastosMes {
  totalMes: number;
}
