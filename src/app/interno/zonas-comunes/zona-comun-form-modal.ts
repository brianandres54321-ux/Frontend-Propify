import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ZonaComun } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { MonedaInputDirective } from '@shared/directives';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-zona-comun-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent, MonedaInputDirective],
  templateUrl: './zona-comun-form-modal.html',
  styleUrl: './zona-comun-form-modal.scss',
})
export class ZonaComunFormModal {
  public modo: 'crear' | 'editar' = 'crear';
  public zonaExistente: ZonaComun | null = null;

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      nombre: fb.control('', [Validators.required, Validators.maxLength(250)]),
      precio: fb.control<number | null>(0, [Validators.min(0)]),
      capacidad: fb.control<number | null>(null, [Validators.min(1)]),
      horaApertura: fb.control('', [Validators.pattern(REGEX_HORA)]),
      horaCierre: fb.control('', [Validators.pattern(REGEX_HORA)]),
      activa: fb.control(true),
    });
  }

  public precargar(zona: ZonaComun): void {
    this.form.patchValue({
      nombre: zona.nombre,
      precio: Number(zona.precio),
      capacidad: zona.capacidad ?? null,
      horaApertura: zona.horaApertura ?? '',
      horaCierre: zona.horaCierre ?? '',
      activa: zona.activa,
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    this.activeModal.close({
      nombre: datos.nombre,
      precio: datos.precio ?? undefined,
      capacidad: datos.capacidad ?? undefined,
      horaApertura: datos.horaApertura || undefined,
      horaCierre: datos.horaCierre || undefined,
      activa: this.modo === 'editar' ? datos.activa : undefined,
    });
  }
}
