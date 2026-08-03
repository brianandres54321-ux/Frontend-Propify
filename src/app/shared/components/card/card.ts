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
})
export class CardComponent {
  public readonly titulo = input<string | null>(null);
  public readonly icono = input<string | null>(null);
  public readonly variante = input<CardVariant>('default');
  // No hay forma limpia de detectar contenido proyectado en un slot sin
  // ContentChild; por simplicidad el padre indica explícitamente si lo usa.
  public readonly tieneFooter = input(false);
}
