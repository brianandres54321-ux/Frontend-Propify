import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const CLASE_POR_VARIANTE: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-outline-secondary',
  ghost: 'btn-link p-0',
};

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class ButtonComponent {
  public readonly variant = input<ButtonVariant>('primary');
  public readonly type = input<'button' | 'submit'>('button');
  public readonly disabled = input(false);
  public readonly loading = input(false);
  public readonly fullWidth = input(true);

  protected readonly claseBoton = computed(
    () => `btn ${CLASE_POR_VARIANTE[this.variant()]} ${this.fullWidth() ? 'w-100' : ''}`,
  );
}
