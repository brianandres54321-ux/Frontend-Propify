import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PlanTipo, Tenant } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

const LIMITES_PLAN: Record<PlanTipo, { inmuebles: string; unidades: string }> = {
  [PlanTipo.CASAS]: { inmuebles: '1', unidades: '12' },
  [PlanTipo.EDIFICIOS]: { inmuebles: '1', unidades: '120' },
  [PlanTipo.CONJUNTOS]: { inmuebles: 'ilimitado', unidades: 'ilimitado' },
};

@Component({
  selector: 'app-tenant-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './tenant-form-modal.html',
  styleUrl: './tenant-form-modal.scss',
})
export class TenantFormModal implements OnInit {
  public tenant: Tenant | null = null;

  protected readonly PlanTipo = PlanTipo;
  protected readonly planes = Object.values(PlanTipo);

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly fb: NonNullableFormBuilder,
  ) {
    this.form = this.fb.group({
      nombre: this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(250)]),
      plan: this.fb.control<PlanTipo>(PlanTipo.CASAS),
      pagado: this.fb.control(false),
      activo: this.fb.control(true),
      limiteInmuebles: this.fb.control<number | null>(null),
      limiteUnidades: this.fb.control<number | null>(null),
    });
  }

  protected get modoEdicion(): boolean {
    return this.tenant !== null;
  }

  protected get limitesDelPlan(): { inmuebles: string; unidades: string } {
    return LIMITES_PLAN[this.form.controls.plan.value];
  }

  ngOnInit(): void {
    if (!this.tenant) {
      return;
    }
    this.form.patchValue({
      nombre: this.tenant.nombre,
      plan: this.tenant.plan,
      pagado: this.tenant.pagado,
      activo: this.tenant.activo,
      limiteInmuebles: this.tenant.limiteInmuebles ?? null,
      limiteUnidades: this.tenant.limiteUnidades ?? null,
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    if (!this.modoEdicion) {
      this.activeModal.close({ nombre: v.nombre.trim(), plan: v.plan });
      return;
    }

    // En edición se manda todo, incluyendo `null` explícito para limpiar un
    // límite manual (el backend lo interpreta como "volver al límite del plan").
    this.activeModal.close({
      nombre: v.nombre.trim(),
      plan: v.plan,
      pagado: v.pagado,
      activo: v.activo,
      limiteInmuebles: v.limiteInmuebles === null ? null : Number(v.limiteInmuebles),
      limiteUnidades: v.limiteUnidades === null ? null : Number(v.limiteUnidades),
    });
  }
}
