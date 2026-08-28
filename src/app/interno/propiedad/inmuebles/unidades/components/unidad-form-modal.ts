import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EstadoOcupacionUnidad, TipoUnidad, Unidad } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { MonedaInputDirective } from '@shared/directives';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

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
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent, MonedaInputDirective],
  templateUrl: './unidad-form-modal.html',
  styleUrl: './unidad-form-modal.scss',
})
export class UnidadFormModal {
  public modo: 'crear' | 'editar' = 'crear';

  protected readonly EstadoOcupacionUnidad = EstadoOcupacionUnidad;
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
      estadoOcupacion: fb.control<EstadoOcupacionUnidad>(EstadoOcupacionUnidad.OCUPADA),
      precioArriendo: fb.control<number | null>(null),
      enVenta: fb.control(false),
      precioVenta: fb.control<number | null>(null),
      numeroCuartos: fb.control<number | null>(null),
      numeroBanos: fb.control<number | null>(null),
      tieneComedor: fb.control(false),
      tieneSala: fb.control(false),
      tieneCocina: fb.control(false),
      amoblado: fb.control(false),
    });
  }

  public precargar(unidad: Unidad): void {
    this.form.patchValue({
      identificador: unidad.identificador,
      tipo: unidad.tipo,
      piso: unidad.piso ?? null,
      // areaM2 y precioArriendo llegan como string desde la API (columnas
      // numeric de Postgres) — hay que convertirlos o el PUT falla la
      // validación (@IsNumber/@Min) al reenviar el valor sin tocarlo.
      areaM2: unidad.areaM2 != null ? Number(unidad.areaM2) : null,
      estadoOcupacion: unidad.estadoOcupacion,
      precioArriendo: unidad.precioArriendo != null ? Number(unidad.precioArriendo) : null,
      enVenta: unidad.enVenta ?? false,
      precioVenta: unidad.precioVenta != null ? Number(unidad.precioVenta) : null,
      numeroCuartos: unidad.numeroCuartos ?? null,
      numeroBanos: unidad.numeroBanos ?? null,
      tieneComedor: unidad.tieneComedor,
      tieneSala: unidad.tieneSala,
      tieneCocina: unidad.tieneCocina,
      amoblado: unidad.amoblado,
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const {
      piso,
      areaM2,
      precioArriendo,
      precioVenta,
      numeroCuartos,
      numeroBanos,
      ...resto
    } = this.form.getRawValue();
    this.activeModal.close({
      ...resto,
      piso: piso ?? undefined,
      areaM2: areaM2 ?? undefined,
      precioArriendo: precioArriendo ?? undefined,
      precioVenta: resto.enVenta ? (precioVenta ?? undefined) : undefined,
      numeroCuartos: numeroCuartos ?? undefined,
      numeroBanos: numeroBanos ?? undefined,
    });
  }
}
