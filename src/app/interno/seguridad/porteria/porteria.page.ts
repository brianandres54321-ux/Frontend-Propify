import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import {
  AutorizacionPrevia,
  ContactoResidente,
  Inmueble,
  PanoramaPorteria,
  Paquete,
  UnidadPanorama,
  Visita,
} from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { RoleNames } from '@core/constants';
import { mensajeErrorApi, urlWhatsapp } from '@core/utils';
import { InmueblesService } from '@core/services/inmuebles.service';
import { PorteriaService } from '@core/services/porteria.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableColumn } from '@shared/interfaces';
import { PaqueteFormModal } from './components/paquete-form-modal';
import { VisitaFormModal } from './components/visita-form-modal';

function formatoFechaHora(valor?: string): string {
  return valor ? new Date(valor).toLocaleString('es-CO') : '—';
}

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

@Component({
  selector: 'app-porteria-page',
  imports: [
    FormsModule,
    NgbNavModule,
    AlertComponent,
    ButtonComponent,
    LoadingComponent,
    TableComponent,
  ],
  templateUrl: './porteria.page.html',
  styleUrl: './porteria.page.scss',
})
export class PorteriaPage implements OnInit {
  private readonly inmueblesService = inject(InmueblesService);
  private readonly porteriaService = inject(PorteriaService);
  private readonly modalService = inject(NgbModal);
  private readonly auth = inject(AuthService);

  protected readonly inmuebles = signal<Inmueble[]>([]);
  protected readonly inmuebleSeleccionado = signal<number | ''>('');
  protected readonly panorama = signal<PanoramaPorteria | null>(null);

  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly filtroVisitas = signal('');
  protected readonly filtroDirectorio = signal('');
  protected readonly mostrarEntregados = signal(false);
  protected readonly pestana = signal<'visitas' | 'paquetes' | 'directorio'>('visitas');

  // Portería la opera el celador, pero el dueño (y su admin) también pueden
  // registrar entradas/salidas y paquetes. El backend permite los 3 roles.
  protected readonly puedeOperar = computed(() =>
    this.auth.tieneRol(RoleNames.CELADOR, RoleNames.DUENO, RoleNames.ADMIN),
  );

  protected readonly unidades = computed<UnidadPanorama[]>(() => this.panorama()?.unidades ?? []);
  private readonly mapaUnidades = computed(
    () => new Map(this.unidades().map((u) => [u.codUnidad, u])),
  );

  protected readonly nombreInmueble = computed(
    () => this.inmuebles().find((i) => i.codInmueble === this.inmuebleSeleccionado())?.nombre ?? '',
  );

  protected readonly visitasActivas = computed<Visita[]>(() => {
    const q = normalizar(this.filtroVisitas().trim());
    const lista = this.panorama()?.visitasActivas ?? [];
    if (!q) {
      return lista;
    }
    return lista.filter((v) =>
      normalizar(
        [
          v.nombreVisitante,
          v.acompanantes ?? '',
          v.vehiculos ?? '',
          this.etiquetaUnidad(v.codUnidad),
        ].join(' '),
      ).includes(q),
    );
  });

  protected readonly paquetesPendientes = computed<Paquete[]>(
    () => this.panorama()?.paquetesPendientes ?? [],
  );
  protected readonly paquetesEntregados = computed<Paquete[]>(
    () => this.panorama()?.paquetesEntregados ?? [],
  );
  protected readonly autorizaciones = computed<AutorizacionPrevia[]>(
    () => this.panorama()?.autorizacionesVigentes ?? [],
  );

  protected readonly directorio = computed<UnidadPanorama[]>(() => {
    const q = normalizar(this.filtroDirectorio().trim());
    const lista = this.unidades();
    if (!q) {
      return lista;
    }
    return lista.filter((u) =>
      normalizar(
        [
          u.identificador,
          u.torre ?? '',
          ...u.residentes.map((r) => `${r.nombre} ${r.telefono}`),
        ].join(' '),
      ).includes(q),
    );
  });

  protected readonly columnasVisitas: TableColumn<Visita>[] = [
    { key: 'unidad', label: 'Unidad', valor: (f) => this.etiquetaUnidad(f.codUnidad) },
    { key: 'nombreVisitante', label: 'Visitante' },
    {
      key: 'numeroPersonas',
      label: 'Personas',
      valor: (f) =>
        f.numeroPersonas > 1
          ? `${f.numeroPersonas}${f.acompanantes ? ` · ${f.acompanantes}` : ''}`
          : '1',
    },
    { key: 'vehiculos', label: 'Vehículos', valor: (f) => f.vehiculos ?? '—' },
    { key: 'firma', label: 'Firma', imagen: (f) => f.firma },
    { key: 'horaEntrada', label: 'Entrada', valor: (f) => formatoFechaHora(f.horaEntrada) },
  ];

  protected readonly columnasPaquetes: TableColumn<Paquete>[] = [
    { key: 'unidad', label: 'Unidad', valor: (f) => this.etiquetaUnidad(f.codUnidad) },
    { key: 'descripcion', label: 'Descripción', valor: (f) => f.descripcion ?? '—' },
    { key: 'horaLlegada', label: 'Llegada', valor: (f) => formatoFechaHora(f.horaLlegada) },
    {
      key: 'notificado',
      label: 'Aviso',
      badge: (f) =>
        f.notificado
          ? { texto: 'Avisado', variante: 'success' }
          : { texto: 'Sin avisar', variante: 'warning' },
    },
  ];

