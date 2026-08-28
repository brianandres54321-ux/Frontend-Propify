export enum PlanTipo {
  CASAS = 'CASAS',
  EDIFICIOS = 'EDIFICIOS',
  CONJUNTOS = 'CONJUNTOS',
}

export interface Tenant {
  codTenant: number;
  nombre: string;
  plan: PlanTipo;
  activo: boolean;
  // Plan demo (false) vs pagado (true) — controla los límites de uso.
  // Sin pasarela de pago: lo activa manualmente el superadministrador.
  pagado: boolean;
  // Ajuste manual de límites por cliente (solo superadmin). null = usar el
  // límite del plan.
  limiteInmuebles?: number | null;
  limiteUnidades?: number | null;
  // Teléfono/WhatsApp que se muestra en los anuncios públicos de arriendo.
  telefonoContacto?: string;
  creadoEn: string;
  // Uso actual + límite efectivo (lo agrega GET /privado/tenants[/:id] y
  // /mi-tenant). Los límites en `null` = ilimitado.
  uso?: {
    inmuebles: number;
    unidades: number;
    limiteInmuebles: number | null;
    limiteUnidades: number | null;
  };
}

export interface CrearTenantRequest {
  nombre: string;
  plan?: PlanTipo;
  pagado?: boolean;
  // Datos del usuario dueño — se crea sin contraseña y recibe un correo de
  // invitación para definirla (POST /privado/tenants).
  duenoNombre: string;
  duenoCorreo: string;
  duenoTelefono: string;
}

// Un usuario del cliente, como lo devuelve GET /privado/tenants/:id.
export interface TenantUsuario {
  codUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  telefono: string | null;
  // Slug del rol (dueno/admin/...). Usar etiquetaRol() para mostrarlo.
  rol: string;
  // false = invitación pendiente (nunca definió su contraseña).
  tieneAcceso: boolean;
}

export interface TenantDetalle extends Tenant {
  usuarios: TenantUsuario[];
}

export interface ActualizarTenantRequest {
  nombre?: string;
  plan?: PlanTipo;
  activo?: boolean;
  pagado?: boolean;
  limiteInmuebles?: number | null;
  limiteUnidades?: number | null;
  telefonoContacto?: string;
}

// Autoservicio (PUT /privado/tenants/mi-tenant) — lo que un DUEÑO puede
// autoadministrar desde /app/configuracion (Empresa + Información de
// contacto). Nunca incluye plan/activo/pagado (ver ActualizarContactoDto).
export interface ActualizarContactoRequest {
  nombre?: string;
  telefonoContacto?: string;
}
