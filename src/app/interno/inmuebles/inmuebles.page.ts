import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../core/services/auth.service';
import { RoleNames } from '../../core/constants/roles.constant';
import { mensajeErrorApi } from '../../core/services/api-error.util';
import { InmueblesService } from '../../core/services/inmuebles.service';
import { Inmueble } from '../../core/models';
import { AlertComponent } from '../../shared/components/alert/alert';
import { ButtonComponent } from '../../shared/components/button/button';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { TableComponent } from '../../shared/components/table/table';
import { TableColumn } from '../../shared/interfaces/table-column.interface';
import { InmuebleFormModal } from './inmueble-form-modal';

const TAMANIO_PAGINA = 10;

@Component({
  selector: 'app-inmuebles-page',
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationComponent,
    TableComponent,
  ],
  templateUrl: './inmuebles.page.html',
  styleUrl: './inmuebles.page.scss',
})
export class InmueblesPage implements OnInit {
  private readonly inmueblesService = inject(InmueblesService);
  private readonly modalService = inject(NgbModal);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly auth = inject(AuthService);

  protected readonly TAMANIO_PAGINA = TAMANIO_PAGINA;
  protected readonly inmuebles = signal<Inmueble[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly paginaActual = signal(1);

  protected readonly puedeGestionar = computed(() =>
    this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN),
  );

  protected readonly filasPagina = computed(() => {
    const inicio = (this.paginaActual() - 1) * TAMANIO_PAGINA;
    return this.inmuebles().slice(inicio, inicio + TAMANIO_PAGINA);
  });

  protected readonly columnas: TableColumn<Inmueble>[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'direccion', label: 'Dirección', valor: (f) => f.direccion ?? '—' },
    {
      key: 'modulos',
      label: 'Módulos',
      valor: (f) =>
        [
          f.tieneTorres && 'Torres',
          f.tieneZonasComunes && 'Zonas comunes',
          f.tieneParqueaderos && 'Parqueaderos',
          f.tieneCelador && 'Portería',
          f.tieneCartelera && 'Cartelera',
        ]
          .filter(Boolean)
          .join(', ') || '—',
    },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => {
        this.inmuebles.set(inmuebles);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los inmuebles.'));
      },
    });
  }

  protected abrirCrear(): void {
    const modalRef = this.modalService.open(InmuebleFormModal, { centered: true });
    const instancia: InmuebleFormModal = modalRef.componentInstance;
    instancia.modo = 'crear';

    modalRef.result.then(
      (datos) => {
        this.inmueblesService.registrar(datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear el inmueble.')),
        });
      },
      () => undefined,
    );
  }

  protected abrirEditar(inmueble: Inmueble): void {
    const modalRef = this.modalService.open(InmuebleFormModal, { centered: true });
    const instancia: InmuebleFormModal = modalRef.componentInstance;
    instancia.modo = 'editar';
    instancia.inmuebleExistente = inmueble;
    instancia.precargar(inmueble);

    modalRef.result.then(
      (datos) => {
        this.inmueblesService.actualizar(inmueble.codInmueble, datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar el inmueble.')),
        });
      },
      () => undefined,
    );
  }

  protected async eliminar(inmueble: Inmueble): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar inmueble',
      mensaje: `¿Eliminar "${inmueble.nombre}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }

    this.inmueblesService.eliminar(inmueble.codInmueble).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar el inmueble.')),
    });
  }
}
