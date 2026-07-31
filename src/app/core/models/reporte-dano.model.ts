export enum EstadoReporte {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
}

export interface ReporteDano {
  codReporte: number;
  codUnidad: number;
  codResidente: number;
  descripcion: string;
  fotoUrl?: string;
  estado: EstadoReporte;
  creadoEn: string;
}

export interface CrearReporteDanoRequest {
  // Requerido cuando lo crea DUENO/ADMIN a nombre de un residente.
  codResidente?: number;
  descripcion: string;
  fotoUrl?: string;
}

export interface ActualizarReporteDanoRequest {
  estado: EstadoReporte;
}
