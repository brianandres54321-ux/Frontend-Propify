import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { RoleNames } from '@core/constants';
import {
  CuentaMensual,
  EstadoCuenta,
  Residente,
  ResumenFinanciero,
  ResumenGastosMes,
  ResumenOcupacion,
  ResumenPorteria,
} from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { mensajeErrorApi } from '@core/utils';
import { CobranzaService } from '@core/services/cobranza.service';
import { CuentasMensualesService } from '@core/services/cuentas-mensuales.service';
import { GastosService } from '@core/services/gastos.service';
import { InmueblesService } from '@core/services/inmuebles.service';
import { PorteriaService } from '@core/services/porteria.service';
import { ResidentesService } from '@core/services/residentes.service';
import { UnidadesService } from '@core/services/unidades.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { CardComponent } from '@shared/components/card/card';
import { LoadingComponent } from '@shared/components/loading/loading';
import { StatCardComponent } from '@shared/components/stat-card/stat-card';
import { TableComponent } from '@shared/components/table/table';
import { TableBadgeVariant, TableColumn } from '@shared/interfaces';

function diasRestantes(fechaFin: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0);
  return Math.round((fin.getTime() - hoy.getTime()) / 86_400_000);
}

function varianteUrgencia(dias: number): TableBadgeVariant {
  if (dias <= 3) return 'danger';
  if (dias <= 7) return 'warning';
  return 'info';
}

function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

const VARIANTE_ESTADO_CUENTA: Record<EstadoCuenta, TableBadgeVariant> = {
  [EstadoCuenta.PENDIENTE]: 'warning',
  [EstadoCuenta.VENCIDA]: 'danger',
  [EstadoCuenta.PAGADA]: 'success',
};

const ETIQUETA_ESTADO_CUENTA: Record<EstadoCuenta, string> = {
  [EstadoCuenta.PENDIENTE]: 'Pendiente',
  [EstadoCuenta.VENCIDA]: 'Vencida',
  [EstadoCuenta.PAGADA]: 'Pagada',
};

