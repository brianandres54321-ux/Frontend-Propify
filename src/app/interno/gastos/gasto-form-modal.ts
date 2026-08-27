import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Gasto } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { MonedaInputDirective } from '@shared/directives';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-gasto-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent, MonedaInputDirective],
  templateUrl: './gasto-form-modal.html',
  styleUrl: './gasto-form-modal.scss',
})
export class GastoFormModal {
  public modo: 'crear' | 'editar' = 'crear';
  public gastoExistente: Gasto | null = null;

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      concepto: fb.control('', [Validators.required, Validators.maxLength(250)]),
      monto: fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      fecha: fb.control(hoyIso()),
      categoria: fb.control(''),
    });
  }

  public precargar(gasto: Gasto): void {
    this.form.patchValue({
      concepto: gasto.concepto,
      monto: Number(gasto.monto),
      fecha: gasto.fecha.slice(0, 10),
      categoria: gasto.categoria ?? '',
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    this.activeModal.close({
      concepto: datos.concepto,
      monto: datos.monto!,
      fecha: datos.fecha || undefined,
      categoria: datos.categoria || undefined,
    });
  }
}
