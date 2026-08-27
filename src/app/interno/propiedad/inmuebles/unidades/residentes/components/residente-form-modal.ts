import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Residente } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { MonedaInputDirective } from '@shared/directives';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function sumarMeses(fechaIso: string, meses: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00`);
  fecha.setMonth(fecha.getMonth() + meses);
  return fecha.toISOString().slice(0, 10);
}

// Celular colombiano: siempre 10 dígitos.
const TELEFONO_REGEX = /^\d{10}$/;

// Duraciones comunes de contrato. "" = sin fecha de fin (indefinido),
// "personalizada" = el dueño escribe la fecha directo. El resto calcula
// fechaFin = fechaInicio + N meses — el backend sigue guardando solo la
// fecha, esto es puramente una comodidad de captura en el frontend.
const OPCIONES_DURACION = [
  { valor: '', etiqueta: 'Sin fecha de fin' },
  { valor: '1', etiqueta: '1 mes' },
  { valor: '2', etiqueta: '2 meses' },
  { valor: '3', etiqueta: '3 meses' },
  { valor: '6', etiqueta: '6 meses' },
  { valor: '12', etiqueta: '12 meses' },
  { valor: 'personalizada', etiqueta: 'Fecha personalizada' },
];

// Nota: usa propiedades planas (no input() signal) — NgbModal asigna los
// datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-residente-form-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent, MonedaInputDirective],
  templateUrl: './residente-form-modal.html',
  styleUrl: './residente-form-modal.scss',
})
export class ResidenteFormModal {
  public modo: 'crear' | 'editar' = 'crear';

  protected readonly opcionesDuracion = OPCIONES_DURACION;
  protected readonly form;

  constructor(
    public readonly activeModal: NgbActiveModal,
    fb: NonNullableFormBuilder,
  ) {
    this.form = fb.group({
      nombre: fb.control('', [Validators.required, Validators.maxLength(250)]),
      telefono: fb.control('', [Validators.required, Validators.pattern(TELEFONO_REGEX)]),
      correo: fb.control('', [Validators.required, Validators.email]),
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
      // Campo solo de UI, no se envía al backend.
      duracionContrato: fb.control(''),
    });

    this.form.controls.duracionContrato.valueChanges.subscribe((duracion) => {
      if (duracion === '' || duracion === 'personalizada') {
        if (duracion === '') {
          this.form.controls.fechaFin.setValue('');
        }
        return;
      }
      const fechaInicio = this.form.controls.fechaInicio.value || hoyIso();
      this.form.controls.fechaFin.setValue(sumarMeses(fechaInicio, Number(duracion)));
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
      // No se puede reconstruir una duración a partir de dos fechas de forma
      // confiable (meses de distinta longitud) — al editar, la fecha de fin
      // ya cargada se trata siempre como "personalizada".
      duracionContrato: residente.fechaFin ? 'personalizada' : '',
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // fechaInicio solo se acepta al crear — ActualizarResidenteDto no la
    // tiene, y el backend rechaza cualquier campo no esperado (whitelist).
    const { fechaInicio, duracionContrato, ...datos } = this.form.getRawValue();
    void duracionContrato;
    this.activeModal.close({
      ...datos,
      ...(this.modo === 'crear' ? { fechaInicio } : {}),
      cedula: datos.cedula || undefined,
      fechaFin: datos.fechaFin || undefined,
      valorMensual: datos.valorMensual!,
      diaPago: datos.diaPago!,
    });
  }
}
