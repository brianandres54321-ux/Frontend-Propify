import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { MensajeContactoRegistro } from '@core/models';
import { mensajeErrorApi } from '@core/utils';
import { AlertasService } from '@core/services/alertas.service';
import { MensajesContactoService } from '@core/services/mensajes-contacto.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { LoadingComponent } from '@shared/components/loading/loading';
import { PaginationComponent } from '@shared/components/pagination/pagination';

const TAMANIO_PAGINA = 10;

@Component({
  selector: 'app-mensajes-contacto-page',
  imports: [DatePipe, AlertComponent, ButtonComponent, LoadingComponent, PaginationComponent],
  templateUrl: './mensajes-contacto.page.html',
  styleUrl: './mensajes-contacto.page.scss',
})
export class MensajesContactoPage implements OnInit {
  private readonly mensajesService = inject(MensajesContactoService);
  private readonly alertasService = inject(AlertasService);

  protected readonly mensajes = signal<MensajeContactoRegistro[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly pagina = signal(1);
  protected readonly soloSinAtender = signal(false);
  protected readonly expandido = signal<number | null>(null);

  protected readonly tamanioPagina = TAMANIO_PAGINA;

  protected readonly sinAtender = computed(() => this.mensajes().filter((m) => !m.atendido).length);

  protected readonly filtrados = computed(() =>
    this.soloSinAtender() ? this.mensajes().filter((m) => !m.atendido) : this.mensajes(),
  );

  protected readonly pagina0 = computed(() => {
    const inicio = (this.pagina() - 1) * TAMANIO_PAGINA;
    return this.filtrados().slice(inicio, inicio + TAMANIO_PAGINA);
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.mensajesService.consultar().subscribe({
      next: (mensajes) => {
        this.mensajes.set(mensajes);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar los mensajes.'));
      },
    });
  }

  protected alternarFiltro(): void {
    this.soloSinAtender.set(!this.soloSinAtender());
    this.pagina.set(1);
  }

  protected cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.expandido.set(null);
  }

  protected alternarExpandido(id: number): void {
    this.expandido.set(this.expandido() === id ? null : id);
  }

  protected marcarAtendido(mensaje: MensajeContactoRegistro): void {
    const nuevoValor = !mensaje.atendido;
    this.mensajesService.marcarAtendido(mensaje.codMensaje, nuevoValor).subscribe({
      next: () => {
        this.mensajes.set(
          this.mensajes().map((m) =>
            m.codMensaje === mensaje.codMensaje ? { ...m, atendido: nuevoValor } : m,
          ),
        );
        // Mantiene sincronizado el contador de la campana del topbar.
        this.alertasService.refrescarMensajesContacto();
      },
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo actualizar el mensaje.')),
    });
  }
}
