import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly anio = new Date().getFullYear();

  // En "crear cuenta" el formulario pasa a la izquierda y la marca a la
  // derecha (espejo de login) — ver auth-layout.scss (.auth-layout--invertido).
  protected readonly esRegistro = signal(this.router.url.startsWith('/registro'));

  // Se pone en false y luego en true en el siguiente tick para forzar que
  // la animación de .auth-layout__centro se repita cada vez que se cambia
  // entre login/registro — el panel de marca no se destruye al navegar
  // (vive en este layout persistente), así que sin esto solo animaría una
  // vez, en la carga inicial.
  protected readonly pulso = signal(false);

  constructor() {
    this.dispararPulso();

    this.router.events
      .pipe(
        filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((evento) => {
        this.esRegistro.set(evento.urlAfterRedirects.startsWith('/registro'));
        this.dispararPulso();
      });
  }

  private dispararPulso(): void {
    this.pulso.set(false);
    setTimeout(() => this.pulso.set(true), 0);
  }
}
