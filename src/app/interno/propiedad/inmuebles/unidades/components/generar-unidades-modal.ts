import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EstadoOcupacionUnidad, GenerarUnidadesRequest, TipoUnidad } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button';
import { TextFieldComponent } from '@shared/components/text-field/text-field';

const ETIQUETAS_TIPO: Record<TipoUnidad, string> = {
  [TipoUnidad.APARTAMENTO]: 'Apartamento',
  [TipoUnidad.APARTAESTUDIO]: 'Apartaestudio',
  [TipoUnidad.HABITACION]: 'Habitación / Pieza',
  [TipoUnidad.LOCAL]: 'Local comercial',
  [TipoUnidad.OFICINA]: 'Oficina',
};

const MAX_LOTE = 300;
const PREVIEW_VISIBLE = 24;

// Alta masiva de unidades a partir de un patrón — ver
// POST /privado/unidades/lote. NgbModal asigna datos vía componentInstance,
// por eso no se usan input() signals.
@Component({
  selector: 'app-generar-unidades-modal',
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  templateUrl: './generar-unidades-modal.html',
  styleUrl: './generar-unidades-modal.scss',
})
export class GenerarUnidadesModal {
  public readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly EstadoOcupacionUnidad = EstadoOcupacionUnidad;
  protected readonly MAX_LOTE = MAX_LOTE;
  protected readonly opcionesTipo = Object.values(TipoUnidad).map((valor) => ({
    valor,
    etiqueta: ETIQUETAS_TIPO[valor],
  }));

  protected readonly form = this.fb.group({
    modo: this.fb.control<'pisos' | 'consecutivo'>('pisos'),
    prefijo: this.fb.control(''),
    tipo: this.fb.control<TipoUnidad>(TipoUnidad.APARTAMENTO),
    estadoOcupacion: this.fb.control<EstadoOcupacionUnidad>(EstadoOcupacionUnidad.OCUPADA),
    pisos: this.fb.control<number | null>(4),
    unidadesPorPiso: this.fb.control<number | null>(4),
    desde: this.fb.control<number | null>(1),
    hasta: this.fb.control<number | null>(12),
  });

  private readonly valores = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly identificadores = computed<string[]>(() => {
    const v = this.valores();
    const prefijo = v.prefijo ?? '';
    const salida: string[] = [];

    if (v.modo === 'pisos') {
      const pisos = this.acotar(v.pisos, 0, 80);
      const porPiso = this.acotar(v.unidadesPorPiso, 0, 50);
      for (let piso = 1; piso <= pisos; piso++) {
        for (let n = 1; n <= porPiso; n++) {
          salida.push(`${prefijo}${piso}${String(n).padStart(2, '0')}`);
          if (salida.length > MAX_LOTE + 1) return salida;
        }
      }
      return salida;
    }

    const desde = this.acotar(v.desde, 0, 100_000);
    const hasta = this.acotar(v.hasta, 0, 100_000);
    for (let i = desde; i <= hasta; i++) {
      salida.push(`${prefijo}${i}`);
      if (salida.length > MAX_LOTE + 1) return salida;
    }
    return salida;
  });

  protected readonly total = computed(() => this.identificadores().length);
  protected readonly visibles = computed(() => this.identificadores().slice(0, PREVIEW_VISIBLE));
  protected readonly ocultas = computed(() => Math.max(0, this.total() - PREVIEW_VISIBLE));
  protected readonly excede = computed(() => this.total() > MAX_LOTE);
  protected readonly puedeGenerar = computed(() => this.total() > 0 && !this.excede());

  private acotar(valor: number | null | undefined, min: number, max: number): number {
    const n = Number(valor);
    if (!Number.isFinite(n)) return 0;
    return Math.min(Math.max(Math.trunc(n), min), max);
  }

  protected enviar(): void {
    if (!this.puedeGenerar()) {
      return;
    }
    const v = this.form.getRawValue();
    const base: Omit<GenerarUnidadesRequest, 'codInmueble'> = {
      modo: v.modo,
      prefijo: v.prefijo.trim() || undefined,
      tipo: v.tipo,
      estadoOcupacion: v.estadoOcupacion,
    };
    const payload: Omit<GenerarUnidadesRequest, 'codInmueble'> =
      v.modo === 'pisos'
        ? { ...base, pisos: v.pisos ?? undefined, unidadesPorPiso: v.unidadesPorPiso ?? undefined }
        : { ...base, desde: v.desde ?? undefined, hasta: v.hasta ?? undefined };

    this.activeModal.close(payload);
  }
}
