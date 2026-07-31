import { Component, computed, input, output } from '@angular/core';

// Paginación client-side: el padre mantiene la página actual y le pasa el
// total de elementos; este componente solo calcula y emite. Útil porque la
// mayoría de los listados privados (GET /privado/...) devuelven el array
// completo sin paginar en el backend.
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class PaginationComponent {
  public readonly totalItems = input.required<number>();
  public readonly paginaActual = input.required<number>();
  public readonly tamanioPagina = input(10);

  public readonly paginaCambio = output<number>();

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.tamanioPagina())),
  );

  protected readonly paginasVisibles = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1),
  );

  protected readonly inicioRango = computed(
    () => (this.paginaActual() - 1) * this.tamanioPagina() + 1,
  );

  protected readonly finRango = computed(() =>
    Math.min(this.paginaActual() * this.tamanioPagina(), this.totalItems()),
  );

  protected irA(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas() && pagina !== this.paginaActual()) {
      this.paginaCambio.emit(pagina);
    }
  }
}
