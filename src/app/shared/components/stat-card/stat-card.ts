import { Component, input } from '@angular/core';

export type StatCardColor = 'primary' | 'warning' | 'danger' | 'success' | 'info';
export type StatCardVariant = 'solid' | 'soft';

// Tarjeta de resumen para dashboards: ícono en círculo, valor grande y un
// texto de tendencia opcional abajo. "solid" pinta todo el fondo del color
// (para destacar la métrica principal); "soft" es fondo blanco con el
// ícono en un chip de color (para métricas secundarias).
@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCardComponent {
  public readonly titulo = input.required<string>();
  public readonly valor = input.required<string | number>();
  public readonly icono = input.required<string>();
  public readonly color = input<StatCardColor>('primary');
  public readonly variante = input<StatCardVariant>('soft');
  public readonly tendenciaTexto = input<string | null>(null);
  public readonly tendenciaIcono = input('arrow-up-right');
}
