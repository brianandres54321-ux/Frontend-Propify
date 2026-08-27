export enum PlanTipo {
  CASAS = 'CASAS',
  EDIFICIOS = 'EDIFICIOS',
  CONJUNTOS = 'CONJUNTOS',
}

export interface Tenant {
  codTenant: number;
  nombre: string;
  plan: PlanTipo;
  colorPrimario?: string;
  colorSecundario?: string;
  logoUrl?: string;
  activo: boolean;
  // Plan demo (false) vs pagado (true) — controla los límites de uso (ver
  // LIMITES_PLAN_DEMO en el backend). Sin pasarela de pago conectada
  // todavía: lo activa manualmente el superadministrador.
  pagado: boolean;
  // Teléfono/WhatsApp que se muestra en los anuncios públicos de arriendo.
  telefonoContacto?: string;
  creadoEn: string;
}

export interface CrearTenantRequest {
  nombre: string;
  plan?: PlanTipo;
  colorPrimario?: string;
  colorSecundario?: string;
  logoUrl?: string;
}

export interface ActualizarTenantRequest {
  nombre?: string;
  plan?: PlanTipo;
  colorPrimario?: string;
  colorSecundario?: string;
  logoUrl?: string;
  activo?: boolean;
  pagado?: boolean;
  telefonoContacto?: string;
}

// Autoservicio (PUT /privado/tenants/mi-tenant) — lo que un DUEÑO puede
// autoadministrar desde /app/configuracion (Empresa + Información de
// contacto). Nunca incluye plan/activo/pagado (ver ActualizarContactoDto).
export interface ActualizarContactoRequest {
  nombre?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  logoUrl?: string;
  telefonoContacto?: string;
}
