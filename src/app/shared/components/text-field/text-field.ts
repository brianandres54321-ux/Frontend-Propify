import { Component, input } from '@angular/core';

let idSecuencial = 0;

// Envuelve un <input>/<select> proyectado (con clase form-control, controlado
// por el padre vía formControlName) con label + mensaje de error de Bootstrap.
@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
})
export class TextFieldComponent {
  public readonly label = input.required<string>();
  public readonly error = input<string | null>(null);
  public readonly hint = input<string | null>(null);
  public readonly id = `text-field-${idSecuencial++}`;
}
