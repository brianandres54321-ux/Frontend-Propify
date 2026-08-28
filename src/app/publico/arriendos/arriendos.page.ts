import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, startWith } from 'rxjs';

import {
  ArriendoBusquedaItem,
  ArriendoBusquedaRespuesta,
  BuscarArriendosParams,
  OperacionPublicacion,
  OrdenArriendos,
  TipoUnidad,
} from '@core/models';
import { ArriendosService } from '@core/services/arriendos.service';
import { mensajeErrorApi, urlWhatsapp } from '@core/utils';
import { AlertComponent } from '@shared/components/alert/alert';
import { LoadingComponent } from '@shared/components/loading/loading';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { TarjetaCarruselComponent } from './components/tarjeta-carrusel/tarjeta-carrusel';

const ETIQUETAS_TIPO: Record<TipoUnidad, string> = {
  [TipoUnidad.APARTAMENTO]: 'Apartamento',
  [TipoUnidad.APARTAESTUDIO]: 'Apartaestudio',
  [TipoUnidad.HABITACION]: 'Habitación / Pieza',
  [TipoUnidad.LOCAL]: 'Local comercial',
  [TipoUnidad.OFICINA]: 'Oficina',
};

const TAMANIO_PAGINA = 12;

function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

// Los precios de venta son grandes: se muestran abreviados en millones
// ("$350 M", "$1.200 M") en las tarjetas; el detalle usa el valor completo.
function formatoMillones(valor: number): string {
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) {
    return '';
  }
  if (n < 1_000_000) {
    return '$' + n.toLocaleString('es-CO');
  }
  const millones = n / 1_000_000;
  const texto =
    millones >= 100 || Number.isInteger(millones)
      ? millones.toLocaleString('es-CO', { maximumFractionDigits: 0 })
      : millones.toLocaleString('es-CO', { maximumFractionDigits: 1 });
  return `$${texto} M`;
}

function aNumero(valor: string | null): number | undefined {
  if (valor == null || valor.trim() === '') {
    return undefined;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? n : undefined;
}

// Página pública (sin login): búsqueda de unidades en arriendo de cualquier
// tenant, con filtros de ubicación y características. Ver
// GET /publico/arriendos/buscar en el backend.
@Component({
  selector: 'app-arriendos-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    LoadingComponent,
    PaginationComponent,
    TarjetaCarruselComponent,
  ],
  templateUrl: './arriendos.page.html',
  styleUrl: './arriendos.page.scss',
})
export class ArriendosPage implements OnInit {
  private readonly arriendosService = inject(ArriendosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly etiquetasTipo = ETIQUETAS_TIPO;
  protected readonly tiposUnidad = Object.values(TipoUnidad);
  protected readonly formatoMonto = formatoMonto;
  protected readonly TAMANIO_PAGINA = TAMANIO_PAGINA;

  protected readonly cargando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly resultado = signal<ArriendoBusquedaRespuesta | null>(null);
  protected readonly pagina = signal(1);
  // Solo aplica en móvil — en desktop el panel es una barra lateral fija.
  protected readonly filtrosAbiertos = signal(false);

  protected readonly items = computed<ArriendoBusquedaItem[]>(() => this.resultado()?.items ?? []);
  protected readonly total = computed(() => this.resultado()?.total ?? 0);
  protected readonly sinResultados = computed(
    () => !this.cargando() && this.resultado() !== null && this.total() === 0,
  );

  protected readonly form = this.fb.group({
    operacion: 'arriendo' as OperacionPublicacion,
    q: '',
    ciudad: '',
    barrio: '',
    departamento: '',
    tipo: '',
    precioMin: '',
    precioMax: '',
    cuartos: '',
    amoblado: false,
    orden: 'recientes' as OrdenArriendos,
  });

  // Signal propia (no derivada de valorForm) porque en ngOnInit el valor
  // inicial se aplica con emitEvent:false y valueChanges no dispararía.
  protected readonly operacion = signal<OperacionPublicacion>('arriendo');
  protected readonly esVenta = computed(() => this.operacion() === 'venta');

  // Precio a mostrar en la tarjeta según la operación.
  protected precioItem(item: ArriendoBusquedaItem): string | null {
    if (this.esVenta()) {
      return item.precioVenta ? formatoMillones(item.precioVenta) : null;
    }
    return item.precioArriendo ? formatoMonto(item.precioArriendo) : null;
  }

  private readonly valorForm = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly filtrosActivos = computed(() => {
    const v = this.valorForm();
    let n = 0;
    for (const clave of [
      'q',
      'ciudad',
      'barrio',
      'departamento',
      'tipo',
      'precioMin',
      'precioMax',
      'cuartos',
    ] as const) {
      if (v[clave]) {
        n++;
      }
    }
    if (v.amoblado) {
      n++;
    }
    return n;
  });

  constructor() {
    // El panel de filtros en móvil es un drawer a pantalla completa: bloquea
    // el scroll del fondo mientras está abierto.
    effect((onCleanup) => {
      if (this.filtrosAbiertos()) {
        document.body.style.overflow = 'hidden';
        onCleanup(() => {
          document.body.style.overflow = '';
        });
      }
    });
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const operacionUrl: OperacionPublicacion =
      qp.get('operacion') === 'venta' ? 'venta' : 'arriendo';
    this.operacion.set(operacionUrl);
    this.form.patchValue(
      {
        operacion: operacionUrl,
        q: qp.get('q') ?? '',
        ciudad: qp.get('ciudad') ?? '',
        barrio: qp.get('barrio') ?? '',
        departamento: qp.get('departamento') ?? '',
        tipo: qp.get('tipo') ?? '',
        precioMin: qp.get('precioMin') ?? '',
        precioMax: qp.get('precioMax') ?? '',
        cuartos: qp.get('cuartos') ?? '',
        amoblado: qp.get('amoblado') === 'true',
        orden: (qp.get('orden') as OrdenArriendos | null) ?? 'recientes',
      },
      { emitEvent: false },
    );
    const paginaUrl = Number(qp.get('pagina'));
    this.pagina.set(Number.isFinite(paginaUrl) && paginaUrl > 0 ? paginaUrl : 1);

    this.form.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.pagina.set(1);
      this.sincronizarUrl();
      this.buscar();
    });

