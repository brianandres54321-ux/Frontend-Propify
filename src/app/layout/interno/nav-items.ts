import { BanderaModulo, RoleNames, RolNombre } from '@core/constants';

export interface NavItem {
  label: string;
  ruta: string;
  // Clase de bootstrap-icons (bi-*), sin el prefijo "bi-".
  icono: string;
  // Vacío = visible para cualquier rol autenticado.
  roles: RolNombre[];
  // false = módulo aún sin vista construida; se muestra pero no navega.
  implementado: boolean;
  // Si se indica, el ítem solo se muestra cuando el plan del tenant ofrece
  // esa bandera (ver BANDERAS_DISPONIBLES_POR_PLAN) — p. ej. una Casa nunca
  // ve "Zonas comunes" en el menú, porque ningún inmueble suyo podría
  // tenerla activa.
  bandera?: BanderaModulo;
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
    implementado: true,
    bandera: 'tieneZonasComunes',
  },
  {
    label: 'Portería',
    ruta: '/app/porteria',
    icono: 'shield-lock',
    roles: [RoleNames.DUENO, RoleNames.ADMIN, RoleNames.CELADOR],
    implementado: true,
    bandera: 'tieneCelador',
  },
  {
    label: 'Avisos',
    ruta: '/app/avisos',
    icono: 'megaphone',
    roles: [],
    implementado: true,
    bandera: 'tieneCartelera',
  },
  {
    label: 'Mis cuentas',
    ruta: '/app/mis-cuentas',
    icono: 'wallet2',
    roles: [RoleNames.RESIDENTE],
    implementado: true,
  },
  {
    label: 'Reportes de daño',
    ruta: '/app/reportes-dano',
    icono: 'tools',
    roles: [RoleNames.DUENO, RoleNames.ADMIN, RoleNames.RESIDENTE],
    implementado: true,
  },
  {
    label: 'Autorizar visitante',
    ruta: '/app/autorizar-visitante',
    icono: 'person-check',
    roles: [RoleNames.RESIDENTE],
    implementado: true,
  },
  {
    label: 'Usuarios',
    ruta: '/app/usuarios',
    icono: 'people',
    roles: [RoleNames.DUENO, RoleNames.ADMIN],
    implementado: true,
  },
  {
    label: 'Configuración',
    ruta: '/app/configuracion',
    icono: 'gear',
    roles: [],
    implementado: true,
  },
  {
    label: 'Clientes pagados',
    ruta: '/app/tenants/pagados',
    icono: 'diagram-3',
    roles: [RoleNames.SUPERADMIN],
    implementado: true,
  },
  {
    label: 'Clientes demo',
    ruta: '/app/tenants/demo',
    icono: 'hourglass-split',
    roles: [RoleNames.SUPERADMIN],
    implementado: true,
  },
  {
    label: 'Mensajes de contacto',
    ruta: '/app/mensajes-contacto',
    icono: 'envelope',
    roles: [RoleNames.SUPERADMIN],
    implementado: true,
  },
  {
    label: 'Solicitudes de plan',
    ruta: '/app/solicitudes-plan',
    icono: 'arrow-up-circle',
    roles: [RoleNames.SUPERADMIN],
    implementado: true,
  },
];
