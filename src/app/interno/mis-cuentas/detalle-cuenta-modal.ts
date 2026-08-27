import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CargoDetalle, CuentaMensual, Pago, TipoCargo } from '@core/models';
import { mensajeErrorApi } from '@core/services/api-error.util';
import { CuentasMensualesService } from '@core/services/cuentas-mensuales.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';

const ETIQUETA_TIPO_CARGO: Record<TipoCargo, string> = {
  [TipoCargo.ARRIENDO]: 'Arriendo',
  [TipoCargo.CUOTA_ADMINISTRACION]: 'Cuota de administración',
  [TipoCargo.RESERVA_ZONA]: 'Reserva de zona común',
  [TipoCargo.MULTA]: 'Multa',
  [TipoCargo.OTRO]: 'Otro',
};

// Los montos vienen de columnas `numeric` de Postgres — pueden llegar como
// string; Number() antes de formatear.
export function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

// Nota: usa una propiedad plana (no input() signal) — NgbModal asigna el
// codCuenta imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-detalle-cuenta-modal',
  imports: [AlertComponent, ButtonComponent, LoadingComponent],
  templateUrl: './detalle-cuenta-modal.html',
  styleUrl: './detalle-cuenta-modal.scss',
})
export class DetalleCuentaModal implements OnInit {
  public codCuenta!: number;

  private readonly cuentasMensualesService = inject(CuentasMensualesService);

  protected readonly cuenta = signal<CuentaMensual | null>(null);
  protected readonly cargos = signal<CargoDetalle[]>([]);
  protected readonly pagos = signal<Pago[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly etiquetaTipoCargo = ETIQUETA_TIPO_CARGO;
  protected readonly formatoMonto = formatoMonto;
  protected readonly formatoFecha = (valor: string): string =>
    new Date(valor).toLocaleDateString('es-CO');

  protected readonly totalPagado = computed(() =>
    this.pagos().reduce((suma, p) => suma + Number(p.monto), 0),
  );

  constructor(public readonly activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.cuentasMensualesService.consultarUna(this.codCuenta).subscribe({
      next: ({ cuenta, cargos, pagos }) => {
        this.cuenta.set(cuenta);
        this.cargos.set(cargos);
        this.pagos.set(pagos);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo cargar el detalle de la cuenta.'));
      },
    });
  }
}
