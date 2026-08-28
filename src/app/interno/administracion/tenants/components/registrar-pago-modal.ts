import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PlanTipo, Tenant } from '@core/models';
import { PRECIO_PLAN_MENSUAL } from '@core/constants';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

const METODOS_PAGO = ['Transferencia', 'Nequi', 'Daviplata', 'PSE', 'Efectivo', 'Otro'] as const;

const PRECIOS = Object.values(PRECIO_PLAN_MENSUAL);

// Registro manual del pago de un cliente (no hay pasarela). Marca el tenant
// como `pagado`, deja constancia de monto/fecha/método y, de paso, permite
// fijar el plan contratado. El monto se propone desde el precio del plan y se
// puede editar (descuento, pago anual, etc.).
@Component({
  selector: 'app-registrar-pago-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './registrar-pago-modal.html',
})
export class RegistrarPagoModal implements OnInit {
  public tenant!: Tenant;

  private readonly destroyRef = inject(DestroyRef);

  protected readonly PlanTipo = PlanTipo;
  protected readonly metodos = METODOS_PAGO;
  protected readonly precios = PRECIO_PLAN_MENSUAL;

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
    this.form.patchValue({
      plan: this.tenant.plan,
      montoPago: PRECIO_PLAN_MENSUAL[this.tenant.plan],
    });

    // Al cambiar de plan, re-sugiere el monto — pero solo si el que hay
    // todavía es un precio de lista (el superadmin no lo tocó a mano).
    this.form.controls.plan.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((plan) => {
        const actual = this.form.controls.montoPago.value;
        if (actual == null || PRECIOS.includes(actual)) {
          this.form.controls.montoPago.setValue(PRECIO_PLAN_MENSUAL[plan]);
        }
      });
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
