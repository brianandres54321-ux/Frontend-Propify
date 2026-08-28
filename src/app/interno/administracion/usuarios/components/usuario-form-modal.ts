import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { etiquetaRol } from '@core/constants';
import { Rol, UsuarioResumen } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

// Misma política que valida el backend (ver password-policy.ts) — validarla
// también aquí evita el viaje al servidor solo para descubrir que la clave
// no cumple el formato.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;

export interface UsuarioFormResultado {
  nombreUsuario: string;
  correoUsuario: string;
  codRol: number;
  // En alta siempre viene; en edición solo si se quiere cambiar la contraseña.
  claveAcceso?: string;
}

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal. Sirve tanto
// para crear (usuario = null) como para editar (usuario con datos).
@Component({
  selector: 'app-usuario-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './usuario-form-modal.html',
  styleUrl: './usuario-form-modal.scss',
})
export class UsuarioFormModal implements OnInit {
  public roles: Rol[] = [];
  public usuario: UsuarioResumen | null = null;

  protected readonly etiquetaRol = etiquetaRol;

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      nombreUsuario: fb.control('', [Validators.required, Validators.maxLength(100)]),
      correoUsuario: fb.control('', [Validators.required, Validators.email]),
      // En alta la contraseña es obligatoria; en edición se ajusta en ngOnInit.
      claveAcceso: fb.control('', [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
      codRol: fb.control<number | null>(null, [Validators.required]),
    });
  }

  protected get modoEdicion(): boolean {
    return this.usuario !== null;
  }

  ngOnInit(): void {
    if (!this.usuario) {
      return;
    }
    // Editar: la contraseña pasa a ser opcional (vacía = no se cambia). El
    // validador de patrón se queda: si escriben algo, tiene que cumplir.
    this.form.controls.claveAcceso.removeValidators(Validators.required);
    this.form.controls.claveAcceso.updateValueAndValidity();
    this.form.patchValue({
      nombreUsuario: this.usuario.nombre_usuario,
      correoUsuario: this.usuario.correo_usuario,
      codRol: this.usuario.cod_rol,
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    const resultado: UsuarioFormResultado = {
      nombreUsuario: datos.nombreUsuario,
      correoUsuario: datos.correoUsuario,
      codRol: datos.codRol!,
    };
    if (datos.claveAcceso) {
      resultado.claveAcceso = datos.claveAcceso;
    }
    this.activeModal.close(resultado);
  }
}
