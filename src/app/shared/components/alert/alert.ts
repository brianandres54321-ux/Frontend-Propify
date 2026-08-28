import { Component, input } from '@angular/core';

export type AlertVariant = 'danger' | 'success' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class AlertComponent {
  public readonly variant = input<AlertVariant>('danger');
}
