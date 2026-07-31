export interface Rol {
  codRol: number;
  nombreRol: string;
  estadoRol: number;
}

export interface CrearRolRequest {
  nombreRol: string;
  estadoRol?: number;
}
