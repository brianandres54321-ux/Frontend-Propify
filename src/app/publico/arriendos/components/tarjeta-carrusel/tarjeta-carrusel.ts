import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

// Mini-carrusel para la tarjeta de resultados: imagen actual, flechas al
// pasar el mouse, puntos, contador ("2 / 5") y swipe en táctil. Toda la
// tarjeta enlaza al detalle; las flechas/puntos no disparan la navegación.
@Component({
  selector: 'app-tarjeta-carrusel',
  imports: [RouterLink],
  templateUrl: './tarjeta-carrusel.html',
  styleUrl: './tarjeta-carrusel.scss',
})
export class TarjetaCarruselComponent {
  public readonly fotos = input.required<string[]>();
  public readonly alt = input('');
  public readonly enlace = input<unknown[]>();

  protected readonly indice = signal(0);
  protected readonly total = computed(() => this.fotos().length);
  protected readonly actual = computed(() => this.fotos()[this.indice()] ?? '');

  private touchX: number | null = null;

  protected anterior(evento: Event): void {
    this.frenar(evento);
    const n = this.total();
    if (n > 1) {
      this.indice.update((i) => (i - 1 + n) % n);
    }
  }

  protected siguiente(evento: Event): void {
    this.frenar(evento);
    const n = this.total();
    if (n > 1) {
      this.indice.update((i) => (i + 1) % n);
    }
  }

  protected irA(evento: Event, i: number): void {
    this.frenar(evento);
    this.indice.set(i);
  }

  protected touchInicio(evento: TouchEvent): void {
    this.touchX = evento.changedTouches[0]?.clientX ?? null;
  }

  protected touchFin(evento: TouchEvent): void {
    if (this.touchX === null) {
      return;
    }
    const dx = (evento.changedTouches[0]?.clientX ?? this.touchX) - this.touchX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) {
        this.siguiente(evento);
      } else {
        this.anterior(evento);
      }
    }
    this.touchX = null;
  }

  private frenar(evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
  }
}
