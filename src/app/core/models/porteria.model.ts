export interface Visita {
  codVisita: number;
  codUnidad: number;
  nombreVisitante: string;
  cedulaVisitante?: string;
  // Total de personas del grupo (incluye a quien firma). 1 si es individual.
  numeroPersonas: number;
  acompanantes?: string;
  // Placa(s) del/los vehículo(s) de la visita, como texto libre.
  vehiculos?: string;
  // Firma manuscrita del visitante como data URL PNG.
  firma?: string;
  horaEntrada: string;
  horaSalida?: string;
  registradoPorId: number;
}

export interface CrearVisitaRequest {
  codUnidad: number;
  nombreVisitante: string;
  cedulaVisitante?: string;
  numeroPersonas?: number;
  acompanantes?: string;
  vehiculos?: string;
  firma?: string;
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

export interface ContactoResidente {
  nombre: string;
  telefono: string;
  esPropietario: boolean;
}

export interface UnidadPanorama {
  codUnidad: number;
  identificador: string;
  torre: string | null;
  piso: number | null;
  residentes: ContactoResidente[];
}

// GET /privado/porteria/panorama?inmuebleId= — todo el estado de portería de
// un inmueble en una sola llamada.
export interface PanoramaPorteria {
  unidades: UnidadPanorama[];
  visitasActivas: Visita[];
  paquetesPendientes: Paquete[];
  paquetesEntregados: Paquete[];
  autorizacionesVigentes: AutorizacionPrevia[];
}
