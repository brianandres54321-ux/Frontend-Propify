import { Component } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Residente } from '../../../../core/models';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { TextFieldComponent } from '../../../../shared/components/text-field/text-field';

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-residente-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './residente-form-modal.html',
  styleUrl: './residente-form-modal.scss',
})
export class ResidenteFormModal {
  public modo: 'crear' | 'editar' = 'crear';

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      nombre: fb.control('', [Validators.required, Validators.maxLength(250)]),
      telefono: fb.control('', [Validators.required, Validators.maxLength(30)]),
      correo: fb.control('', [Validators.email]),
      cedula: fb.control(''),
      esPropietario: fb.control(false),
      valorMensual: fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      diaPago: fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(31),
      ]),
      fechaInicio: fb.control(hoyIso()),
      fechaFin: fb.control(''),
    });
  }

  public precargar(residente: Residente): void {
    this.form.patchValue({
      nombre: residente.nombre,
      telefono: residente.telefono,
      correo: residente.correo ?? '',
      cedula: residente.cedula ?? '',
      esPropietario: residente.esPropietario,
      // El backend devuelve valorMensual como string (columna `numeric` de
      // Postgres) — hay que forzar Number() o se reenvía como string y el
      // ValidationPipe del backend lo rechaza al guardar sin tocar el campo.
      valorMensual: Number(residente.valorMensual),
      diaPago: residente.diaPago,
      fechaInicio: residente.fechaInicio?.slice(0, 10) ?? hoyIso(),
      fechaFin: residente.fechaFin?.slice(0, 10) ?? '',
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // fechaInicio solo se acepta al crear — ActualizarResidenteDto no la
    // tiene, y el backend rechaza cualquier campo no esperado (whitelist).
    const { fechaInicio, ...datos } = this.form.getRawValue();
    this.activeModal.close({
      ...datos,
      ...(this.modo === 'crear' ? { fechaInicio } : {}),
      correo: datos.correo || undefined,
      cedula: datos.cedula || undefined,
      fechaFin: datos.fechaFin || undefined,
      valorMensual: datos.valorMensual!,
      diaPago: datos.diaPago!,
    });
  }
}
