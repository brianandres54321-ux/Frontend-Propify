export interface Residente {
  codResidente: number;
  codUnidad: number;
  codUsuario?: number;
  nombre: string;
  telefono: string;
  correo?: string;
  cedula?: string;
  esPropietario: boolean;
  valorMensual: number;
  diaPago: number;
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean;
  // Solo viene poblado en GET /privado/residentes/por-vencer (para mostrar
  // en qué unidad está el contrato que se vence, sin otra consulta).
  unidad?: { codUnidad: number; identificador: string };
  // Nombre del archivo guardado en el servidor (no el nombre original) —
  // presencia indica si ya se subió un contrato (Word/PDF) para este residente.
  archivoContrato?: string;
}

export interface CrearResidenteRequest {
  codUnidad: number;
  codUsuario?: number;
  nombre: string;
  telefono: string;
  correo: string;
  cedula?: string;
  esPropietario?: boolean;
  valorMensual: number;
  diaPago: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ActualizarResidenteRequest {
  nombre?: string;
  telefono?: string;
  correo?: string;
  cedula?: string;
  esPropietario?: boolean;
  valorMensual?: number;
  diaPago?: number;
  fechaFin?: string;
  activo?: boolean;
}
