export enum TipoUnidad {
  APARTAMENTO = 'APARTAMENTO',
  APARTAESTUDIO = 'APARTAESTUDIO',
  HABITACION = 'HABITACION',
  LOCAL = 'LOCAL',
  OFICINA = 'OFICINA',
}

export interface Unidad {
  codUnidad: number;
  codInmueble: number;
  codTorre?: number;
  identificador: string;
  piso?: number;
  tipo: TipoUnidad;
  areaM2?: number;
  creadoEn: string;
}

export interface CrearUnidadRequest {
  codInmueble: number;
  codTorre?: number;
  identificador: string;
  piso?: number;
  tipo?: TipoUnidad;
  areaM2?: number;
}

export interface ActualizarUnidadRequest {
  codTorre?: number;
  identificador?: string;
  piso?: number;
  tipo?: TipoUnidad;
  areaM2?: number;
}
