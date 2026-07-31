import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RolNombre } from '../constants/roles.constant';
import { AuthService } from '../services/auth.service';

// Uso: { path: 'usuarios', canActivate: [rolesGuard], data: { roles: [RoleNames.DUENO, RoleNames.ADMIN] } }
export const rolesGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = route.data['roles'] as RolNombre[] | undefined;
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  if (auth.tieneRol(...rolesPermitidos)) {
    return true;
  }

  return router.createUrlTree(['/app']);
};
