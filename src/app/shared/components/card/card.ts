import { Component, input } from '@angular/core';

// Envuelve .card de Bootstrap. El título es opcional (input); el cuerpo y
// un footer opcional se proyectan con ng-content usando selectores de slot.
@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class CardComponent {
  public readonly titulo = input<string | null>(null);
  // No hay forma limpia de detectar contenido proyectado en un slot sin
  // ContentChild; por simplicidad el padre indica explícitamente si lo usa.
  public readonly tieneFooter = input(false);
}
