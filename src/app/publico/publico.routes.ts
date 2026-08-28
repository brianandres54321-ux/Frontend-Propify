import { Routes } from '@angular/router';

import { PublicoLayout } from '@layout/publico/publico-layout';
import { AuthLayout } from '@layout/auth/auth-layout';

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
        loadComponent: () => import('./nosotros/nosotros.page').then((m) => m.NosotrosPage),
      },
      {
        path: 'planes',
        loadComponent: () => import('./planes/planes.page').then((m) => m.PlanesPage),
      },
      {
        path: 'contacto',
        loadComponent: () => import('./contacto/contacto.page').then((m) => m.ContactoPage),
      },
      {
        path: 'arriendos',
        loadComponent: () => import('./arriendos/arriendos.page').then((m) => m.ArriendosPage),
      },
      {
        path: 'arriendo/unidad/:unidadId',
        loadComponent: () =>
          import('./arriendo/arriendo-unidad.page').then((m) => m.ArriendoUnidadPage),
      },
      {
        path: 'arriendo/inmueble/:inmuebleId',
        loadComponent: () =>
          import('./arriendo/arriendo-inmueble.page').then((m) => m.ArriendoInmueblePage),
      },
    ],
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'registro',
        loadComponent: () => import('./auth/registro/registro.page').then((m) => m.RegistroPage),
      },
      {
        path: 'recuperar-password',
        loadComponent: () =>
          import('./auth/recuperar-password/recuperar-password.page').then(
            (m) => m.RecuperarPasswordPage,
          ),
      },
      {
        // El correo de recuperación enlaza a /reset-password/:token
        // (ver registros.service.ts → `enlace`).
        path: 'reset-password/:token',
        loadComponent: () =>
          import('./auth/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
      },
      {
        // Alta de un cliente por el superadmin: el correo de invitación
        // enlaza aquí para que el dueño defina su primera contraseña
        // (ver tenants.service.ts → `enlace`). Misma pantalla, otro copy.
        path: 'activar-cuenta/:token',
        data: { activacion: true },
        loadComponent: () =>
          import('./auth/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
      },
    ],
  },
];
