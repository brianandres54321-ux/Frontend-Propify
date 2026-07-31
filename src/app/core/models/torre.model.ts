export interface Torre {
  codTorre: number;
  codInmueble: number;
  nombre: string;
  numeroPisos?: number;
}

export interface CrearTorreRequest {
  codInmueble: number;
  nombre: string;
  numeroPisos?: number;
}

export interface ActualizarTorreRequest {
  nombre?: string;
  numeroPisos?: number;
}
