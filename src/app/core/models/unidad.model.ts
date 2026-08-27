export enum TipoUnidad {
  APARTAMENTO = 'APARTAMENTO',
  APARTAESTUDIO = 'APARTAESTUDIO',
  HABITACION = 'HABITACION',
  LOCAL = 'LOCAL',
  OFICINA = 'OFICINA',
}

// VACANTE = publicada por el dueño como disponible para arrendar (ver
// publico/arriendos.service.ts) — no se infiere solo de si tiene o no un
// residente activo.
export enum EstadoOcupacionUnidad {
  OCUPADA = 'OCUPADA',
  VACANTE = 'VACANTE',
}

// Campos estructurados de "características" — comunes a Unidad tanto en un
// edificio/conjunto como en una casa (una casa también tiene Unidades, ver
// nota en propify_especificacion.md §6: "Unidad es única por (inmuebleId,
// torreId, identificador) — para Casa Adaptada torreId es null").
export interface CaracteristicasUnidad {
  precioArriendo?: number;
  numeroCuartos?: number;
  numeroBanos?: number;
  tieneComedor: boolean;
  tieneSala: boolean;
  tieneCocina: boolean;
  amoblado: boolean;
}

export interface Unidad extends CaracteristicasUnidad {
  codUnidad: number;
  codInmueble: number;
  codTorre?: number;
  identificador: string;
  piso?: number;
  tipo: TipoUnidad;
  areaM2?: number;
  estadoOcupacion: EstadoOcupacionUnidad;
  creadoEn: string;
}

export interface CrearUnidadRequest extends Partial<CaracteristicasUnidad> {
  codInmueble: number;
  codTorre?: number;
  identificador: string;
  piso?: number;
  tipo?: TipoUnidad;
  areaM2?: number;
  estadoOcupacion?: EstadoOcupacionUnidad;
}

export interface ActualizarUnidadRequest extends Partial<CaracteristicasUnidad> {
  codTorre?: number;
  identificador?: string;
  piso?: number;
  tipo?: TipoUnidad;
  areaM2?: number;
  estadoOcupacion?: EstadoOcupacionUnidad;
}

// Ocupación del dashboard — ver GET /privado/unidades/resumen-ocupacion.
export interface ResumenOcupacion {
  totalUnidades: number;
  vacantes: number;
  ocupadas: number;
  vaciasProlongadas: number;
}

export interface FotoUnidad {
  codFoto: number;
  codUnidad: number;
  nombreArchivo: string;
  creadoEn: string;
}

// Respuesta de GET /publico/arriendos/unidades/:id — nunca incluye datos del
// tenant/dueño ni de residentes, salvo el teléfono de contacto que el propio
// dueño eligió publicar.
export interface ArriendoUnidadPublico extends CaracteristicasUnidad {
  codUnidad: number;
  identificador: string;
  tipo: TipoUnidad;
  piso?: number;
  areaM2?: number;
  nombreInmueble?: string;
  direccionInmueble?: string;
  telefonoContacto: string | null;
  fotos: { codFoto: number }[];
}

// Respuesta de GET /publico/arriendos/inmuebles/:inmuebleId
export interface ArriendoResumenUnidad extends CaracteristicasUnidad {
  codUnidad: number;
  identificador: string;
  tipo: TipoUnidad;
  piso?: number;
  areaM2?: number;
  codFotoPortada: number | null;
}

export interface ArriendoInmueblePublico {
  inmueble: { nombre: string; direccion?: string };
  telefonoContacto: string | null;
  unidades: ArriendoResumenUnidad[];
}

// Respuesta de GET /publico/arriendos/destacadas — vitrina de la página de
// inicio, últimas unidades publicadas de cualquier tenant.
export interface ArriendoDestacada extends CaracteristicasUnidad {
  codUnidad: number;
  identificador: string;
  tipo: TipoUnidad;
  piso?: number;
  areaM2?: number;
  codFotoPortada: number | null;
  nombreInmueble?: string;
  telefonoContacto: string | null;
}
