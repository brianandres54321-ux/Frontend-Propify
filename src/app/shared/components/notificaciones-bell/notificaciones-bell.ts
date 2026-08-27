import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { AlertasService } from '@core/services/alertas.service';

// Campana de notificaciones del navbar interno — reutiliza AlertasService
// (misma lista que la tarjeta "Alertas" del dashboard) para no mantener dos
// fuentes de verdad de qué cuenta como una alerta pendiente.
@Component({
  selector: 'app-notificaciones-bell',
  imports: [RouterLink, NgbDropdownModule],
  templateUrl: './notificaciones-bell.html',
  styleUrl: './notificaciones-bell.scss',
})
export class NotificacionesBellComponent {
  protected readonly alertasService = inject(AlertasService);
}
