import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, TemplateRef, input, output } from '@angular/core';

import { TableColumn } from '../../interfaces/table-column.interface';
import { LoadingComponent } from '../loading/loading';

// Tabla genérica reutilizable. Las acciones por fila (editar/eliminar...) se
// proyectan con un <ng-template let-fila>, no con ng-content, porque
// ng-content no puede repetirse por item con un contexto distinto:
//
//   <app-table [columnas]="columnas" [filas]="filas">
//     <ng-template let-fila>
//       <app-button (click)="editar(fila)">Editar</app-button>
//     </ng-template>
//   </app-table>
@Component({
  selector: 'app-table',
  imports: [LoadingComponent, NgTemplateOutlet],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class TableComponent<T> {
  public readonly columnas = input.required<TableColumn<T>[]>();
  public readonly filas = input.required<T[]>();
  public readonly cargando = input(false);
  public readonly textoVacio = input('No hay datos para mostrar.');

  // Con `filasClicables`, cada fila emite `filaClick` al hacer clic (cursor +
  // rol de botón). Útil para listados que abren un detalle.
  public readonly filasClicables = input(false);
  public readonly filaClick = output<T>();

  @ContentChild(TemplateRef) protected accionesTemplate?: TemplateRef<{ $implicit: T }>;

  protected celda(fila: T, key: string): unknown {
    return (fila as Record<string, unknown>)[key];
  }
}
