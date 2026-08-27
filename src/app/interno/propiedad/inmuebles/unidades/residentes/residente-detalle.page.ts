import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CuentaMensual, EstadoCuenta, Residente } from '@core/models';
import { mensajeErrorApi } from '@core/utils';
import { CuentasMensualesService } from '@core/services/cuentas-mensuales.service';
import { ResidentesService } from '@core/services/residentes.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { CardComponent } from '@shared/components/card/card';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableBadgeVariant, TableColumn } from '@shared/interfaces';
import { DetalleCuentaModal } from '@interno/finanzas/mis-cuentas/components/detalle-cuenta-modal';

function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

function diasRestantes(fechaFin: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0);
  return Math.round((fin.getTime() - hoy.getTime()) / 86_400_000);
}

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

@Component({
  selector: 'app-residente-detalle-page',
  imports: [
    RouterLink,
    DatePipe,
    AlertComponent,
    ButtonComponent,
    CardComponent,
    LoadingComponent,
    TableComponent,
  ],
  templateUrl: './residente-detalle.page.html',
  styleUrl: './residente-detalle.page.scss',
})
export class ResidenteDetallePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly residentesService = inject(ResidentesService);
  private readonly cuentasMensualesService = inject(CuentasMensualesService);
  private readonly modalService = inject(NgbModal);

  protected readonly inmuebleId = Number(this.route.snapshot.paramMap.get('inmuebleId'));
  protected readonly unidadId = Number(this.route.snapshot.paramMap.get('unidadId'));
  protected readonly residenteId = Number(this.route.snapshot.paramMap.get('residenteId'));

  protected readonly residente = signal<Residente | null>(null);
  protected readonly cuentas = signal<CuentaMensual[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly formatoMonto = formatoMonto;

  protected readonly diasRestantesContrato = computed(() => {
    const fechaFin = this.residente()?.fechaFin;
    return fechaFin ? diasRestantes(fechaFin) : null;
  });

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
    this.residentesService.consultarUno(this.residenteId).subscribe({
      next: (residente) => this.residente.set(residente),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo cargar el inquilino.')),
    });

    this.cuentasMensualesService.consultarTodas().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas.filter((c) => c.codResidente === this.residenteId));
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo cargar el historial de cuentas.'));
      },
    });
  }

  protected verDetalleCuenta(cuenta: CuentaMensual): void {
    const modalRef = this.modalService.open(DetalleCuentaModal, { centered: true });
    const instancia: DetalleCuentaModal = modalRef.componentInstance;
    instancia.codCuenta = cuenta.codCuenta;
  }

  protected subirContrato(input: HTMLInputElement): void {
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.residentesService.subirContrato(this.residenteId, archivo).subscribe({
      next: () => {
        input.value = '';
        this.residentesService
          .consultarUno(this.residenteId)
          .subscribe((r) => this.residente.set(r));
      },
      error: (error: unknown) => {
        input.value = '';
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo subir el contrato.'));
      },
    });
  }

  protected descargarContrato(): void {
    const residente = this.residente();
    if (!residente) return;

    this.residentesService.descargarContrato(this.residenteId).subscribe({
      next: (blob) => {
        const extension = residente.archivoContrato?.split('.').pop() ?? 'pdf';
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `contrato-${residente.nombre.replace(/\s+/g, '-')}.${extension}`;
        enlace.click();
        URL.revokeObjectURL(url);
      },
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo descargar el contrato.')),
    });
  }
}
