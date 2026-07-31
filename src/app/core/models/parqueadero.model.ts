export interface Parqueadero {
  codParqueadero: number;
  codInmueble: number;
  numero: string;
  tipo?: string;
  codUnidad?: number;
}

export interface CrearParqueaderoRequest {
  codInmueble: number;
  numero: string;
  tipo?: string;
  codUnidad?: number;
}

export interface ActualizarParqueaderoRequest {
  numero?: string;
  tipo?: string;
  codUnidad?: number;
}
