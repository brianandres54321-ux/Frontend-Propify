import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-aviso-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './aviso-form-modal.html',
  styleUrl: './aviso-form-modal.scss',
})
export class AvisoFormModal {
  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      titulo: fb.control('', [Validators.required, Validators.maxLength(250)]),
      mensaje: fb.control('', [Validators.required, Validators.maxLength(5000)]),
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
