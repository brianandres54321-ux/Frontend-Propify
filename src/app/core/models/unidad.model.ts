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
  // Publicación "en venta" — independiente del estado de ocupación.
  enVenta?: boolean;
  precioVenta?: number;
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

// Alta masiva de unidades — POST /privado/unidades/lote.
export type ModoGeneracionUnidades = 'pisos' | 'consecutivo';

export interface GenerarUnidadesRequest {
  codInmueble: number;
  codTorre?: number;
  modo: ModoGeneracionUnidades;
  prefijo?: string;
  tipo?: TipoUnidad;
  estadoOcupacion?: EstadoOcupacionUnidad;
  // modo 'pisos'
  pisos?: number;
  unidadesPorPiso?: number;
  // modo 'consecutivo'
  desde?: number;
  hasta?: number;
}

export interface GenerarUnidadesResultado {
  solicitadas: number;
  creadas: number;
  omitidas: number;
  identificadores: string[];
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

export interface AmenidadesInmueble {
  zonasComunes: boolean;
  parqueadero: boolean;
  porteria: boolean;
}

// Tarjeta de "otras opciones" al pie del detalle.
export interface ArriendoRelacionada extends CaracteristicasUnidad {
  codUnidad: number;
  codInmueble: number;
  identificador: string;
  tipo: TipoUnidad;
  piso?: number;
  areaM2?: number;
  enArriendo?: boolean;
  codFotoPortada: number | null;
  fotos: number[];
  nombreInmueble: string | null;
  ciudad: string | null;
  barrio: string | null;
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
  enArriendo?: boolean;
  nombreInmueble?: string | null;
  direccionInmueble?: string | null;
  torre?: string | null;
  ciudad?: string | null;
  barrio?: string | null;
  departamento?: string | null;
  amenidades: AmenidadesInmueble;
  telefonoContacto: string | null;
  fotos: { codFoto: number }[];
  relacionadas: ArriendoRelacionada[];
}

// Respuesta de GET /publico/arriendos/inmuebles/:inmuebleId
export interface ArriendoResumenUnidad extends CaracteristicasUnidad {
  codUnidad: number;
  identificador: string;
  tipo: TipoUnidad;
  piso?: number;
  areaM2?: number;
  codFotoPortada: number | null;
  // IDs de todas las fotos, en orden.
  fotos: number[];
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
  fotos: number[];
  nombreInmueble?: string;
  telefonoContacto: string | null;
}

export type OrdenArriendos = 'recientes' | 'precio-asc' | 'precio-desc';
export type OperacionPublicacion = 'arriendo' | 'venta';

// Filtros de GET /publico/arriendos/buscar.
export interface BuscarArriendosParams {
  operacion?: OperacionPublicacion;
  q?: string;
  ciudad?: string;
  barrio?: string;
  departamento?: string;
  tipo?: TipoUnidad;
  precioMin?: number;
  precioMax?: number;
  cuartos?: number;
  amoblado?: boolean;
  orden?: OrdenArriendos;
  pagina?: number;
  tamanio?: number;
}

// Un resultado de la búsqueda pública de arriendos.
export interface ArriendoBusquedaItem extends CaracteristicasUnidad {
  codUnidad: number;
  codInmueble: number;
  identificador: string;
  tipo: TipoUnidad;
  piso?: number;
  areaM2?: number;
  enArriendo?: boolean;
  codFotoPortada: number | null;
  // IDs de todas las fotos, en orden — para el mini-carrusel de la tarjeta.
  fotos: number[];
  nombreInmueble: string | null;
  direccionInmueble: string | null;
  ciudad: string | null;
  barrio: string | null;
  departamento: string | null;
  telefonoContacto: string | null;
}

// Respuesta de GET /publico/arriendos/buscar.
export interface ArriendoBusquedaRespuesta {
  items: ArriendoBusquedaItem[];
  total: number;
  pagina: number;
  tamanio: number;
}