// Panel de inicio, distinto por rol (ver propify_especificacion.md §3):
// - DUEÑO/ADMIN: "Caja Fuerte" (ingresos, gastos, ganancia neta, cartera
//   vencida), ocupación y contratos por vencer.
// - RESIDENTE: su propia cuenta y contrato — no ve nada financiero del
//   tenant completo.
// - CELADOR: solo lo operativo de portería (visitas activas, paquetes
//   pendientes) — sin acceso financiero, igual que en el resto del sistema.
@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    DatePipe,
    AlertComponent,
    ButtonComponent,
    CardComponent,
    LoadingComponent,
    NgbCollapseModule,
    StatCardComponent,
    TableComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly inmueblesService = inject(InmueblesService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly residentesService = inject(ResidentesService);
  private readonly cobranzaService = inject(CobranzaService);
  private readonly gastosService = inject(GastosService);
  private readonly porteriaService = inject(PorteriaService);
  private readonly cuentasMensualesService = inject(CuentasMensualesService);

  protected readonly formatoMonto = formatoMonto;
  protected readonly EstadoCuenta = EstadoCuenta;

  protected readonly esDuenoAdmin = computed(() =>
    this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN),
  );
  protected readonly esResidente = computed(() => this.auth.tieneRol(RoleNames.RESIDENTE));
  protected readonly esCelador = computed(() => this.auth.tieneRol(RoleNames.CELADOR));

  // ---------- DUEÑO / ADMIN ----------

  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly contratosPorVencer = signal<Residente[]>([]);
  // Colapsada por defecto para no saturar el inicio — se autoexpande si
  // aparece algún contrato urgente (ver cargarDuenoAdmin) apenas carga.
  protected readonly contratosExpandido = signal(false);
  protected readonly totalInmuebles = signal<number | null>(null);
  protected readonly resumenFinanciero = signal<ResumenFinanciero | null>(null);
  protected readonly resumenGastos = signal<ResumenGastosMes | null>(null);
  protected readonly resumenOcupacion = signal<ResumenOcupacion | null>(null);

  protected readonly ocupacionPct = computed(() => {
    const resumen = this.resumenOcupacion();
    if (!resumen || resumen.totalUnidades === 0) return null;
    return Math.round((resumen.ocupadas / resumen.totalUnidades) * 100);
  });

  protected readonly gananciaNeta = computed(() => {
    const financiero = this.resumenFinanciero();
    const gastos = this.resumenGastos();
    if (!financiero || !gastos) return null;
    return financiero.ingresosMes - gastos.totalMes;
  });

  protected readonly colorGanancia = computed(() =>
    (this.gananciaNeta() ?? 0) >= 0 ? 'success' : 'danger',
  );

  protected readonly columnas: TableColumn<Residente>[] = [
    { key: 'nombre', label: 'Inquilino' },
    { key: 'unidad', label: 'Unidad', valor: (f) => f.unidad?.identificador ?? '—' },
    {
      key: 'fechaFin',
      label: 'Vence',
      valor: (f) => new Date(f.fechaFin!).toLocaleDateString('es-CO'),
    },
    {
      key: 'diasRestantes',
      label: 'Días restantes',
      badge: (f) => {
        const dias = diasRestantes(f.fechaFin!);
        return {
          texto: dias <= 0 ? 'Vence hoy' : `${dias} día${dias === 1 ? '' : 's'}`,
          variante: varianteUrgencia(dias),
        };
      },
    },
  ];

  // Desglose de los contratos por vencer: "urgentes" (≤7 días) vs
  // "próximos" (8-15 días). Ambos derivados del mismo listado que
  // alimenta la tabla, no de una consulta aparte.
  protected readonly urgentes = computed(
    () => this.contratosPorVencer().filter((r) => diasRestantes(r.fechaFin!) <= 7).length,
  );

  protected readonly proximos = computed(() => this.contratosPorVencer().length - this.urgentes());

  // ---------- RESIDENTE ----------

  protected readonly residente = signal<Residente | null>(null);
  protected readonly misCuentas = signal<CuentaMensual[]>([]);
  protected readonly cargandoResidente = signal(true);

  protected readonly cuentaActual = computed(() => {
    const pendientes = this.misCuentas().filter((c) => c.estado !== EstadoCuenta.PAGADA);
    return pendientes.length > 0 ? pendientes[0] : null;
  });

  protected readonly diasContratoResidente = computed(() => {
    const fechaFin = this.residente()?.fechaFin;
    return fechaFin ? diasRestantes(fechaFin) : null;
  });

  // ---------- CELADOR ----------

  protected readonly resumenPorteria = signal<ResumenPorteria | null>(null);
  protected readonly cargandoPorteria = signal(true);

  ngOnInit(): void {
    if (this.esDuenoAdmin()) {
      this.cargarDuenoAdmin();
    }
    if (this.esResidente()) {
      this.cargarResidente();
    }
    if (this.esCelador()) {
      this.cargarCelador();
    }
  }

  private cargarDuenoAdmin(): void {
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => this.totalInmuebles.set(inmuebles.length),
      error: () => this.totalInmuebles.set(null),
    });

    this.unidadesService.consultarResumenOcupacion().subscribe({
      next: (resumen) => this.resumenOcupacion.set(resumen),
      error: () => this.resumenOcupacion.set(null),
    });

    this.cobranzaService.consultarResumen().subscribe({
      next: (resumen) => this.resumenFinanciero.set(resumen),
      error: () => this.resumenFinanciero.set(null),
    });

    this.gastosService.consultarResumen().subscribe({
      next: (resumen) => this.resumenGastos.set(resumen),
      error: () => this.resumenGastos.set(null),
    });

    this.residentesService.consultarPorVencer().subscribe({
      next: (residentes) => {
        this.contratosPorVencer.set(residentes);
        this.cargando.set(false);
        this.contratosExpandido.set(residentes.some((r) => diasRestantes(r.fechaFin!) <= 7));
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(
          mensajeErrorApi(error, 'No se pudieron cargar los contratos por vencer.'),
        );
      },
    });
  }

  private cargarResidente(): void {
    this.residentesService.consultarMe().subscribe({
      next: (residente) => this.residente.set(residente),
      error: () => this.residente.set(null),
    });

    this.cuentasMensualesService.consultarMias().subscribe({
      next: (cuentas) => {
        this.misCuentas.set(cuentas);
        this.cargandoResidente.set(false);
      },
      error: () => this.cargandoResidente.set(false),
    });
  }

  private cargarCelador(): void {
    this.porteriaService.consultarResumen().subscribe({
      next: (resumen) => {
        this.resumenPorteria.set(resumen);
        this.cargandoPorteria.set(false);
      },
      error: () => this.cargandoPorteria.set(false),
    });
  }

  protected etiquetaEstadoCuenta(estado: EstadoCuenta): string {
    return ETIQUETA_ESTADO_CUENTA[estado];
  }

  protected varianteEstadoCuenta(estado: EstadoCuenta): TableBadgeVariant {
    return VARIANTE_ESTADO_CUENTA[estado];
  }
}
