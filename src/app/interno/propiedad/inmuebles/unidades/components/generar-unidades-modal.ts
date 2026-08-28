import { Component, computed, effect, inject } from '@angular/core';
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

// "Apto 001" -> { texto: "Apto ", inicio: 1, ancho: 3 }. Sin dígitos finales
// devuelve inicio: null. El ancho conserva los ceros a la izquierda.
function separarPrefijo(prefijo: string): {
  texto: string;
  inicio: number | null;
  ancho: number;
} {
  const m = /^(.*?)(\d+)$/.exec(prefijo);
  if (!m) {
    return { texto: prefijo, inicio: null, ancho: 0 };
  }
  return { texto: m[1], inicio: Number(m[2]), ancho: m[2].length };
}

export interface UnidadExistente {
  identificador: string;
  piso: number | null;
}

interface Plantilla {
  id: string;
  piso: number | null;
  existe: boolean;
}

// Misma clave que usa el backend para deduplicar (ver
// UnidadesService.generarLote): una unidad es "la misma" solo si coinciden
// piso E identificador — "Apto 101" en el piso 1 y en el piso 5 son distintas.
function clave(identificador: string, piso: number | null): string {
  return `${piso ?? ''}|${identificador}`;
}

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

  // Unidades que ya existen en el inmueble — el padre las pasa para marcarlas
  // en la vista previa (el backend igual las omite, pero así se ve antes).
  public existentes: UnidadExistente[] = [];

  protected readonly EstadoOcupacionUnidad = EstadoOcupacionUnidad;
  protected readonly MAX_LOTE = MAX_LOTE;
  protected readonly PREVIEW_VISIBLE = PREVIEW_VISIBLE;
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

  private readonly separado = computed(() => separarPrefijo(this.valores().prefijo ?? ''));

  // El prefijo termina en número (ej. "Apto 001"). En modo consecutivo se usa
  // como número inicial; en modo pisos no está permitido.
  protected readonly prefijoConNumero = computed(() => this.separado().inicio !== null);
  protected readonly numeroInicial = computed<string | null>(() => {
    const s = this.separado();
    return s.inicio !== null ? String(s.inicio).padStart(s.ancho, '0') : null;
  });
  protected readonly errorPrefijoPisos = computed(
    () => this.valores().modo === 'pisos' && this.prefijoConNumero(),
  );

  private readonly clavesExistentes = computed(
    () => new Set(this.existentes.map((u) => clave(u.identificador, u.piso ?? null))),
  );

  protected readonly plantillas = computed<Plantilla[]>(() => {
    const v = this.valores();
    const prefijo = v.prefijo ?? '';
    const s = this.separado();
    const existentes = this.clavesExistentes();
    const salida: Plantilla[] = [];
    const push = (id: string, piso: number | null): boolean => {
      salida.push({ id, piso, existe: existentes.has(clave(id, piso)) });
      return salida.length > MAX_LOTE + 1;
    };

    if (v.modo === 'pisos') {
      if (s.inicio !== null) {
        return salida; // prefijo inválido para este modo
      }
      const pisos = this.acotar(v.pisos, 0, 80);
      const porPiso = this.acotar(v.unidadesPorPiso, 0, 50);
      for (let piso = 1; piso <= pisos; piso++) {
        for (let n = 1; n <= porPiso; n++) {
          if (push(`${prefijo}${piso}${String(n).padStart(2, '0')}`, piso)) {
            return salida;
          }
        }
      }
      return salida;
    }

    const inicio = s.inicio ?? this.acotar(v.desde, 0, 100_000);
    const hasta = this.acotar(v.hasta, 0, 100_000);
    const texto = s.inicio !== null ? s.texto : prefijo;
    for (let i = inicio; i <= hasta; i++) {
      const numero = s.ancho > 0 ? String(i).padStart(s.ancho, '0') : String(i);
      if (push(`${texto}${numero}`, null)) {
        return salida;
      }
    }
    return salida;
  });

  constructor() {
    // Cuando el prefijo trae el número de inicio, "Desde" no aplica: se
    // deshabilita y se sincroniza al número detectado.
    effect(() => {
      const s = this.separado();
      const control = this.form.controls.desde;
      if (s.inicio !== null) {
        if (control.enabled) {
          control.disable({ emitEvent: false });
        }
        if (control.value !== s.inicio) {
          control.setValue(s.inicio, { emitEvent: false });
        }
      } else if (control.disabled) {
        control.enable({ emitEvent: false });
      }
    });
  }

  protected readonly total = computed(() => this.plantillas().length);
  protected readonly nuevas = computed(() => this.plantillas().filter((p) => !p.existe).length);
  protected readonly duplicadas = computed(() => this.total() - this.nuevas());
  protected readonly visibles = computed(() => this.plantillas().slice(0, PREVIEW_VISIBLE));
  protected readonly ocultas = computed(() => Math.max(0, this.total() - PREVIEW_VISIBLE));

  // Vista previa agrupada por piso (solo tiene sentido en modo pisos; en
  // consecutivo devuelve un único grupo sin etiqueta).
  protected readonly gruposPreview = computed<{ piso: number | null; unidades: Plantilla[] }[]>(
    () => {
      const items = this.visibles();
      if (this.valores().modo !== 'pisos') {
        return [{ piso: null, unidades: items }];
      }
      const mapa = new Map<number, Plantilla[]>();
      for (const p of items) {
        const piso = p.piso ?? 0;
        const lista = mapa.get(piso) ?? [];
        lista.push(p);
        mapa.set(piso, lista);
      }
      return [...mapa.entries()].map(([piso, unidades]) => ({ piso, unidades }));
    },
  );
  protected readonly excede = computed(() => this.total() > MAX_LOTE);
  protected readonly puedeGenerar = computed(
    () => this.nuevas() > 0 && !this.excede() && !this.errorPrefijoPisos(),
  );

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
      // Solo se recorta el espacio inicial: el espacio final del prefijo es
      // significativo ("Apto " → "Apto 101").
      prefijo: v.prefijo.replace(/^\s+/, '') || undefined,
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
