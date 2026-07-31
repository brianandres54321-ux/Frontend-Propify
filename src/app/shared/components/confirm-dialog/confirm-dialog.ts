import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ButtonComponent } from '../button/button';

// Nota: usa propiedades planas (no input() signal) porque NgbModal asigna
// los datos imperativamente vía componentInstance al abrir el modal.
@Component({
  selector: 'app-confirm-dialog',
  imports: [ButtonComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  public titulo = 'Confirmar';
  public mensaje = '';
  public textoConfirmar = 'Confirmar';
  public textoCancelar = 'Cancelar';

  constructor(public readonly activeModal: NgbActiveModal) {}
}
