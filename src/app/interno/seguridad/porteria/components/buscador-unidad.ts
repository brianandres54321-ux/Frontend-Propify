import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, debounceTime, distinctUntilChanged, filter, map, merge } from 'rxjs';

import { UnidadPanorama } from '@core/models';

function normalizar(texto: string): string {
  return (texto ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Buscador de unidad por texto (nombre de residente, apto o torre) para los
// modales de portería. Sustituye al <select> — en un edificio grande buscar
// en una lista desplegable es lento. Emite la UnidadPanorama elegida, o null
// mientras el texto no corresponda a una selección.
@Component({
  selector: 'app-buscador-unidad',
  imports: [FormsModule, NgbTypeahead],
  templateUrl: './buscador-unidad.html',
  styleUrl: './buscador-unidad.scss',
})
export class BuscadorUnidadComponent {
  public readonly unidades = input.required<UnidadPanorama[]>();
  public readonly invalido = input(false);
  public readonly seleccion = output<UnidadPanorama | null>();

  private readonly typeahead = viewChild.required(NgbTypeahead);
  protected readonly foco$ = new Subject<string>();
  protected readonly clic$ = new Subject<string>();

  protected valor: UnidadPanorama | string = '';

  protected readonly buscar = (texto$: Observable<string>): Observable<UnidadPanorama[]> => {
    const escrito$ = texto$.pipe(debounceTime(150), distinctUntilChanged());
    const clics$ = this.clic$.pipe(filter(() => !this.typeahead().isPopupOpen()));
    return merge(escrito$, this.foco$, clics$).pipe(map((texto) => this.filtrar(texto)));
  };

  protected readonly formato = (unidad: UnidadPanorama): string => this.etiqueta(unidad);

  private filtrar(texto: string): UnidadPanorama[] {
    const q = normalizar((texto ?? '').trim());
    const lista = this.unidades();
    const filtradas = q ? lista.filter((u) => normalizar(this.indexable(u)).includes(q)) : lista;
    return filtradas.slice(0, 12);
  }

  private indexable(unidad: UnidadPanorama): string {
    return [
      unidad.identificador,
      unidad.torre ?? '',
      ...unidad.residentes.map((r) => r.nombre),
    ].join(' ');
  }

  private etiqueta(unidad: UnidadPanorama): string {
    const base = unidad.torre ? `${unidad.torre} · ${unidad.identificador}` : unidad.identificador;
    const residentes = unidad.residentes.map((r) => r.nombre).join(', ');
    return residentes ? `${base} — ${residentes}` : base;
  }

  protected elegir(evento: NgbTypeaheadSelectItemEvent): void {
    this.valor = evento.item as UnidadPanorama;
    this.seleccion.emit(this.valor);
  }

  protected alEscribir(): void {
    if (typeof this.valor === 'string') {
      this.seleccion.emit(null);
    }
  }
}
