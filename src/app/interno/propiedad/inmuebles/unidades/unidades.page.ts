import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RoleNames } from '@core/constants';
import {
  EstadoOcupacionUnidad,
  GenerarUnidadesRequest,
  TipoUnidad,
  Unidad,
} from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { esLimitePlan, mensajeErrorApi } from '@core/utils';
import { UnidadesService } from '@core/services/unidades.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '@shared/components/loading/loading';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { TableComponent } from '@shared/components/table/table';
import { TableBadgeVariant, TableColumn } from '@shared/interfaces';
import { FotosUnidadModal } from './components/fotos-unidad-modal';
import { GenerarUnidadesModal } from './components/generar-unidades-modal';
import { UnidadFormModal } from './components/unidad-form-modal';

const TAMANIO_PAGINA = 10;

const ETIQUETAS_TIPO: Record<TipoUnidad, string> = {
  [TipoUnidad.APARTAMENTO]: 'Apartamento',
  [TipoUnidad.APARTAESTUDIO]: 'Apartaestudio',
  [TipoUnidad.HABITACION]: 'Habitación / Pieza',
  [TipoUnidad.LOCAL]: 'Local comercial',
  [TipoUnidad.OFICINA]: 'Oficina',
};

const VARIANTE_TIPO: Record<TipoUnidad, TableBadgeVariant> = {
  [TipoUnidad.APARTAMENTO]: 'primary',
  [TipoUnidad.APARTAESTUDIO]: 'info',
  [TipoUnidad.HABITACION]: 'warning',
  [TipoUnidad.LOCAL]: 'success',
  [TipoUnidad.OFICINA]: 'danger',
};

const ETIQUETA_ESTADO: Record<EstadoOcupacionUnidad, string> = {
  [EstadoOcupacionUnidad.OCUPADA]: 'Ocupada',
  [EstadoOcupacionUnidad.VACANTE]: 'Vacante',
};

const VARIANTE_ESTADO: Record<EstadoOcupacionUnidad, TableBadgeVariant> = {
  [EstadoOcupacionUnidad.OCUPADA]: 'info',
  [EstadoOcupacionUnidad.VACANTE]: 'success',
};

@Component({
  selector: 'app-unidades-page',
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationComponent,
    TableComponent,
  ],
  templateUrl: './unidades.page.html',
  styleUrl: './unidades.page.scss',
})
export class UnidadesPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly unidadesService = inject(UnidadesService);
  private readonly modalService = inject(NgbModal);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly auth = inject(AuthService);

  protected readonly TAMANIO_PAGINA = TAMANIO_PAGINA;
  protected readonly inmuebleId = Number(this.route.snapshot.paramMap.get('inmuebleId'));

  protected readonly unidades = signal<Unidad[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exitoMensaje = signal<string | null>(null);
  protected readonly limiteAlcanzado = signal(false);
  protected readonly paginaActual = signal(1);

  protected readonly puedeGestionar = computed(() =>
    this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN),
  );

  protected readonly filasPagina = computed(() => {
    const inicio = (this.paginaActual() - 1) * TAMANIO_PAGINA;
    return this.unidades().slice(inicio, inicio + TAMANIO_PAGINA);
  });

  protected readonly columnas: TableColumn<Unidad>[] = [
    { key: 'identificador', label: 'Identificador' },
    {
      key: 'tipo',
      label: 'Tipo',
      badge: (f) => ({ texto: ETIQUETAS_TIPO[f.tipo], variante: VARIANTE_TIPO[f.tipo] }),
    },
    { key: 'piso', label: 'Piso', valor: (f) => f.piso ?? '—' },
    { key: 'areaM2', label: 'Área m²', valor: (f) => f.areaM2 ?? '—' },
    {
      key: 'estadoOcupacion',
      label: 'Estado',
      badge: (f) => ({
        texto: ETIQUETA_ESTADO[f.estadoOcupacion],
        variante: VARIANTE_ESTADO[f.estadoOcupacion],
      }),
    },
  ];

  protected readonly EstadoOcupacionUnidad = EstadoOcupacionUnidad;

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.unidadesService.consultar(this.inmuebleId).subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar las unidades.'));
      },
    });
  }

  protected abrirCrear(): void {
    const modalRef = this.modalService.open(UnidadFormModal, { centered: true, size: 'lg' });
    const instancia: UnidadFormModal = modalRef.componentInstance;
    instancia.modo = 'crear';

    modalRef.result.then(
      (datos) => {
        this.limiteAlcanzado.set(false);
        this.unidadesService.registrar({ ...datos, codInmueble: this.inmuebleId }).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) => {
            this.limiteAlcanzado.set(esLimitePlan(error));
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear la unidad.'));
          },
        });
      },
      () => undefined,
    );
  }

  protected abrirGenerar(): void {
    const modalRef = this.modalService.open(GenerarUnidadesModal, { centered: true, size: 'lg' });
    (modalRef.componentInstance as GenerarUnidadesModal).existentes = this.unidades().map(
      (u) => ({ identificador: u.identificador, piso: u.piso ?? null }),
    );

    modalRef.result.then(
      (datos: Omit<GenerarUnidadesRequest, 'codInmueble'>) => {
        this.errorMensaje.set(null);
        this.exitoMensaje.set(null);
        this.limiteAlcanzado.set(false);
        this.unidadesService
          .generarLote({ ...datos, codInmueble: this.inmuebleId })
          .subscribe({
            next: (resultado) => {
              const partes = [`${resultado.creadas} unidad(es) creada(s)`];
              if (resultado.omitidas > 0) {
                partes.push(`${resultado.omitidas} ya existía(n) y se omitió(eron)`);
              }
              this.exitoMensaje.set(partes.join(' · '));
              this.paginaActual.set(1);
              this.cargar();
            },
            error: (error: unknown) => {
              this.limiteAlcanzado.set(esLimitePlan(error));
              this.errorMensaje.set(
                mensajeErrorApi(error, 'No se pudieron generar las unidades.'),
              );
            },
          });
      },
      () => undefined,
    );
  }

  protected abrirFotos(unidad: Unidad): void {
    const modalRef = this.modalService.open(FotosUnidadModal, { centered: true, size: 'lg' });
    const instancia: FotosUnidadModal = modalRef.componentInstance;
    instancia.unidadId = unidad.codUnidad;
    instancia.identificadorUnidad = unidad.identificador;
  }

  protected abrirEditar(unidad: Unidad): void {
    const modalRef = this.modalService.open(UnidadFormModal, { centered: true, size: 'lg' });
    const instancia: UnidadFormModal = modalRef.componentInstance;
    instancia.modo = 'editar';
    instancia.precargar(unidad);

    modalRef.result.then(
      (datos) => {
        this.unidadesService.actualizar(unidad.codUnidad, datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar la unidad.')),
        });
      },
      () => undefined,
    );
  }

  protected async eliminar(unidad: Unidad): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar unidad',
      mensaje: `¿Eliminar "${unidad.identificador}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }

    this.unidadesService.eliminar(unidad.codUnidad).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar la unidad.')),
    });
  }
}
