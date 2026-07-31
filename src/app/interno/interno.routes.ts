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
        loadComponent: () =>
          import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'inmuebles',
        loadComponent: () =>
          import('./inmuebles/inmuebles.page').then((m) => m.InmueblesPage),
      },
      {
        path: 'inmuebles/:inmuebleId/unidades',
        loadComponent: () =>
          import('./inmuebles/unidades/unidades.page').then((m) => m.UnidadesPage),
      },
      {
        path: 'inmuebles/:inmuebleId/unidades/:unidadId/residentes',
        loadComponent: () =>
          import('./inmuebles/unidades/residentes/residentes.page').then(
            (m) => m.ResidentesPage,
          ),
      },
      // Próximos módulos (cobranza, portería, zonas comunes, avisos...) se
      // agregan aquí como rutas hijas con loadComponent, usando rolesGuard +
      // data:{ roles: [...] } cuando el módulo no sea accesible para todos
      // los roles.
    ],
  },
];
