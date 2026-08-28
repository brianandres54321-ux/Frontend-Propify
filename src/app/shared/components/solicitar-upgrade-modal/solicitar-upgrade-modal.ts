import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PlanTipo } from '@core/models';
import { mensajeErrorApi } from '@core/utils';
import { SolicitudesUpgradeService } from '@core/services/solicitudes-upgrade.service';
import { AlertComponent } from '../alert/alert';
import { ButtonComponent } from '../button/button';
import { TextFieldComponent } from '../text-field/text-field';

// Modal para que un DUEÑO en plan demo pida pasar a un plan pagado. No cobra
// nada: crea una solicitud que el superadministrador ve en su consola y luego
// contacta al cliente. Se abre vía SolicitarUpgradeDialogService.
@Component({
  selector: 'app-solicitar-upgrade-modal',
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, TextFieldComponent],
  templateUrl: './solicitar-upgrade-modal.html',
})
export class SolicitarUpgradeModal {
  public planActual: PlanTipo | null = null;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly solicitudesService = inject(SolicitudesUpgradeService);

  protected readonly PlanTipo = PlanTipo;
  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  protected readonly form = this.fb.group({
    planSolicitado: this.fb.control<PlanTipo | ''>(''),
    mensaje: this.fb.control(''),
  });

  constructor(public readonly activeModal: NgbActiveModal) {}

  protected enviar(): void {
    this.enviando.set(true);
    this.errorMensaje.set(null);
    const v = this.form.getRawValue();

    this.solicitudesService
      .crear({
        planSolicitado: v.planSolicitado || undefined,
        mensaje: v.mensaje.trim() || undefined,
      })
      .subscribe({
        next: (r) => {
          this.enviando.set(false);
          this.exito.set(r.mensaje);
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          this.errorMensaje.set(
            mensajeErrorApi(error, 'No se pudo enviar la solicitud. Intenta de nuevo.'),
          );
        },
      });
  }
}
