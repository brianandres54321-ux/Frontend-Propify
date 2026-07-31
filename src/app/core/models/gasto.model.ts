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
