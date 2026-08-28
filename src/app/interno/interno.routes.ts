import { Routes } from '@angular/router';

import { RoleNames } from '@core/constants';
import { rolesGuard } from '@core/guards';
import { InternoLayout } from '@layout/interno/interno-layout';

export const INTERNO_ROUTES: Routes = [
  {
    path: '',
    component: InternoLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'inmuebles',
        loadComponent: () =>
          import('./propiedad/inmuebles/inmuebles.page').then((m) => m.InmueblesPage),
      },
      {
        path: 'inmuebles/:inmuebleId/unidades',
        loadComponent: () =>
          import('./propiedad/inmuebles/unidades/unidades.page').then((m) => m.UnidadesPage),
      },
      {
        path: 'inmuebles/:inmuebleId/unidades/:unidadId/residentes',
        loadComponent: () =>
          import('./propiedad/inmuebles/unidades/residentes/residentes.page').then(
            (m) => m.ResidentesPage,
          ),
      },
      {
        path: 'inmuebles/:inmuebleId/unidades/:unidadId/residentes/:residenteId',
        loadComponent: () =>
          import('./propiedad/inmuebles/unidades/residentes/residente-detalle.page').then(
            (m) => m.ResidenteDetallePage,
          ),
      },
      {
        path: 'cobranza',
        loadComponent: () =>
          import('./finanzas/cobranza/cobranza.page').then((m) => m.CobranzaPage),
      },
      {
        path: 'gastos',
        loadComponent: () => import('./finanzas/gastos/gastos.page').then((m) => m.GastosPage),
      },
      {
        path: 'zonas-comunes',
        loadComponent: () =>
          import('./comunidad/zonas-comunes/zonas-comunes.page').then((m) => m.ZonasComunesPage),
      },
      {
        path: 'porteria',
        loadComponent: () =>
          import('./seguridad/porteria/porteria.page').then((m) => m.PorteriaPage),
      },
      {
        path: 'avisos',
        loadComponent: () => import('./comunidad/avisos/avisos.page').then((m) => m.AvisosPage),
      },
      {
        path: 'mis-cuentas',
        loadComponent: () =>
          import('./finanzas/mis-cuentas/mis-cuentas.page').then((m) => m.MisCuentasPage),
      },
      {
        path: 'reportes-dano',
        loadComponent: () =>
          import('./comunidad/reportes-dano/reportes-dano.page').then((m) => m.ReportesDanoPage),
      },
      {
        path: 'autorizar-visitante',
        loadComponent: () =>
          import('./seguridad/autorizar-visitante/autorizar-visitante.page').then(
            (m) => m.AutorizarVisitantePage,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./administracion/usuarios/usuarios.page').then((m) => m.UsuariosPage),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./administracion/configuracion/configuracion.page').then(
            (m) => m.ConfiguracionPage,
          ),
      },
      {
        path: 'tenants',
        canActivate: [rolesGuard],
        data: { roles: [RoleNames.SUPERADMIN] },
        children: [
          { path: '', redirectTo: 'pagados', pathMatch: 'full' },
          {
            path: 'pagados',
            data: { roles: [RoleNames.SUPERADMIN], modo: 'pagados' },
            loadComponent: () =>
              import('./administracion/tenants/tenants.page').then((m) => m.TenantsPage),
          },
          {
            path: 'demo',
            data: { roles: [RoleNames.SUPERADMIN], modo: 'demo' },
            loadComponent: () =>
              import('./administracion/tenants/tenants.page').then((m) => m.TenantsPage),
          },
          {
            path: ':id',
            data: { roles: [RoleNames.SUPERADMIN] },
            loadComponent: () =>
              import('./administracion/tenants/tenant-detalle.page').then(
                (m) => m.TenantDetallePage,
              ),
          },
        ],
      },
      {
        path: 'mensajes-contacto',
        canActivate: [rolesGuard],
        data: { roles: [RoleNames.SUPERADMIN] },
        loadComponent: () =>
          import('./administracion/mensajes-contacto/mensajes-contacto.page').then(
            (m) => m.MensajesContactoPage,
          ),
      },
      // Nuevos módulos: agregar como rutas hijas con loadComponent dentro de
      // su dominio (propiedad/finanzas/comunidad/seguridad/administracion),
      // usando rolesGuard + data:{ roles: [...] } cuando aplique.
    ],
  },
];
