import { RoleNames, RolNombre } from '../../core/constants/roles.constant';

export interface NavItem {
  label: string;
  ruta: string;
  // Vacío = visible para cualquier rol autenticado.
  roles: RolNombre[];
  // false = módulo aún sin vista construida; se muestra pero no navega.
  implementado: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', ruta: '/app/dashboard', roles: [], implementado: true },
  {
    label: 'Inmuebles',
    ruta: '/app/inmuebles',
    roles: [RoleNames.DUENO, RoleNames.ADMIN],
    implementado: true,
  },
  // Unidades y Residentes no están en el sidebar: el backend los consulta
  // por inmuebleId/unidadId (GET /privado/unidades?inmuebleId=, GET
  // /privado/residentes?unidadId=), así que solo tienen sentido navegando
  // desde su padre (Inmuebles -> botón "Unidades" -> botón "Residentes").
  {
    label: 'Cobranza',
    ruta: '/app/cobranza',
    roles: [RoleNames.DUENO, RoleNames.ADMIN],
    implementado: false,
  },
  {
    label: 'Gastos',
    ruta: '/app/gastos',
    roles: [RoleNames.DUENO, RoleNames.ADMIN],
    implementado: false,
  },
  {
    label: 'Zonas comunes',
    ruta: '/app/zonas-comunes',
    roles: [RoleNames.DUENO, RoleNames.ADMIN, RoleNames.RESIDENTE],
    implementado: false,
  },
  {
    label: 'Portería',
    ruta: '/app/porteria',
    roles: [RoleNames.DUENO, RoleNames.ADMIN, RoleNames.CELADOR],
    implementado: false,
  },
  { label: 'Avisos', ruta: '/app/avisos', roles: [], implementado: false },
  {
    label: 'Mis cuentas',
    ruta: '/app/mis-cuentas',
    roles: [RoleNames.RESIDENTE],
    implementado: false,
  },
  {
    label: 'Usuarios',
    ruta: '/app/usuarios',
    roles: [RoleNames.DUENO, RoleNames.ADMIN],
    implementado: false,
  },
  {
    label: 'Tenants',
    ruta: '/app/tenants',
    roles: [RoleNames.SUPERADMIN],
    implementado: false,
  },
];
