import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TipoUnidad, Unidad } from '../../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TextFieldComponent } from '../../../shared/components/text-field/text-field';

const ETIQUETAS_TIPO: Record<TipoUnidad, string> = {
  [TipoUnidad.APARTAMENTO]: 'Apartamento',
  [TipoUnidad.APARTAESTUDIO]: 'Apartaestudio',
  [TipoUnidad.HABITACION]: 'Habitación / Pieza',
  [TipoUnidad.LOCAL]: 'Local comercial',
  [TipoUnidad.OFICINA]: 'Oficina',
};

// Nota: usa propiedades planas (no input() signal), igual que
// InmuebleFormModal — NgbModal asigna los datos imperativamente vía
// componentInstance al abrir el modal.
@Component({
  selector: 'app-unidad-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './unidad-form-modal.html',
  styleUrl: './unidad-form-modal.scss',
})
export class UnidadFormModal {
  public modo: 'crear' | 'editar' = 'crear';

  protected readonly opcionesTipo = Object.values(TipoUnidad).map((valor) => ({
    valor,
    etiqueta: ETIQUETAS_TIPO[valor],
  }));

  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      identificador: fb.control('', [Validators.required, Validators.maxLength(100)]),
      tipo: fb.control<TipoUnidad>(TipoUnidad.APARTAMENTO),
      piso: fb.control<number | null>(null),
      areaM2: fb.control<number | null>(null),
    });
  }

  public precargar(unidad: Unidad): void {
    this.form.patchValue({
      identificador: unidad.identificador,
      tipo: unidad.tipo,
      piso: unidad.piso ?? null,
      areaM2: unidad.areaM2 ?? null,
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { piso, areaM2, ...resto } = this.form.getRawValue();
    this.activeModal.close({
      ...resto,
      piso: piso ?? undefined,
      areaM2: areaM2 ?? undefined,
    });
  }
}
