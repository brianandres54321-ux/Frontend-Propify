import { Component, HostListener, computed, effect, input, signal } from '@angular/core';

// Galería de fotos estilo marketplace: rail de miniaturas al lado, imagen
// principal con zoom al pasar el mouse, flechas de navegación y un lightbox
// a pantalla completa (con su propio zoom por clic). Recibe URLs ya armadas.
@Component({
  selector: 'app-galeria-fotos',
  templateUrl: './galeria-fotos.html',
  styleUrl: './galeria-fotos.scss',
})
export class GaleriaFotosComponent {
  public readonly fotos = input.required<string[]>();
  public readonly alt = input('');

  protected readonly indice = signal(0);
  protected readonly lightbox = signal(false);
  protected readonly hoverZoom = signal(false);
  protected readonly zoomLightbox = signal(false);
  protected readonly zoomPos = signal<{ x: number; y: number }>({ x: 50, y: 50 });

  protected readonly total = computed(() => this.fotos().length);
  protected readonly fotoActual = computed(
    () => this.fotos()[this.indice()] ?? this.fotos()[0] ?? '',
  );

  constructor() {
    // Bloquea el scroll del fondo mientras el lightbox está abierto.
    effect((onCleanup) => {
      if (this.lightbox()) {
        document.body.style.overflow = 'hidden';
        onCleanup(() => {
          document.body.style.overflow = '';
        });
      }
    });
    // Si cambian las fotos (otra unidad), vuelve a la primera.
    effect(() => {
      this.fotos();
      this.indice.set(0);
    });
  }

  protected seleccionar(i: number): void {
    this.indice.set(Math.max(0, Math.min(i, this.total() - 1)));
  }

  protected anterior(): void {
    const n = this.total();
    if (n > 0) {
      this.indice.update((i) => (i - 1 + n) % n);
    }
  }

  protected siguiente(): void {
    const n = this.total();
    if (n > 0) {
      this.indice.update((i) => (i + 1) % n);
    }
  }

  protected abrirLightbox(): void {
    this.zoomLightbox.set(false);
    this.lightbox.set(true);
  }

  protected cerrarLightbox(): void {
    this.lightbox.set(false);
  }

  protected moverZoom(evento: MouseEvent): void {
    const el = evento.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    this.zoomPos.set({
      x: ((evento.clientX - r.left) / r.width) * 100,
      y: ((evento.clientY - r.top) / r.height) * 100,
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected alPresionarTecla(evento: KeyboardEvent): void {
    if (this.lightbox()) {
      if (evento.key === 'Escape') {
        this.cerrarLightbox();
      } else if (evento.key === 'ArrowLeft') {
        this.anterior();
      } else if (evento.key === 'ArrowRight') {
        this.siguiente();
      }
    }
  }
}
