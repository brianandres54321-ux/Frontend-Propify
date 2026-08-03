import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EstadoCuenta, Inmueble, CuentaResumen } from '../../core/models';
import { mensajeErrorApi } from '../../core/services/api-error.util';
import { CobranzaService } from '../../core/services/cobranza.service';
import { InmueblesService } from '../../core/services/inmuebles.service';
import { AlertComponent } from '../../shared/components/alert/alert';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { TableComponent } from '../../shared/components/table/table';
import { TableBadgeVariant, TableColumn } from '../../shared/interfaces/table-column.interface';
import { PagoFormModal, formatoMonto } from './pago-form-modal';

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
  selector: 'app-cobranza-page',
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, LoadingComponent, TableComponent],
  templateUrl: './cobranza.page.html',
  styleUrl: './cobranza.page.scss',
})
export class CobranzaPage implements OnInit {
  private readonly cobranzaService = inject(CobranzaService);
  private readonly inmueblesService = inject(InmueblesService);
  private readonly modalService = inject(NgbModal);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly EstadoCuenta = EstadoCuenta;
  protected readonly cuentas = signal<CuentaResumen[]>([]);
  protected readonly inmuebles = signal<Inmueble[]>([]);
  protected readonly cargando = signal(true);
  protected readonly generando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly filtros = this.fb.group({
    estado: this.fb.control<EstadoCuenta | ''>(''),
    inmuebleId: this.fb.control<number | ''>(''),
  });

  protected readonly totalPendiente = computed(() =>
    this.cuentas()
      .filter((c) => c.estado !== EstadoCuenta.PAGADA)
      .reduce((suma, c) => suma + Number(c.total) - Number(c.totalPagado), 0),
  );

  protected readonly columnas: TableColumn<CuentaResumen>[] = [
    { key: 'nombreInmueble', label: 'Inmueble' },
    { key: 'identificadorUnidad', label: 'Unidad' },
    { key: 'nombreResidente', label: 'Inquilino' },
    { key: 'periodo', label: 'Periodo' },
    {
      key: 'fechaVencimiento',
      label: 'Vence',
      valor: (f) => new Date(f.fechaVencimiento).toLocaleDateString('es-CO'),
    },
    { key: 'total', label: 'Total', valor: (f) => formatoMonto(f.total), align: 'end' },
    { key: 'totalPagado', label: 'Pagado', valor: (f) => formatoMonto(f.totalPagado), align: 'end' },
    {
      key: 'estado',
      label: 'Estado',
      badge: (f) => ({ texto: ETIQUETA_ESTADO[f.estado], variante: VARIANTE_ESTADO[f.estado] }),
    },
  ];

  ngOnInit(): void {
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => this.inmuebles.set(inmuebles),
      error: () => this.inmuebles.set([]),
    });

    this.filtros.valueChanges.subscribe(() => this.cargar());
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    const { estado, inmuebleId } = this.filtros.getRawValue();

    this.cobranzaService
      .consultarCuentas({
        estado: estado || undefined,
        inmuebleId: inmuebleId || undefined,
      })
      .subscribe({
        next: (cuentas) => {
          this.cuentas.set(cuentas);
          this.cargando.set(false);
        },
        error: (error: unknown) => {
          this.cargando.set(false);
          this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar las cuentas.'));
        },
      });
  }

  protected generarCuentasDelMes(): void {
    this.generando.set(true);
    this.mensajeExito.set(null);
    this.cobranzaService.ejecutarCiclo().subscribe({
      next: () => {
        this.generando.set(false);
        this.mensajeExito.set('Ciclo de cobranza ejecutado: se generaron las cuentas del día.');
        this.cargar();
      },
      error: (error: unknown) => {
        this.generando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo ejecutar el ciclo de cobranza.'));
      },
    });
  }

  protected registrarPago(cuenta: CuentaResumen): void {
    const modalRef = this.modalService.open(PagoFormModal, { centered: true });
    const instancia: PagoFormModal = modalRef.componentInstance;
    instancia.cuenta = cuenta;

    modalRef.result.then(
      (datos) => {
        this.cobranzaService.registrarPago(cuenta.codCuenta, datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo registrar el pago.')),
        });
      },
      () => undefined,
    );
  }
}
