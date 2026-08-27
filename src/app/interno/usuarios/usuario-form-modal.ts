import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Rol } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Misma política que valida el backend (ver password-policy.ts) — validarla
// también aquí evita el viaje al servidor solo para descubrir que la clave
// no cumple el formato.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-usuario-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './usuario-form-modal.html',
  styleUrl: './usuario-form-modal.scss',
})
export class UsuarioFormModal {
  public roles: Rol[] = [];

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      nombreUsuario: fb.control('', [Validators.required, Validators.maxLength(100)]),
      correoUsuario: fb.control('', [Validators.required, Validators.email]),
      claveAcceso: fb.control('', [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
      codRol: fb.control<number | null>(null, [Validators.required]),
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    this.activeModal.close({
      nombreUsuario: datos.nombreUsuario,
      correoUsuario: datos.correoUsuario,
      claveAcceso: datos.claveAcceso,
      codRol: datos.codRol!,
    });
  }
}
