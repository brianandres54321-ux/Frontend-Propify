import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { RoleNames } from '../../core/constants/roles.constant';
import { Residente } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { mensajeErrorApi } from '../../core/services/api-error.util';
import { InmueblesService } from '../../core/services/inmuebles.service';
import { ResidentesService } from '../../core/services/residentes.service';
import { AlertComponent } from '../../shared/components/alert/alert';
import { CardComponent } from '../../shared/components/card/card';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { TableComponent } from '../../shared/components/table/table';
import { TableBadgeVariant, TableColumn } from '../../shared/interfaces/table-column.interface';

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

// Resumen del tenant. Por ahora "inmuebles registrados" y "contratos por
// vencer" (spec: avisar al dueño 15 días antes, por correo — ver
// CobranzaService — y aquí en el panel). Más widgets (cobranza, avisos,
// alertas) se agregan cuando se construyan esos módulos.
@Component({
  selector: 'app-dashboard-page',
  imports: [AlertComponent, CardComponent, LoadingComponent, StatCardComponent, TableComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly inmueblesService = inject(InmueblesService);
  private readonly residentesService = inject(ResidentesService);

  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly contratosPorVencer = signal<Residente[]>([]);
  protected readonly totalInmuebles = signal<number | null>(null);

  protected readonly puedeVerContratos = computed(() =>
    this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN),
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

  // Desglose de los contratos por vencer para el donut: "urgentes" (≤7
  // días) vs "próximos" (8-15 días). Ambos derivados del mismo listado que
  // alimenta la tabla, no de una consulta aparte.
  protected readonly urgentes = computed(
    () => this.contratosPorVencer().filter((r) => diasRestantes(r.fechaFin!) <= 7).length,
  );

  protected readonly proximos = computed(
    () => this.contratosPorVencer().length - this.urgentes(),
  );

  protected readonly porcentajeUrgentes = computed(() => {
    const total = this.contratosPorVencer().length;
    return total === 0 ? 0 : Math.round((this.urgentes() / total) * 100);
  });

  protected readonly donutGradiente = computed(() => {
    const pct = this.porcentajeUrgentes();
    return `conic-gradient(var(--color-danger) 0% ${pct}%, var(--color-info) ${pct}% 100%)`;
  });

  ngOnInit(): void {
    if (!this.puedeVerContratos()) {
      return;
    }

    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => this.totalInmuebles.set(inmuebles.length),
      error: () => this.totalInmuebles.set(null),
    });

    this.residentesService.consultarPorVencer().subscribe({
      next: (residentes) => {
        this.contratosPorVencer.set(residentes);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(
          mensajeErrorApi(error, 'No se pudieron cargar los contratos por vencer.'),
        );
      },
    });
  }
}
