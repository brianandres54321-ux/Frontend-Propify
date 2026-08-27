import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Inmueble, ZonaComun } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { RoleNames } from '@core/constants';
import { mensajeErrorApi } from '@core/utils';
import { InmueblesService } from '@core/services/inmuebles.service';
import { ZonasComunesService } from '@core/services/zonas-comunes.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableColumn } from '@shared/interfaces';
import { ZonaComunFormModal } from './components/zona-comun-form-modal';

// Los montos de ZonaComun vienen de columnas `numeric` de Postgres — pueden
// llegar como string; Number() antes de formatear.
function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

@Component({
  selector: 'app-zonas-comunes-page',
  imports: [AlertComponent, ButtonComponent, LoadingComponent, TableComponent],
  templateUrl: './zonas-comunes.page.html',
  styleUrl: './zonas-comunes.page.scss',
})
export class ZonasComunesPage implements OnInit {
  private readonly zonasComunesService = inject(ZonasComunesService);
  private readonly inmueblesService = inject(InmueblesService);
  private readonly modalService = inject(NgbModal);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly auth = inject(AuthService);

  protected readonly zonas = signal<ZonaComun[]>([]);
  protected readonly inmuebles = signal<Inmueble[]>([]);
  protected readonly inmuebleSeleccionado = signal<number | ''>('');
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly puedeGestionar = computed(() =>
    this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN),
  );

  protected readonly columnas: TableColumn<ZonaComun>[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'precio', label: 'Precio', valor: (f) => formatoMonto(f.precio), align: 'end' },
    { key: 'capacidad', label: 'Capacidad', valor: (f) => f.capacidad?.toString() ?? '—' },
    {
      key: 'horario',
      label: 'Horario',
      valor: (f) => (f.horaApertura && f.horaCierre ? `${f.horaApertura} - ${f.horaCierre}` : '—'),
    },
    {
      key: 'activa',
      label: 'Estado',
      badge: (f) =>
        f.activa
          ? { texto: 'Activa', variante: 'success' }
          : { texto: 'Inactiva', variante: 'danger' },
    },
  ];

  ngOnInit(): void {
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => {
        const conZonas = inmuebles.filter((i) => i.tieneZonasComunes);
        this.inmuebles.set(conZonas);
        if (conZonas.length > 0) {
          this.inmuebleSeleccionado.set(conZonas[0].codInmueble);
          this.cargar();
        } else {
          this.cargando.set(false);
        }
      },
      error: () => {
        this.inmuebles.set([]);
        this.cargando.set(false);
      },
    });
  }

  protected cambiarInmueble(valor: string): void {
    this.inmuebleSeleccionado.set(valor ? Number(valor) : '');
    this.cargar();
  }

  private cargar(): void {
    const inmuebleId = this.inmuebleSeleccionado();
    if (!inmuebleId) {
      this.zonas.set([]);
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.zonasComunesService.consultar(inmuebleId).subscribe({
      next: (zonas) => {
        this.zonas.set(zonas);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar las zonas comunes.'));
      },
    });
  }

  protected abrirCrear(): void {
    const inmuebleId = this.inmuebleSeleccionado();
    if (!inmuebleId) {
      return;
    }

    const modalRef = this.modalService.open(ZonaComunFormModal, { centered: true });
    const instancia: ZonaComunFormModal = modalRef.componentInstance;
    instancia.modo = 'crear';

    modalRef.result.then(
      (datos) => {
        this.zonasComunesService.registrar({ ...datos, codInmueble: inmuebleId }).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear la zona común.')),
        });
      },
      () => undefined,
    );
  }

  protected abrirEditar(zona: ZonaComun): void {
    const modalRef = this.modalService.open(ZonaComunFormModal, { centered: true });
    const instancia: ZonaComunFormModal = modalRef.componentInstance;
    instancia.modo = 'editar';
    instancia.zonaExistente = zona;
    instancia.precargar(zona);

    modalRef.result.then(
      (datos) => {
        this.zonasComunesService.actualizar(zona.codZona, datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar la zona común.')),
        });
      },
      () => undefined,
    );
  }

  protected async eliminar(zona: ZonaComun): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar zona común',
      mensaje: `¿Eliminar "${zona.nombre}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }

    this.zonasComunesService.eliminar(zona.codZona).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar la zona común.')),
    });
  }
}
