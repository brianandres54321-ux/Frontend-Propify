import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Aviso, Inmueble } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { RoleNames } from '@core/constants';
import { mensajeErrorApi } from '@core/services/api-error.util';
import { AvisosService } from '@core/services/avisos.service';
import { InmueblesService } from '@core/services/inmuebles.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { TableComponent } from '@shared/components/table/table';
import { TableColumn } from '@shared/interfaces';
import { AvisoFormModal } from './aviso-form-modal';

@Component({
  selector: 'app-avisos-page',
  imports: [AlertComponent, ButtonComponent, LoadingComponent, TableComponent],
  templateUrl: './avisos.page.html',
  styleUrl: './avisos.page.scss',
})
export class AvisosPage implements OnInit {
  private readonly avisosService = inject(AvisosService);
  private readonly inmueblesService = inject(InmueblesService);
  private readonly modalService = inject(NgbModal);
  private readonly auth = inject(AuthService);

  protected readonly avisos = signal<Aviso[]>([]);
  protected readonly inmuebles = signal<Inmueble[]>([]);
  protected readonly inmuebleSeleccionado = signal<number | ''>('');
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly puedeGestionar = computed(() =>
    this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN),
  );

  protected readonly columnas: TableColumn<Aviso>[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'mensaje', label: 'Mensaje' },
    {
      key: 'creadoEn',
      label: 'Publicado',
      valor: (f) => new Date(f.creadoEn).toLocaleString('es-CO'),
    },
  ];

  ngOnInit(): void {
    this.inmueblesService.consultar().subscribe({
      next: (inmuebles) => {
        const conCartelera = inmuebles.filter((i) => i.tieneCartelera);
        this.inmuebles.set(conCartelera);
        if (conCartelera.length > 0) {
          this.inmuebleSeleccionado.set(conCartelera[0].codInmueble);
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
      this.avisos.set([]);
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.avisosService.consultar(inmuebleId).subscribe({
      next: (avisos) => {
        this.avisos.set(avisos);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los avisos.'));
      },
    });
  }

  protected abrirCrear(): void {
    const inmuebleId = this.inmuebleSeleccionado();
    if (!inmuebleId) {
      return;
    }

    const modalRef = this.modalService.open(AvisoFormModal, { centered: true });

    modalRef.result.then(
      (datos) => {
        this.avisosService.registrar({ ...datos, codInmueble: inmuebleId }).subscribe({
          next: () => this.cargar(),
          error: (error: unknown) =>
            this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo publicar el aviso.')),
        });
      },
      () => undefined,
    );
  }
}
