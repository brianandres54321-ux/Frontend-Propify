import { Injectable, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmDialogComponent } from './confirm-dialog';

export interface ConfirmDialogOptions {
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

// Uso: const ok = await this.confirmDialog.confirm({ mensaje: '¿Eliminar la unidad?' });
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly modalService = inject(NgbModal);

  public confirm(opciones: ConfirmDialogOptions): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmDialogComponent, { centered: true });
    const instancia: ConfirmDialogComponent = modalRef.componentInstance;

    instancia.titulo = opciones.titulo ?? 'Confirmar';
    instancia.mensaje = opciones.mensaje;
    instancia.textoConfirmar = opciones.textoConfirmar ?? 'Confirmar';
    instancia.textoCancelar = opciones.textoCancelar ?? 'Cancelar';

    return modalRef.result.then(
      () => true,
      () => false,
    );
  }
}
