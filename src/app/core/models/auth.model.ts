import { PlanTipo } from './tenant.model';

// Espejo de SesionUsuario / JwtPayload del backend
// (src/middleware/seguridad/guardianes/auth.interface.ts)
export interface SesionUsuario {
  jti: string;
  sub: number;
  name: string;
  nombre_rol: string;
  tenant_id: number | null;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  correoUsuario: string;
  claveAcceso: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
}

// POST /registros/user — se une a un tenant existente
export interface RegistroRequest {
  codTenant: number;
  nombreUsuario: string;
  correoUsuario: string;
  claveAcceso: string;
}

// POST /registros/tenant — crea un tenant nuevo junto con su usuario dueño
export interface RegistroTenantRequest {
  nombreTenant: string;
  plan?: PlanTipo;
  nombreUsuario: string;
  correoUsuario: string;
  telefono: string;
  claveAcceso: string;
}

export interface TokenResponse {
  token: string;
}

export interface RecuperarPasswordRequest {
  correoUsuario: string;
}

export interface NuevaPasswordRequest {
  token: string;
  nuevaClave: string;
}

export interface CambioPasswordRequest {
  claveActual: string;
  nuevaClave: string;
}

export interface MensajeResponse {
  mensaje: string;
}
