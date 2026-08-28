import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PlanTipo, TenantDetalle } from '@core/models';
import { etiquetaRol } from '@core/constants';
import { mensajeErrorApi } from '@core/utils';
import { TenantsService } from '@core/services/tenants.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { CardComponent } from '@shared/components/card/card';
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

interface FilaUsuario {
  nombreUsuario: string;
  correoUsuario: string;
  telefono: string | null;
  rol: string;
  tieneAcceso: boolean;
}

@Component({
  selector: 'app-tenant-detalle-page',
  imports: [
    DatePipe,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    CardComponent,
    LoadingComponent,
    TableComponent,
  ],
  templateUrl: './tenant-detalle.page.html',
  styleUrl: './tenant-detalle.page.scss',
})
export class TenantDetallePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tenantsService = inject(TenantsService);
  private readonly modalService = inject(NgbModal);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly tenant = signal<TenantDetalle | null>(null);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly exitoMensaje = signal<string | null>(null);

  protected readonly etiquetasPlan = ETIQUETAS_PLAN;

  protected readonly hayInvitacionPendiente = computed(() =>
    (this.tenant()?.usuarios ?? []).some((u) => !u.tieneAcceso),
  );

  protected readonly columnas: TableColumn<FilaUsuario>[] = [
    { key: 'nombreUsuario', label: 'Nombre' },
    { key: 'correoUsuario', label: 'Correo' },
    { key: 'telefono', label: 'Teléfono', valor: (u) => u.telefono ?? '—' },
    { key: 'rol', label: 'Rol', valor: (u) => etiquetaRol(u.rol) },
    {
      key: 'tieneAcceso',
      label: 'Cuenta',
      badge: (u) =>
        u.tieneAcceso
          ? { texto: 'Activa', variante: 'success' }
          : { texto: 'Invitación pendiente', variante: 'warning' },
    },
  ];

  protected readonly usuarios = computed<FilaUsuario[]>(() => this.tenant()?.usuarios ?? []);

  ngOnInit(): void {
    this.cargar();
  }

  protected fraccion(uso: number | undefined, limite: number | null | undefined): string {
    return `${uso ?? 0} / ${limite ?? '∞'}`;
  }

  private cargar(): void {
    this.cargando.set(true);
    this.tenantsService.consultarUno(this.id).subscribe({
      next: (tenant) => {
        this.tenant.set(tenant);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo cargar el cliente.'));
      },
    });
  }

  protected abrirEditar(): void {
    const actual = this.tenant();
    if (!actual) {
      return;
    }
    const modalRef = this.modalService.open(TenantFormModal, { centered: true });
    (modalRef.componentInstance as TenantFormModal).tenant = actual;

    modalRef.result.then(
      (datos) => {
        this.tenantsService.actualizar(this.id, datos).subscribe({
          next: () => {
            this.exitoMensaje.set('Cliente actualizado.');
            this.errorMensaje.set(null);
            this.cargar();
          },
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar el cliente.')),
        });
      },
      () => undefined,
    );
  }

  protected reenviarInvitacion(): void {
    this.tenantsService.reenviarInvitacion(this.id).subscribe({
      next: () => {
        this.exitoMensaje.set('Invitación reenviada al correo del dueño.');
        this.errorMensaje.set(null);
      },
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo reenviar la invitación.')),
    });
  }

  protected async eliminar(): Promise<void> {
    const actual = this.tenant();
    if (!actual) {
      return;
    }
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar cliente',
      mensaje: `¿Eliminar "${actual.nombre}"? Se borra el cliente y sus usuarios. Si tiene inmuebles o historial no se podrá borrar: en ese caso desactívalo. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }
    this.tenantsService.eliminar(this.id).subscribe({
      next: () => {
        void this.router.navigate(['/app/tenants', actual.pagado ? 'pagados' : 'demo']);
      },
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar el cliente.')),
    });
  }
}
