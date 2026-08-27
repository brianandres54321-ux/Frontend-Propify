import { Component, inject } from '@angular/core';

import { ThemeService } from '@core/services/theme.service';

// Botón redondo con ícono de sol/luna — se usa en ambos navbars (público e
// interno). Reutilizable porque ThemeService ya centraliza todo el estado.
@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);

  protected alternar(): void {
    this.themeService.alternar();
  }
}
