import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'app',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./interno/interno.routes').then((m) => m.INTERNO_ROUTES),
  },
  {
    path: '',
    loadChildren: () =>
      import('./publico/publico.routes').then((m) => m.PUBLICO_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
