import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UnidadPanorama } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

import { BuscadorUnidadComponent } from './buscador-unidad';

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-paquete-form-modal',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    TextFieldComponent,
    BuscadorUnidadComponent,
  ],
  templateUrl: './paquete-form-modal.html',
  styleUrl: './paquete-form-modal.scss',
})
export class PaqueteFormModal {
  public unidades: UnidadPanorama[] = [];

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      codUnidad: fb.control<number | null>(null, [Validators.required]),
      descripcion: fb.control('', [Validators.maxLength(500)]),
    });
  }

  protected get unidadElegida(): UnidadPanorama | undefined {
    const cod = this.form.controls.codUnidad.value;
    return this.unidades.find((u) => u.codUnidad === cod);
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
    this.activeModal.close({
      codUnidad: datos.codUnidad!,
      descripcion: datos.descripcion.trim() || undefined,
    });
  }
}
