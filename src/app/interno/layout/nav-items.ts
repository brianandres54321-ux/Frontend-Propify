import { RoleNames, RolNombre } from '../../core/constants/roles.constant';

export interface NavItem {
  label: string;
  ruta: string;
  // Clase de bootstrap-icons (bi-*), sin el prefijo "bi-".
  icono: string;
  // Vacío = visible para cualquier rol autenticado.
  roles: RolNombre[];
  // false = módulo aún sin vista construida; se muestra pero no navega.
  implementado: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    ruta: '/app/dashboard',
    icono: 'speedometer2',
    roles: [],
    implementado: true,
  },
  {
    label: 'Inmuebles',
    ruta: '/app/inmuebles',
    icono: 'building',
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
    icono: 'cash-coin',
    roles: [RoleNames.DUENO, RoleNames.ADMIN],
    implementado: true,
  },
  {
    label: 'Gastos',
    ruta: '/app/gastos',
    icono: 'receipt',
    roles: [RoleNames.DUENO, RoleNames.ADMIN],
    implementado: true,
  },
  {
    label: 'Zonas comunes',
    ruta: '/app/zonas-comunes',
    icono: 'flower1',
    roles: [RoleNames.DUENO, RoleNames.ADMIN, RoleNames.RESIDENTE],
    implementado: false,
  },
  {
    label: 'Portería',
    ruta: '/app/porteria',
    icono: 'shield-lock',
    roles: [RoleNames.DUENO, RoleNames.ADMIN, RoleNames.CELADOR],
    implementado: false,
  },
  {
    label: 'Avisos',
    ruta: '/app/avisos',
    icono: 'megaphone',
    roles: [],
    implementado: false,
  },
  {
    label: 'Mis cuentas',
    ruta: '/app/mis-cuentas',
    icono: 'wallet2',
    roles: [RoleNames.RESIDENTE],
    implementado: false,
  },
  {
    label: 'Usuarios',
    ruta: '/app/usuarios',
    icono: 'people',
    roles: [RoleNames.DUENO, RoleNames.ADMIN],
    implementado: false,
  },
  {
    label: 'Tenants',
    ruta: '/app/tenants',
    icono: 'diagram-3',
    roles: [RoleNames.SUPERADMIN],
    implementado: false,
  },
];
