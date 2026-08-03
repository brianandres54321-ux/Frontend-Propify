import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Gasto, Inmueble } from '../../core/models';
import { mensajeErrorApi } from '../../core/services/api-error.util';
import { GastosService } from '../../core/services/gastos.service';
import { InmueblesService } from '../../core/services/inmuebles.service';
import { AlertComponent } from '../../shared/components/alert/alert';
import { ButtonComponent } from '../../shared/components/button/button';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { TableComponent } from '../../shared/components/table/table';
import { TableColumn } from '../../shared/interfaces/table-column.interface';
import { GastoFormModal } from './gasto-form-modal';

// Los montos de Gasto vienen de columnas `numeric` de Postgres — pueden
// llegar como string; Number() antes de formatear.
function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

@Component({
  selector: 'app-gastos-page',
  imports: [AlertComponent, ButtonComponent, LoadingComponent, TableComponent],
  templateUrl: './gastos.page.html',
  styleUrl: './gastos.page.scss',
})
export class GastosPage implements OnInit {
  private readonly gastosService = inject(GastosService);
  private readonly inmueblesService = inject(InmueblesService);
  private readonly modalService = inject(NgbModal);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly gastos = signal<Gasto[]>([]);
  protected readonly inmuebles = signal<Inmueble[]>([]);
  protected readonly inmuebleSeleccionado = signal<number | ''>('');
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly totalGastos = computed(() =>
    this.gastos().reduce((suma, g) => suma + Number(g.monto), 0),
  );

  protected readonly columnas: TableColumn<Gasto>[] = [
    {
      key: 'fecha',
      label: 'Fecha',
      valor: (f) => new Date(f.fecha).toLocaleDateString('es-CO'),
    },
    { key: 'concepto', label: 'Concepto' },
    { key: 'categoria', label: 'Categoría', valor: (f) => f.categoria ?? '—' },
    { key: 'monto', label: 'Monto', valor: (f) => formatoMonto(f.monto), align: 'end' },
  ];

  ngOnInit(): void {
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => {
        this.inmuebles.set(inmuebles);
        if (inmuebles.length > 0) {
          this.inmuebleSeleccionado.set(inmuebles[0].codInmueble);
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
      this.gastos.set([]);
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.gastosService.consultar(inmuebleId).subscribe({
      next: (gastos) => {
        this.gastos.set(gastos);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los gastos.'));
      },
    });
  }

  protected abrirCrear(): void {
    const inmuebleId = this.inmuebleSeleccionado();
    if (!inmuebleId) {
      return;
    }

    const modalRef = this.modalService.open(GastoFormModal, { centered: true });
    const instancia: GastoFormModal = modalRef.componentInstance;
    instancia.modo = 'crear';

    modalRef.result.then(
      (datos) => {
        this.gastosService.registrar({ ...datos, codInmueble: inmuebleId }).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo registrar el gasto.')),
        });
      },
      () => undefined,
    );
  }

  protected abrirEditar(gasto: Gasto): void {
    const modalRef = this.modalService.open(GastoFormModal, { centered: true });
    const instancia: GastoFormModal = modalRef.componentInstance;
    instancia.modo = 'editar';
    instancia.gastoExistente = gasto;
    instancia.precargar(gasto);

    modalRef.result.then(
      (datos) => {
        this.gastosService.actualizar(gasto.codGasto, datos).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar el gasto.')),
        });
      },
      () => undefined,
    );
  }

  protected async eliminar(gasto: Gasto): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar gasto',
      mensaje: `¿Eliminar el gasto "${gasto.concepto}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }

    this.gastosService.eliminar(gasto.codGasto).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar el gasto.')),
    });
  }
}
