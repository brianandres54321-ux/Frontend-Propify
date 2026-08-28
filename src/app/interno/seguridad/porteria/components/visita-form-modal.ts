import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UnidadPanorama } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { FirmaPadComponent } from '@shared/components/firma-pad/firma-pad';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

import { BuscadorUnidadComponent } from './buscador-unidad';

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-visita-form-modal',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    TextFieldComponent,
    BuscadorUnidadComponent,
    FirmaPadComponent,
  ],
  templateUrl: './visita-form-modal.html',
  styleUrl: './visita-form-modal.scss',
})
export class VisitaFormModal {
  public unidades: UnidadPanorama[] = [];

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      codUnidad: fb.control<number | null>(null, [Validators.required]),
      nombreVisitante: fb.control('', [Validators.required, Validators.maxLength(250)]),
      cedulaVisitante: fb.control(''),
      // Total del grupo, incluyendo a quien firma. 1 = visita individual.
      numeroPersonas: fb.control(1, [Validators.required, Validators.min(1), Validators.max(50)]),
      acompanantes: fb.control('', [Validators.maxLength(500)]),
      vehiculos: fb.control('', [Validators.maxLength(300)]),
      // data URL PNG de la firma manuscrita, o null.
      firma: fb.control<string | null>(null),
    });
  }

  protected get unidadElegida(): UnidadPanorama | undefined {
    const cod = this.form.controls.codUnidad.value;
    return this.unidades.find((u) => u.codUnidad === cod);
  }

  protected get esGrupo(): boolean {
    return (this.form.controls.numeroPersonas.value ?? 1) > 1;
  }

  protected elegirUnidad(unidad: UnidadPanorama | null): void {
    this.form.controls.codUnidad.setValue(unidad?.codUnidad ?? null);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    const numeroPersonas = Number(datos.numeroPersonas) || 1;
    this.activeModal.close({
      codUnidad: datos.codUnidad!,
      nombreVisitante: datos.nombreVisitante,
      cedulaVisitante: datos.cedulaVisitante || undefined,
      numeroPersonas,
      acompanantes:
        numeroPersonas > 1 && datos.acompanantes.trim() ? datos.acompanantes.trim() : undefined,
      vehiculos: datos.vehiculos.trim() || undefined,
      firma: datos.firma ?? undefined,
    });
  }
}
