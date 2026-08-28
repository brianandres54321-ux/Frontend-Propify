import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PlanTipo, SolicitudUpgrade } from '@core/models';
import { mensajeErrorApi } from '@core/utils';
import { AlertasService } from '@core/services/alertas.service';
import { SolicitudesUpgradeService } from '@core/services/solicitudes-upgrade.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { PaginationComponent } from '@shared/components/pagination/pagination';

const TAMANIO_PAGINA = 10;

const ETIQUETAS_PLAN: Record<PlanTipo, string> = {
  [PlanTipo.CASAS]: 'Casas',
  [PlanTipo.EDIFICIOS]: 'Edificios',
  [PlanTipo.CONJUNTOS]: 'Conjuntos',
};

@Component({
  selector: 'app-solicitudes-upgrade-page',
  imports: [
    DatePipe,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    LoadingComponent,
    PaginationComponent,
  ],
  templateUrl: './solicitudes-upgrade.page.html',
  styleUrl: './solicitudes-upgrade.page.scss',
})
export class SolicitudesUpgradePage implements OnInit {
  private readonly solicitudesService = inject(SolicitudesUpgradeService);
  private readonly alertasService = inject(AlertasService);

  protected readonly solicitudes = signal<SolicitudUpgrade[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly pagina = signal(1);
  protected readonly soloPendientes = signal(false);
  protected readonly expandido = signal<number | null>(null);

  protected readonly tamanioPagina = TAMANIO_PAGINA;
  protected readonly etiquetasPlan = ETIQUETAS_PLAN;

  protected readonly pendientes = computed(
    () => this.solicitudes().filter((s) => !s.atendida).length,
  );

  protected readonly filtradas = computed(() =>
    this.soloPendientes() ? this.solicitudes().filter((s) => !s.atendida) : this.solicitudes(),
  );

  protected readonly paginaActual = computed(() => {
    const inicio = (this.pagina() - 1) * TAMANIO_PAGINA;
    return this.filtradas().slice(inicio, inicio + TAMANIO_PAGINA);
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.solicitudesService.consultar().subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar las solicitudes.'));
      },
    });
  }

  protected alternarFiltro(): void {
    this.soloPendientes.set(!this.soloPendientes());
    this.pagina.set(1);
  }

  protected cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.expandido.set(null);
  }

  protected alternarExpandido(id: number): void {
    this.expandido.set(this.expandido() === id ? null : id);
  }

  protected marcarAtendida(solicitud: SolicitudUpgrade): void {
    const nuevoValor = !solicitud.atendida;
    this.solicitudesService.marcarAtendida(solicitud.codSolicitud, nuevoValor).subscribe({
      next: () => {
        this.solicitudes.set(
          this.solicitudes().map((s) =>
            s.codSolicitud === solicitud.codSolicitud ? { ...s, atendida: nuevoValor } : s,
          ),
        );
        this.alertasService.refrescarSolicitudesUpgrade();
      },
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar la solicitud.')),
    });
  }
}
