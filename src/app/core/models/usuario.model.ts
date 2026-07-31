export interface Usuario {
  codUsuario: number;
  codTenant?: number | null;
  codRol: number;
  nombreUsuario: string;
  correoUsuario: string;
  passwordChangedAt?: string | null;
}

export interface CrearUsuarioRequest {
  codRol: number;
  // Solo el superadministrador puede fijarlo (para crear usuarios de un tenant específico).
  codTenant?: number;
  nombreUsuario: string;
  correoUsuario: string;
  claveAcceso: string;
}
