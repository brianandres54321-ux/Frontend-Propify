import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
// Mismo set que StatCardColor — reutiliza los tokens --color-{nombre}/-bg
// que ya existen para badges y stat-cards, en vez de inventar unos nuevos.
export type ButtonColor = 'primary' | 'warning' | 'danger' | 'success' | 'info';

const CLASE_POR_VARIANTE: Record<Exclude<ButtonVariant, 'icon'>, string> = {
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
  // Solo aplica cuando variant() === 'icon' — botón redondo compacto para
  // acciones de fila en tablas (editar, eliminar) con color semántico.
  public readonly color = input<ButtonColor>('primary');
  // Ícono de bootstrap-icons (sin el prefijo "bi-"). En variant='icon' es
  // el único contenido del botón; en los demás variants se antepone al
  // contenido proyectado.
  public readonly icono = input<string | null>(null);
  public readonly type = input<'button' | 'submit'>('button');
  public readonly disabled = input(false);
  public readonly loading = input(false);
  public readonly fullWidth = input(true);

  protected readonly claseBoton = computed(() => {
    if (this.variant() === 'icon') {
      return `btn-icon btn-icon--${this.color()}`;
    }
    const variante = this.variant() as Exclude<ButtonVariant, 'icon'>;
    return `btn ${CLASE_POR_VARIANTE[variante]} ${this.fullWidth() ? 'w-100' : ''}`;
  });
}
