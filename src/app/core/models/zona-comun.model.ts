export interface ZonaComun {
  codZona: number;
  codInmueble: number;
  nombre: string;
  precio: number;
  capacidad?: number;
  horaApertura?: string;
  horaCierre?: string;
  activa: boolean;
}

export interface CrearZonaComunRequest {
  codInmueble: number;
  nombre: string;
  precio?: number;
  capacidad?: number;
  horaApertura?: string;
  horaCierre?: string;
}

export interface ActualizarZonaComunRequest {
  nombre?: string;
  precio?: number;
  capacidad?: number;
  horaApertura?: string;
  horaCierre?: string;
  activa?: boolean;
}
