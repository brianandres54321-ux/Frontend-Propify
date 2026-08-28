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

// PUT /privado/usuarios/:id — todos los campos opcionales; claveAcceso solo
// si se quiere restablecer la contraseña.
export interface ActualizarUsuarioRequest {
  codRol?: number;
  nombreUsuario?: string;
  correoUsuario?: string;
  claveAcceso?: string;
}

// GET /privado/usuarios/perfil — datos del usuario autenticado para
// /app/configuracion (pestaña "Mi perfil").
export interface PerfilUsuario {
  nombreUsuario: string;
  correoUsuario: string;
  nombreRol: string;
}

// GET /privado/usuarios corre una query SQL cruda (no pasa por el entity
// mapper de TypeORM), así que devuelve las columnas tal cual en snake_case
// — a diferencia de todo el resto de endpoints de la app, que sí normalizan
// a camelCase.
export interface UsuarioResumen {
  cod_usuario: number;
  nombre_usuario: string;
  correo_usuario: string;
  cod_rol: number;
  nombre_rol: string;
  // Solo lo trae la variante CONSULTAR_TODOS, exclusiva del superadministrador.
  cod_tenant?: number;
}
