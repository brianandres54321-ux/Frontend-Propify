export interface Inmueble {
  codInmueble: number;
  codTenant: number;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  barrio?: string;
  departamento?: string;
  tieneTorres: boolean;
  tieneZonasComunes: boolean;
  tieneParqueaderos: boolean;
  tieneCelador: boolean;
  tieneCartelera: boolean;
  creadoEn: string;
}

export interface CrearInmuebleRequest {
  nombre: string;
  direccion?: string;
  ciudad?: string;
  barrio?: string;
  departamento?: string;
  tieneTorres?: boolean;
  tieneZonasComunes?: boolean;
  tieneParqueaderos?: boolean;
  tieneCelador?: boolean;
  tieneCartelera?: boolean;
}

export type ActualizarInmuebleRequest = Partial<CrearInmuebleRequest>;
