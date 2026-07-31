import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Inmueble } from '../../core/models';
import { ButtonComponent } from '../../shared/components/button/button';
import { TextFieldComponent } from '../../shared/components/text-field/text-field';

// Nota: usa propiedades planas (no input() signal), igual que
// ConfirmDialogComponent — NgbModal asigna los datos imperativamente vía
// componentInstance al abrir el modal, lo cual no es compatible con signals.
@Component({
  selector: 'app-inmueble-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './inmueble-form-modal.html',
  styleUrl: './inmueble-form-modal.scss',
})
export class InmuebleFormModal {
  public modo: 'crear' | 'editar' = 'crear';
  public inmuebleExistente: Inmueble | null = null;

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      nombre: fb.control('', [Validators.required, Validators.maxLength(250)]),
      direccion: fb.control('', [Validators.maxLength(500)]),
      tieneTorres: fb.control(false),
      tieneZonasComunes: fb.control(false),
      tieneParqueaderos: fb.control(false),
      tieneCelador: fb.control(false),
      tieneCartelera: fb.control(false),
    });
  }

  public precargar(inmueble: Inmueble): void {
    this.form.patchValue({
      nombre: inmueble.nombre,
      direccion: inmueble.direccion ?? '',
      tieneTorres: inmueble.tieneTorres,
      tieneZonasComunes: inmueble.tieneZonasComunes,
      tieneParqueaderos: inmueble.tieneParqueaderos,
      tieneCelador: inmueble.tieneCelador,
      tieneCartelera: inmueble.tieneCartelera,
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.activeModal.close(this.form.getRawValue());
  }
}
