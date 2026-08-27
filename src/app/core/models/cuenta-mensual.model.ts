import { TipoNotificacion } from './notificacion.model';

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

// "Caja Fuerte" del dashboard — ver GET /privado/cobranza/resumen.
export interface ResumenFinanciero {
  ingresosMes: number;
  carteraVencida: number;
  cuentasVencidas: number;
  cuentasVencidasCriticas: number;
  cuentasPendientes: number;
}

export type TipoNotificacionAccionable = TipoNotificacion.RECORDATORIO_PAGO | TipoNotificacion.MORA;

// Recordatorios/avisos de mora identificados por el motor de cobranza que
// todavía no se han enviado por WhatsApp (requiere un clic del dueño — ver
// GET /privado/cobranza/pendientes-notificacion).
export interface PendienteNotificacion {
  codCuenta: number;
  tipo: TipoNotificacionAccionable;
  nombreResidente: string;
  telefono: string;
  periodo: string;
  total: number;
  fechaVencimiento: string;
}
