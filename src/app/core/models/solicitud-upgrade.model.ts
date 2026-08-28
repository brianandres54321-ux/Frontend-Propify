import { PlanTipo } from './tenant.model';

// Cuerpo de POST /privado/solicitudes-upgrade — el DUEÑO pide pasar a un plan
// pagado (o cambiar de plan).
export interface CrearSolicitudUpgrade {
  planSolicitado?: PlanTipo;
  mensaje?: string;
}

// Una solicitud como la ve el superadministrador en su bandeja
// (GET /privado/solicitudes-upgrade).
export interface SolicitudUpgrade {
  codSolicitud: number;
  codTenant: number;
  codUsuario?: number | null;
  planActual: PlanTipo;
  planSolicitado?: PlanTipo | null;
  mensaje?: string | null;
  atendida: boolean;
  creadoEn: string;
  tenantNombre: string;
  tenantPagado: boolean;
}
