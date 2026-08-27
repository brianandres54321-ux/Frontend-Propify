import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle';

function urlBase(url: string): string {
  return url.split('#')[0].split('?')[0];
}

// Navbar público: transparente sobre el hero de "/" (texto blanco, sin
// fondo) y se vuelve sólido + con blur apenas se hace scroll o se entra a
// cualquier otra página — el patrón típico de landing pages "premium".
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly enInicio = signal(urlBase(this.router.url) === '/');
  protected readonly scrolleado = signal(
    typeof window !== 'undefined' ? window.scrollY > 40 : false,
  );

  protected readonly transparente = computed(() => this.enInicio() && !this.scrolleado());

  constructor() {
    this.router.events
      .pipe(
        filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((evento) => {
        this.enInicio.set(urlBase(evento.urlAfterRedirects) === '/');
      });
  }

  @HostListener('window:scroll')
  protected alScrollear(): void {
    this.scrolleado.set(window.scrollY > 40);
  }
}
