export interface Visita {
  codVisita: number;
  codUnidad: number;
  nombreVisitante: string;
  cedulaVisitante?: string;
  horaEntrada: string;
  horaSalida?: string;
  registradoPorId: number;
}

export interface CrearVisitaRequest {
  codUnidad: number;
  nombreVisitante: string;
  cedulaVisitante?: string;
}

export interface Paquete {
  codPaquete: number;
  codUnidad: number;
  descripcion?: string;
  horaLlegada: string;
  horaRetiro?: string;
  registradoPorId: number;
  notificado: boolean;
}

export interface CrearPaqueteRequest {
  codUnidad: number;
  descripcion?: string;
}

export interface AutorizacionPrevia {
  codAutorizacion: number;
  codUnidad: number;
  codResidente: number;
  nombreEsperado: string;
  notas?: string;
  ventanaInicio: string;
  ventanaFin: string;
  creadoEn: string;
}

export interface CrearAutorizacionPreviaRequest {
  nombreEsperado: string;
  notas?: string;
  ventanaInicio: string;
  ventanaFin: string;
}

// Dashboard de CELADOR/DUEÑO/ADMIN — ver GET /privado/porteria/resumen.
export interface ResumenPorteria {
  visitasActivas: number;
  paquetesPendientes: number;
}
