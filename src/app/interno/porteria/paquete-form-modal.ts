import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-paquete-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './paquete-form-modal.html',
  styleUrl: './paquete-form-modal.scss',
})
export class PaqueteFormModal {
  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      descripcion: fb.control('', [Validators.maxLength(500)]),
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    this.activeModal.close({
      descripcion: datos.descripcion || undefined,
    });
  }
}
