import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AutorizacionPrevia, Inmueble, Paquete, Unidad, Visita } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { RoleNames } from '@core/constants';
import { mensajeErrorApi } from '@core/services/api-error.util';
import { InmueblesService } from '@core/services/inmuebles.service';
import { PorteriaService } from '@core/services/porteria.service';
import { UnidadesService } from '@core/services/unidades.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableColumn } from '@shared/interfaces';
import { PaqueteFormModal } from './paquete-form-modal';
import { VisitaFormModal } from './visita-form-modal';

function formatoFechaHora(valor?: string): string {
  return valor ? new Date(valor).toLocaleString('es-CO') : '—';
}

@Component({
  selector: 'app-porteria-page',
  imports: [AlertComponent, ButtonComponent, LoadingComponent, TableComponent],
  templateUrl: './porteria.page.html',
  styleUrl: './porteria.page.scss',
})
export class PorteriaPage implements OnInit {
  private readonly inmueblesService = inject(InmueblesService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly porteriaService = inject(PorteriaService);
  private readonly modalService = inject(NgbModal);
  private readonly auth = inject(AuthService);

  protected readonly inmuebles = signal<Inmueble[]>([]);
  protected readonly unidades = signal<Unidad[]>([]);
  protected readonly inmuebleSeleccionado = signal<number | ''>('');
  protected readonly unidadSeleccionada = signal<number | ''>('');

  protected readonly visitas = signal<Visita[]>([]);
  protected readonly paquetes = signal<Paquete[]>([]);
  protected readonly autorizaciones = signal<AutorizacionPrevia[]>([]);

  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly esCelador = computed(() => this.auth.tieneRol(RoleNames.CELADOR));

  protected readonly columnasVisitas: TableColumn<Visita>[] = [
    { key: 'nombreVisitante', label: 'Visitante' },
    { key: 'cedulaVisitante', label: 'Cédula', valor: (f) => f.cedulaVisitante ?? '—' },
    { key: 'horaEntrada', label: 'Entrada', valor: (f) => formatoFechaHora(f.horaEntrada) },
    { key: 'horaSalida', label: 'Salida', valor: (f) => formatoFechaHora(f.horaSalida) },
  ];

  protected readonly columnasPaquetes: TableColumn<Paquete>[] = [
    { key: 'descripcion', label: 'Descripción', valor: (f) => f.descripcion ?? '—' },
    { key: 'horaLlegada', label: 'Llegada', valor: (f) => formatoFechaHora(f.horaLlegada) },
    { key: 'horaRetiro', label: 'Retiro', valor: (f) => formatoFechaHora(f.horaRetiro) },
    {
      key: 'notificado',
      label: 'Notificado',
      badge: (f) =>
        f.notificado ? { texto: 'Sí', variante: 'success' } : { texto: 'No', variante: 'warning' },
    },
  ];

  protected readonly columnasAutorizaciones: TableColumn<AutorizacionPrevia>[] = [
    { key: 'nombreEsperado', label: 'Nombre esperado' },
    { key: 'notas', label: 'Notas', valor: (f) => f.notas ?? '—' },
    {
      key: 'ventanaInicio',
      label: 'Ventana inicio',
      valor: (f) => formatoFechaHora(f.ventanaInicio),
    },
    { key: 'ventanaFin', label: 'Ventana fin', valor: (f) => formatoFechaHora(f.ventanaFin) },
  ];

  ngOnInit(): void {
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => {
        const conCelador = inmuebles.filter((i) => i.tieneCelador);
        this.inmuebles.set(conCelador);
        if (conCelador.length > 0) {
          this.inmuebleSeleccionado.set(conCelador[0].codInmueble);
          this.cargarUnidades();
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
    this.cargarUnidades();
  }

  protected cambiarUnidad(valor: string): void {
    this.unidadSeleccionada.set(valor ? Number(valor) : '');
    this.cargar();
  }

  private cargarUnidades(): void {
    const inmuebleId = this.inmuebleSeleccionado();
    if (!inmuebleId) {
      this.unidades.set([]);
      this.unidadSeleccionada.set('');
      this.cargar();
      return;
    }

    this.unidadesService.consultar(inmuebleId).subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        this.unidadSeleccionada.set(unidades.length > 0 ? unidades[0].codUnidad : '');
        this.cargar();
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar las unidades.'));
      },
    });
  }

  private cargar(): void {
    const unidadId = this.unidadSeleccionada();
    if (!unidadId) {
      this.visitas.set([]);
      this.paquetes.set([]);
      this.autorizaciones.set([]);
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.porteriaService.consultarVisitas(unidadId).subscribe({
      next: (visitas) => {
        this.visitas.set(visitas);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar las visitas.'));
      },
    });

    this.porteriaService.consultarPaquetes(unidadId).subscribe({
      next: (paquetes) => this.paquetes.set(paquetes),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los paquetes.')),
    });

    if (this.esCelador()) {
      this.porteriaService.consultarAutorizacionesVigentes(unidadId).subscribe({
        next: (autorizaciones) => this.autorizaciones.set(autorizaciones),
        error: (error: unknown) =>
          this.errorMensaje.set(
            mensajeErrorApi(error, 'No se pudieron cargar las autorizaciones previas.'),
          ),
      });
    }
  }

  protected abrirRegistrarVisita(): void {
    const unidadId = this.unidadSeleccionada();
    if (!unidadId) {
      return;
    }

    const modalRef = this.modalService.open(VisitaFormModal, { centered: true });
    modalRef.result.then(
      (datos) => {
        this.porteriaService.registrarEntradaVisita({ ...datos, codUnidad: unidadId }).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo registrar la entrada.')),
        });
      },
      () => undefined,
    );
  }

  protected registrarSalida(visita: Visita): void {
    this.porteriaService.registrarSalidaVisita(visita.codVisita).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo registrar la salida.')),
    });
  }

  protected abrirRegistrarPaquete(): void {
    const unidadId = this.unidadSeleccionada();
    if (!unidadId) {
      return;
    }

    const modalRef = this.modalService.open(PaqueteFormModal, { centered: true });
    modalRef.result.then(
      (datos) => {
        this.porteriaService.registrarLlegadaPaquete({ ...datos, codUnidad: unidadId }).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo registrar el paquete.')),
        });
      },
      () => undefined,
    );
  }

  protected registrarEntrega(paquete: Paquete): void {
    this.porteriaService.registrarEntregaPaquete(paquete.codPaquete).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo marcar como entregado.')),
    });
  }
}
