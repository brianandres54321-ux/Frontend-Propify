import { Routes } from '@angular/router';

import { PublicoLayout } from './layout/publico-layout';
import { AuthLayout } from './auth/auth-layout';

export const PUBLICO_ROUTES: Routes = [
  {
    path: '',
    component: PublicoLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'nosotros',
        loadComponent: () =>
          import('./nosotros/nosotros.page').then((m) => m.NosotrosPage),
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./contacto/contacto.page').then((m) => m.ContactoPage),
      },
    ],
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'registro',
        loadComponent: () =>
          import('./auth/registro/registro.page').then((m) => m.RegistroPage),
      },
      {
        path: 'recuperar-password',
        loadComponent: () =>
          import('./auth/recuperar-password/recuperar-password.page').then(
            (m) => m.RecuperarPasswordPage,
          ),
      },
      {
        path: 'nueva-password',
        loadComponent: () =>
          import('./auth/nueva-password/nueva-password.page').then(
            (m) => m.NuevaPasswordPage,
          ),
      },
    ],
  },
];
