import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CuentaResumen } from '../../core/models';
import { ButtonComponent } from '../../shared/components/button/button';
import { MonedaInputDirective } from '../../shared/directives/moneda-input.directive';
import { TextFieldComponent } from '../../shared/components/text-field/text-field';

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Los montos de CuentaResumen vienen de columnas `numeric` de Postgres —
// pueden llegar como string; Number() antes de formatear.
export function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

const OPCIONES_METODO = ['Efectivo', 'Transferencia', 'Consignación', 'Otro'];

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-pago-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent, MonedaInputDirective],
  templateUrl: './pago-form-modal.html',
  styleUrl: './pago-form-modal.scss',
})
export class PagoFormModal {
  public cuenta!: CuentaResumen;

  protected readonly opcionesMetodo = OPCIONES_METODO;
  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      monto: fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      fecha: fb.control(hoyIso()),
      metodo: fb.control(OPCIONES_METODO[0]),
      referencia: fb.control(''),
    });
  }

  protected get saldoPendiente(): number {
    return Number(this.cuenta.total) - Number(this.cuenta.totalPagado);
  }

  protected readonly formatoMonto = formatoMonto;

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    this.activeModal.close({
      monto: datos.monto!,
      fecha: datos.fecha || undefined,
      metodo: datos.metodo || undefined,
      referencia: datos.referencia || undefined,
    });
  }
}
