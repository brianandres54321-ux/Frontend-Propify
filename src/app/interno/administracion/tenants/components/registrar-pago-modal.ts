import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PlanTipo, Tenant } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

const METODOS_PAGO = ['Transferencia', 'Nequi', 'Daviplata', 'PSE', 'Efectivo', 'Otro'] as const;

// Registro manual del pago de un cliente (no hay pasarela). Marca el tenant
// como `pagado`, deja constancia de monto/fecha/método y, de paso, permite
// fijar el plan contratado.
@Component({
  selector: 'app-registrar-pago-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './registrar-pago-modal.html',
})
export class RegistrarPagoModal implements OnInit {
  public tenant!: Tenant;

  protected readonly PlanTipo = PlanTipo;
  protected readonly metodos = METODOS_PAGO;

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly fb: NonNullableFormBuilder,
  ) {
    const hoy = new Date().toISOString().slice(0, 10);
    this.form = this.fb.group({
      plan: this.fb.control<PlanTipo>(PlanTipo.CASAS),
      fechaPago: this.fb.control(hoy, [Validators.required]),
      montoPago: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      metodoPago: this.fb.control<string>('Transferencia', [Validators.required]),
      referenciaPago: this.fb.control(''),
    });
  }

  ngOnInit(): void {
    this.form.patchValue({ plan: this.tenant.plan });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.activeModal.close({
      pagado: true,
      plan: v.plan,
      fechaPago: v.fechaPago,
      montoPago: Number(v.montoPago),
      metodoPago: v.metodoPago,
      referenciaPago: v.referenciaPago.trim() || undefined,
    });
  }
}
