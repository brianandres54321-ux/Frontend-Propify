import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PlanTipo, Tenant } from '@core/models';
import { mensajeErrorApi } from '@core/utils';
import { TenantsService } from '@core/services/tenants.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableColumn } from '@shared/interfaces';

import { TenantFormModal } from './components/tenant-form-modal';

const ETIQUETAS_PLAN: Record<PlanTipo, string> = {
  [PlanTipo.CASAS]: 'Casas',
  [PlanTipo.EDIFICIOS]: 'Edificios',
  [PlanTipo.CONJUNTOS]: 'Conjuntos',
};

function fraccion(uso: number, limite: number | null): string {
  return `${uso} / ${limite ?? '∞'}`;
}

@Component({
  selector: 'app-tenants-page',
  imports: [AlertComponent, ButtonComponent, LoadingComponent, TableComponent],
  templateUrl: './tenants.page.html',
  styleUrl: './tenants.page.scss',
})
export class TenantsPage implements OnInit {
  private readonly tenantsService = inject(TenantsService);
  private readonly modalService = inject(NgbModal);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly tenants = signal<Tenant[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exitoMensaje = signal<string | null>(null);

  protected readonly etiquetasPlan = ETIQUETAS_PLAN;

  protected readonly totales = computed(() => {
    const lista = this.tenants();
    return {
      tenants: lista.length,
      pagados: lista.filter((t) => t.pagado).length,
      inmuebles: lista.reduce((n, t) => n + (t.uso?.inmuebles ?? 0), 0),
      unidades: lista.reduce((n, t) => n + (t.uso?.unidades ?? 0), 0),
    };
  });

  protected readonly columnas: TableColumn<Tenant>[] = [
    { key: 'nombre', label: 'Cliente' },
    { key: 'plan', label: 'Plan', valor: (t) => ETIQUETAS_PLAN[t.plan] },
    {
      key: 'pagado',
      label: 'Estado',
      badge: (t) =>
        t.pagado
          ? { texto: 'Pagado', variante: 'success' }
          : { texto: 'Demo', variante: 'warning' },
    },
    {
      key: 'inmuebles',
      label: 'Inmuebles',
      align: 'center',
      valor: (t) => fraccion(t.uso?.inmuebles ?? 0, t.uso?.limiteInmuebles ?? null),
    },
    {
      key: 'unidades',
      label: 'Unidades',
      align: 'center',
      valor: (t) => fraccion(t.uso?.unidades ?? 0, t.uso?.limiteUnidades ?? null),
    },
    {
      key: 'activo',
      label: 'Activo',
      badge: (t) =>
        t.activo
          ? { texto: 'Sí', variante: 'success' }
          : { texto: 'Inactivo', variante: 'danger' },
    },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.tenantsService.consultarTodos().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(
          mensajeErrorApi(error, 'No se pudieron cargar los clientes.'),
        );
      },
    });
  }

  protected cerca(tenant: Tenant): boolean {
    const u = tenant.uso;
    if (!u || u.limiteUnidades == null) {
      return false;
    }
    return u.unidades >= u.limiteUnidades * 0.8;
  }

  protected abrirCrear(): void {
    const modalRef = this.modalService.open(TenantFormModal, { centered: true });

    modalRef.result.then(
      (datos) => {
        this.tenantsService.crear(datos).subscribe({
          next: () => {
            this.exitoMensaje.set('Cliente creado.');
            this.cargar();
          },
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo crear el cliente.')),
        });
      },
      () => undefined,
    );
  }

  protected abrirEditar(tenant: Tenant): void {
    const modalRef = this.modalService.open(TenantFormModal, { centered: true });
    (modalRef.componentInstance as TenantFormModal).tenant = tenant;

    modalRef.result.then(
      (datos) => {
        this.tenantsService.actualizar(tenant.codTenant, datos).subscribe({
          next: () => {
            this.exitoMensaje.set('Cliente actualizado.');
            this.cargar();
          },
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar el cliente.')),
        });
      },
      () => undefined,
    );
  }

  protected async eliminar(tenant: Tenant): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar cliente',
      mensaje: `¿Eliminar "${tenant.nombre}"? Se borra el tenant; sus inmuebles, unidades y usuarios quedan huérfanos si los tiene. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }
    this.tenantsService.eliminar(tenant.codTenant).subscribe({
      next: () => {
        this.exitoMensaje.set('Cliente eliminado.');
        this.cargar();
      },
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar el cliente.')),
    });
  }
}
