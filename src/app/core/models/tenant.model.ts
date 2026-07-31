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
}
