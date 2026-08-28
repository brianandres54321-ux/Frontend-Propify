import { Injectable, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PlanTipo } from '@core/models';
import { SolicitarUpgradeModal } from './solicitar-upgrade-modal';

// Uso: this.solicitarUpgrade.abrir(this.tenantsService.plan());
@Injectable({ providedIn: 'root' })
export class SolicitarUpgradeDialogService {
  private readonly modalService = inject(NgbModal);

  public abrir(planActual: PlanTipo | null = null): void {
    const modalRef = this.modalService.open(SolicitarUpgradeModal, { centered: true });
    (modalRef.componentInstance as SolicitarUpgradeModal).planActual = planActual;
  }
}