  protected readonly columnasEntregados: TableColumn<Paquete>[] = [
    { key: 'unidad', label: 'Unidad', valor: (f) => this.etiquetaUnidad(f.codUnidad) },
    { key: 'descripcion', label: 'Descripción', valor: (f) => f.descripcion ?? '—' },
    { key: 'horaLlegada', label: 'Llegada', valor: (f) => formatoFechaHora(f.horaLlegada) },
    { key: 'horaRetiro', label: 'Retiro', valor: (f) => formatoFechaHora(f.horaRetiro) },
  ];

  protected readonly columnasAutorizaciones: TableColumn<AutorizacionPrevia>[] = [
    { key: 'unidad', label: 'Unidad', valor: (f) => this.etiquetaUnidad(f.codUnidad) },
    { key: 'nombreEsperado', label: 'Nombre esperado' },
    { key: 'notas', label: 'Notas', valor: (f) => f.notas ?? '—' },
    { key: 'ventanaFin', label: 'Válida hasta', valor: (f) => formatoFechaHora(f.ventanaFin) },
  ];

  protected etiquetaUnidad(codUnidad: number): string {
    const u = this.mapaUnidades().get(codUnidad);
    if (!u) {
      return '—';
    }
    return u.torre ? `${u.torre} · ${u.identificador}` : u.identificador;
  }

  ngOnInit(): void {
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => {
        const conCelador = inmuebles.filter((i) => i.tieneCelador);
        this.inmuebles.set(conCelador);
        if (conCelador.length > 0) {
          this.inmuebleSeleccionado.set(conCelador[0].codInmueble);
          this.recargar();
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
    this.filtroVisitas.set('');
    this.filtroDirectorio.set('');
    this.recargar();
  }

  private recargar(): void {
    const inmuebleId = this.inmuebleSeleccionado();
    if (!inmuebleId) {
      this.panorama.set(null);
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.porteriaService.consultarPanorama(inmuebleId).subscribe({
      next: (panorama) => {
        this.panorama.set(panorama);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.panorama.set(null);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo cargar la portería.'));
      },
    });
  }

  protected abrirRegistrarVisita(): void {
    if (this.unidades().length === 0) {
      return;
    }
    const modalRef = this.modalService.open(VisitaFormModal, { centered: true, size: 'lg' });
    (modalRef.componentInstance as VisitaFormModal).unidades = this.unidades();

    modalRef.result.then(
      (datos) => {
        this.porteriaService.registrarEntradaVisita(datos).subscribe({
          next: () => this.recargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo registrar la entrada.')),
        });
      },
      () => undefined,
    );
  }

  protected abrirRegistrarPaquete(): void {
    if (this.unidades().length === 0) {
      return;
    }
    const modalRef = this.modalService.open(PaqueteFormModal, { centered: true, size: 'lg' });
    (modalRef.componentInstance as PaqueteFormModal).unidades = this.unidades();

    modalRef.result.then(
      (datos) => {
        this.porteriaService.registrarLlegadaPaquete(datos).subscribe({
          next: () => this.recargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo registrar el paquete.')),
        });
      },
      () => undefined,
    );
  }

  protected registrarSalida(visita: Visita): void {
    this.porteriaService.registrarSalidaVisita(visita.codVisita).subscribe({
      next: () => this.recargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo registrar la salida.')),
    });
  }

  protected registrarEntrega(paquete: Paquete): void {
    this.porteriaService.registrarEntregaPaquete(paquete.codPaquete).subscribe({
      next: () => this.recargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo marcar como entregado.')),
    });
  }

  // Abre WhatsApp con el mensaje listo y marca el paquete como avisado.
  protected avisarPaquete(paquete: Paquete): void {
    const contacto = this.contactoConTelefono(paquete.codUnidad);
    if (!contacto) {
      this.errorMensaje.set(
        `La unidad ${this.etiquetaUnidad(paquete.codUnidad)} no tiene un residente con teléfono registrado.`,
      );
      return;
    }

    const detalle = paquete.descripcion ? ` (${paquete.descripcion})` : '';
    const mensaje = `Hola, le escribo desde la portería de ${this.nombreInmueble()}. Llegó un paquete o domicilio a su nombre${detalle}. Puede pasar a recogerlo cuando quiera.`;
    window.open(urlWhatsapp(contacto.telefono, mensaje), '_blank');

    this.porteriaService.marcarPaqueteNotificado(paquete.codPaquete).subscribe({
      next: () => this.recargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo marcar el aviso.')),
    });
  }

  protected escribirWhatsapp(contacto: ContactoResidente): void {
    const mensaje = `Hola ${contacto.nombre}, le escribo desde la portería de ${this.nombreInmueble()}.`;
    window.open(urlWhatsapp(contacto.telefono, mensaje), '_blank');
  }

  private contactoConTelefono(codUnidad: number): ContactoResidente | undefined {
    return this.mapaUnidades()
      .get(codUnidad)
      ?.residentes.find((r) => r.telefono?.trim());
  }
}
