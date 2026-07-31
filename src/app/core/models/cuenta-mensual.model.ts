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
