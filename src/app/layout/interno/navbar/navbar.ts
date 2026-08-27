import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { LayoutService } from '@shared/services/layout.service';
import { ButtonComponent } from '@shared/components/button/button';
import { NotificacionesBellComponent } from '@shared/components/notificaciones-bell/notificaciones-bell';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-navbar',
  imports: [ButtonComponent, NotificacionesBellComponent, ThemeToggleComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly layout = inject(LayoutService);
  private readonly router = inject(Router);

  protected readonly iniciales = computed(() => {
    const nombre = this.auth.sesion()?.name ?? '';
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('');
  });

  protected toggleSidebarMovil(): void {
    this.layout.toggleMovil();
  }

  protected toggleSidebarColapsado(): void {
    this.layout.toggleColapsado();
  }

  protected cerrarSesion(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