    this.buscar();
  }

  protected irAPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.sincronizarUrl();
    this.buscar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected cambiarOperacion(operacion: OperacionPublicacion): void {
    if (this.operacion() === operacion) {
      return;
    }
    this.operacion.set(operacion);
    // Al cambiar de operación, el rango de precios y el orden dejan de tener
    // sentido (arriendo ~cientos de miles, venta ~cientos de millones).
    this.form.patchValue({
      operacion,
      precioMin: '',
      precioMax: '',
      orden: 'recientes',
    });
  }

  protected limpiarFiltros(): void {
    this.form.reset({
      operacion: this.form.controls.operacion.value,
      q: '',
      ciudad: '',
      barrio: '',
      departamento: '',
      tipo: '',
      precioMin: '',
      precioMax: '',
      cuartos: '',
      amoblado: false,
      orden: 'recientes',
    });
  }

  protected urlWhatsapp(item: ArriendoBusquedaItem): string {
    const verbo = this.esVenta() ? 'comprarlo' : 'arrendarlo';
    return urlWhatsapp(
      item.telefonoContacto!,
      `Hola, vi tu anuncio de ${item.identificador} en Propify y estoy interesado en ${verbo}.`,
    );
  }

  // Cache por unidad para devolver siempre la misma referencia de array —
  // si no, cada ciclo de detección de cambios recrearía las URLs y el
  // carrusel de la tarjeta perdería su posición.
  private readonly cacheFotos = new Map<number, string[]>();

  protected fotosUrls(item: ArriendoBusquedaItem): string[] {
    const cacheada = this.cacheFotos.get(item.codUnidad);
    if (cacheada && cacheada.length === item.fotos.length) {
      return cacheada;
    }
    const urls = item.fotos.map((codFoto) =>
      this.arriendosService.urlFoto(item.codUnidad, codFoto),
    );
    this.cacheFotos.set(item.codUnidad, urls);
    return urls;
  }

  protected claseTipo(tipo: TipoUnidad): string {
    return `tarjeta-unidad__tipo tarjeta-unidad__tipo--${tipo.toLowerCase()}`;
  }

  protected ubicacion(item: ArriendoBusquedaItem): string {
    return [item.barrio, item.ciudad, item.departamento]
      .filter((parte): parte is string => !!parte)
      .join(', ');
  }

  private construirFiltros(): BuscarArriendosParams {
    const v = this.form.getRawValue();
    return {
      operacion: v.operacion === 'venta' ? 'venta' : undefined,
      q: v.q.trim() || undefined,
      ciudad: v.ciudad.trim() || undefined,
      barrio: v.barrio.trim() || undefined,
      departamento: v.departamento.trim() || undefined,
      tipo: (v.tipo as TipoUnidad) || undefined,
      precioMin: aNumero(v.precioMin),
      precioMax: aNumero(v.precioMax),
      cuartos: aNumero(v.cuartos),
      amoblado: v.amoblado || undefined,
      orden: v.orden !== 'recientes' ? v.orden : undefined,
      pagina: this.pagina() > 1 ? this.pagina() : undefined,
    };
  }

  private sincronizarUrl(): void {
    const filtros = this.construirFiltros();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.keys(filtros).length ? filtros : {},
      replaceUrl: true,
    });
  }

  private buscar(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.cacheFotos.clear();
    this.arriendosService
      .buscar({ ...this.construirFiltros(), tamanio: TAMANIO_PAGINA })
      .subscribe({
        next: (respuesta) => {
          this.resultado.set(respuesta);
          this.cargando.set(false);
        },
        error: (error: unknown) => {
          this.cargando.set(false);
          this.resultado.set(null);
          this.errorMensaje.set(
            mensajeErrorApi(error, 'No se pudo cargar la búsqueda de arriendos.'),
          );
        },
      });
  }
}
