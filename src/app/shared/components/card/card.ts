import { Component, input } from '@angular/core';

export type CardVariant = 'default' | 'primary' | 'warning' | 'danger' | 'success';

// Envuelve .card de Bootstrap. El título es opcional (input); el cuerpo y
// un footer opcional se proyectan con ng-content usando selectores de slot.
// `variante` pinta un acento de color (borde + ícono) para diferenciar
// tarjetas de contenido neutro de las que señalan alertas o estados.
@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  host: {
    // El host (no solo el .card interno) también necesita perder el
    // height:100% pensado para grids de altura pareja — si no, una card
    // "autoAltura" suelta en el flujo normal hereda una altura absurda de
    // algún ancestro con altura definida (ver dashboard "Contratos por
    // vencer", que vive fuera de cualquier grid).
    '[class.card-host--auto]': 'autoAltura()',
  },
})
export class CardComponent {
  public readonly titulo = input<string | null>(null);
  public readonly icono = input<string | null>(null);
  public readonly variante = input<CardVariant>('default');
  // No hay forma limpia de detectar contenido proyectado en un slot sin
  // ContentChild; por simplicidad el padre indica explícitamente si lo usa.
  public readonly tieneFooter = input(false);
  // Por defecto la card estira a 100% de su contenedor (pensado para grids
  // de altura pareja, ej. dashboard__fila). Poner en true para una card
  // suelta en el flujo normal, donde 100% heredaría una altura arbitraria.
  public readonly autoAltura = input(false);
}
