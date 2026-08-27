import { Routes } from '@angular/router';

import { InternoLayout } from './layout/interno-layout';

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
        loadComponent: () => import('./inmuebles/inmuebles.page').then((m) => m.InmueblesPage),
      },
      {
        path: 'inmuebles/:inmuebleId/unidades',
        loadComponent: () =>
          import('./inmuebles/unidades/unidades.page').then((m) => m.UnidadesPage),
      },
      {
        path: 'inmuebles/:inmuebleId/unidades/:unidadId/residentes',
        loadComponent: () =>
          import('./inmuebles/unidades/residentes/residentes.page').then((m) => m.ResidentesPage),
      },
      {
        path: 'inmuebles/:inmuebleId/unidades/:unidadId/residentes/:residenteId',
        loadComponent: () =>
          import('./inmuebles/unidades/residentes/residente-detalle.page').then(
            (m) => m.ResidenteDetallePage,
          ),
      },
      {
        path: 'cobranza',
        loadComponent: () => import('./cobranza/cobranza.page').then((m) => m.CobranzaPage),
      },
      {
        path: 'gastos',
        loadComponent: () => import('./gastos/gastos.page').then((m) => m.GastosPage),
      },
      {
        path: 'zonas-comunes',
        loadComponent: () =>
          import('./zonas-comunes/zonas-comunes.page').then((m) => m.ZonasComunesPage),
      },
      {
        path: 'porteria',
        loadComponent: () => import('./porteria/porteria.page').then((m) => m.PorteriaPage),
      },
      {
        path: 'avisos',
        loadComponent: () => import('./avisos/avisos.page').then((m) => m.AvisosPage),
      },
      {
        path: 'mis-cuentas',
        loadComponent: () => import('./mis-cuentas/mis-cuentas.page').then((m) => m.MisCuentasPage),
      },
      {
        path: 'reportes-dano',
        loadComponent: () =>
          import('./reportes-dano/reportes-dano.page').then((m) => m.ReportesDanoPage),
      },
      {
        path: 'autorizar-visitante',
        loadComponent: () =>
          import('./autorizar-visitante/autorizar-visitante.page').then(
            (m) => m.AutorizarVisitantePage,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./usuarios/usuarios.page').then((m) => m.UsuariosPage),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./configuracion/configuracion.page').then((m) => m.ConfiguracionPage),
      },
      // Nuevos módulos: agregar como rutas hijas con loadComponent dentro de
      // su dominio (propiedad/finanzas/comunidad/seguridad/administracion),
      // usando rolesGuard + data:{ roles: [...] } cuando aplique.
    ],
  },
];
