import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { BANDERAS_DISPONIBLES_POR_PLAN } from '@core/constants';
import { AuthService } from '@core/services/auth.service';
import { LayoutService } from '@shared/services/layout.service';
import { TenantsService } from '@core/services/tenants.service';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly tenantsService = inject(TenantsService);
  protected readonly layout = inject(LayoutService);

  protected readonly itemsVisibles = computed(() => {
    const plan = this.tenantsService.plan();
    return NAV_ITEMS.filter((item) => {
      const tieneRol = item.roles.length === 0 || this.auth.tieneRol(...item.roles);
      if (!tieneRol) {
        return false;
      }
      // Sin bandera asociada, el ítem no depende del plan (p. ej. Cobranza).
      // Con bandera: mientras el plan no haya cargado, se oculta — mejor
      // eso que mostrarlo y hacerlo desaparecer un instante después.
      if (!item.bandera) {
        return true;
      }
      return plan !== null && BANDERAS_DISPONIBLES_POR_PLAN[plan].has(item.bandera);
    });
  });

  protected cerrarMovil(): void {
    this.layout.cerrarMovil();
  }
}
