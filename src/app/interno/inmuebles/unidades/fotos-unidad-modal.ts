import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FotoUnidad } from '@core/models';
import { mensajeErrorApi } from '@core/services/api-error.util';
import { UnidadesService } from '@core/services/unidades.service';
import { AlertComponent } from '@shared/components/alert/alert';
import { ButtonComponent } from '@shared/components/button/button';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { LoadingComponent } from '@shared/components/loading/loading';

interface FotoConUrl {
  foto: FotoUnidad;
  url: string;
}

// Nota: usa una propiedad plana (no input() signal) — NgbModal asigna
// unidadId imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-fotos-unidad-modal',
  imports: [AlertComponent, ButtonComponent, LoadingComponent],
  templateUrl: './fotos-unidad-modal.html',
  styleUrl: './fotos-unidad-modal.scss',
})
export class FotosUnidadModal implements OnInit, OnDestroy {
  public unidadId!: number;
  public identificadorUnidad = '';

  private readonly unidadesService = inject(UnidadesService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly fotos = signal<FotoConUrl[]>([]);
  protected readonly cargando = signal(true);
  protected readonly subiendo = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  constructor(public readonly activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.liberarUrls();
  }

  private liberarUrls(): void {
    this.fotos().forEach(({ url }) => URL.revokeObjectURL(url));
  }

  private cargar(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.unidadesService.consultarFotos(this.unidadId).subscribe({
      next: (fotos) => {
        this.liberarUrls();
        this.fotos.set([]);
        this.cargando.set(false);

        for (const foto of fotos) {
          this.unidadesService.obtenerFotoBlob(this.unidadId, foto.codFoto).subscribe({
            next: (blob) => {
              const url = URL.createObjectURL(blob);
              this.fotos.update((actuales) => [...actuales, { foto, url }]);
            },
          });
        }
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudieron cargar las fotos.'));
      },
    });
  }

  protected seleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) {
      return;
    }

    this.subiendo.set(true);
    this.errorMensaje.set(null);

    this.unidadesService.subirFoto(this.unidadId, archivo).subscribe({
      next: () => {
        this.subiendo.set(false);
        input.value = '';
        this.cargar();
      },
      error: (error: unknown) => {
        this.subiendo.set(false);
        input.value = '';
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo subir la foto.'));
      },
    });
  }

  protected async eliminar(foto: FotoUnidad): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      titulo: 'Eliminar foto',
      mensaje: '¿Eliminar esta foto? Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }

    this.unidadesService.eliminarFoto(this.unidadId, foto.codFoto).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) =>
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo eliminar la foto.')),
    });
  }
}
