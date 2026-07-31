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
}

export interface CrearResidenteRequest {
  codUnidad: number;
  codUsuario?: number;
  nombre: string;
  telefono: string;
  correo?: string;
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
