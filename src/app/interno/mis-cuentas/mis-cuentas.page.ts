import { Component, OnInit, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CuentaMensual, EstadoCuenta, Residente } from '@core/models';
import { mensajeErrorApi } from '@core/services/api-error.util';
import { CuentasMensualesService } from '@core/services/cuentas-mensuales.service';
import { ResidentesService } from '@core/services/residentes.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableBadgeVariant, TableColumn } from '@shared/interfaces';
import { DetalleCuentaModal } from './detalle-cuenta-modal';

const VARIANTE_ESTADO: Record<EstadoCuenta, TableBadgeVariant> = {
  [EstadoCuenta.PENDIENTE]: 'warning',
  [EstadoCuenta.VENCIDA]: 'danger',
  [EstadoCuenta.PAGADA]: 'success',
};

const ETIQUETA_ESTADO: Record<EstadoCuenta, string> = {
  [EstadoCuenta.PENDIENTE]: 'Pendiente',
  [EstadoCuenta.VENCIDA]: 'Vencida',
  [EstadoCuenta.PAGADA]: 'Pagada',
};

function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

@Component({
  selector: 'app-mis-cuentas-page',
  imports: [AlertComponent, ButtonComponent, LoadingComponent, TableComponent],
  templateUrl: './mis-cuentas.page.html',
  styleUrl: './mis-cuentas.page.scss',
})
export class MisCuentasPage implements OnInit {
  private readonly residentesService = inject(ResidentesService);
  private readonly cuentasMensualesService = inject(CuentasMensualesService);
  private readonly modalService = inject(NgbModal);

  protected readonly residente = signal<Residente | null>(null);
  protected readonly cuentas = signal<CuentaMensual[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly EstadoCuenta = EstadoCuenta;
  protected readonly formatoMonto = formatoMonto;

  protected readonly columnas: TableColumn<CuentaMensual>[] = [
    { key: 'periodo', label: 'Periodo' },
    {
      key: 'fechaVencimiento',
      label: 'Vence',
      valor: (f) => new Date(f.fechaVencimiento).toLocaleDateString('es-CO'),
    },
    { key: 'total', label: 'Total', valor: (f) => formatoMonto(f.total), align: 'end' },
    {
      key: 'estado',
      label: 'Estado',
      badge: (f) => ({ texto: ETIQUETA_ESTADO[f.estado], variante: VARIANTE_ESTADO[f.estado] }),
    },
  ];

  ngOnInit(): void {
    this.residentesService.consultarMe().subscribe({
      next: (residente) => this.residente.set(residente),
      error: () => this.residente.set(null),
    });

    this.cuentasMensualesService.consultarMias().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar tus cuentas.'));
      },
    });
  }

  protected verDetalle(cuenta: CuentaMensual): void {
    const modalRef = this.modalService.open(DetalleCuentaModal, { centered: true });
    const instancia: DetalleCuentaModal = modalRef.componentInstance;
    instancia.codCuenta = cuenta.codCuenta;
  }
}
