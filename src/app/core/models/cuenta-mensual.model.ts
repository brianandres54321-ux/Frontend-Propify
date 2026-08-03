export enum EstadoCuenta {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  VENCIDA = 'VENCIDA',
}

export enum TipoCargo {
  ARRIENDO = 'ARRIENDO',
  CUOTA_ADMINISTRACION = 'CUOTA_ADMINISTRACION',
  RESERVA_ZONA = 'RESERVA_ZONA',
  MULTA = 'MULTA',
  OTRO = 'OTRO',
}

export interface CargoDetalle {
  codCargo: number;
  codCuenta: number;
  concepto: string;
  monto: number;
  tipo: TipoCargo;
  creadoEn: string;
}

// Periodo con formato YYYY-MM
export interface CuentaMensual {
  codCuenta: number;
  codResidente: number;
  periodo: string;
  fechaVencimiento: string;
  total: number;
  estado: EstadoCuenta;
  creadoEn: string;
  cargos?: CargoDetalle[];
}

// Vista aplanada que devuelve GET /privado/cobranza/cuentas — ya viene con
// el residente/unidad/inmueble unidos, para no tener que resolverlos aparte
// en el listado de Cobranza.
export interface CuentaResumen {
  codCuenta: number;
  periodo: string;
  fechaVencimiento: string;
  total: number;
  totalPagado: number;
  estado: EstadoCuenta;
  codResidente: number;
  nombreResidente: string;
  identificadorUnidad: string;
  codInmueble: number;
  nombreInmueble: string;
}

export interface ConsultarCuentasFiltros {
  estado?: EstadoCuenta;
  inmuebleId?: number;
}
