import { Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle';

// Navbar público: sólido siempre (con blur). En móvil los enlaces se
// colapsan detrás de un botón de menú.
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private readonly router = inject(Router);

  protected readonly menuAbierto = signal(false);

  constructor() {
    // Cerrar el menú al navegar.
    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuAbierto.set(false));

    // Bloquear el scroll del fondo mientras el menú móvil está abierto.
    effect((onCleanup) => {
      if (this.menuAbierto()) {
        document.body.style.overflow = 'hidden';
        onCleanup(() => {
          document.body.style.overflow = '';
        });
      }
    });
  }
}
