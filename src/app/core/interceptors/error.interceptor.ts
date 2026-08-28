import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

// Sesión expirada o token inválido: limpia la sesión local y manda a login.
// Solo aplica a endpoints privados: en los públicos (/publico/**) un 401 es
// un error de dominio — credenciales incorrectas en login, enlace de
// recuperación inválido o vencido en nueva-password — que cada página
// maneja por su cuenta, no una sesión caída.
const esEndpointPublico = (url: string): boolean => url.includes('/publico/');

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !esEndpointPublico(req.url)
      ) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
