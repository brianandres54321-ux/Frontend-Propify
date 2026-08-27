import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RoleNames } from '@core/constants';
import { AlertasService } from '@core/services/alertas.service';
import { AuthService } from '@core/services/auth.service';
import { TenantsService } from '@core/services/tenants.service';
import { FooterComponent } from './footer/footer';
import { NavbarComponent } from './navbar/navbar';
import { SidebarComponent } from './sidebar/sidebar';

@Component({
  selector: 'app-interno-layout',
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, FooterComponent],
  templateUrl: './interno-layout.html',
  styleUrl: './interno-layout.scss',
})
export class InternoLayout implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly tenantsService = inject(TenantsService);
  private readonly alertasService = inject(AlertasService);

  ngOnInit(): void {
    // El superadministrador no tiene tenant propio (tenant_id es null) —
    // consultar /privado/tenants/mi-tenant para él siempre da 404.
    if (!this.auth.tieneRol(RoleNames.SUPERADMIN)) {
      this.tenantsService.consultarPropio().subscribe({ error: () => undefined });
    }

    // Se dispara una sola vez aquí (raíz de todas las páginas /app) para
    // que la campana del navbar tenga datos sin importar en qué página
    // entre el usuario primero.
    this.alertasService.cargar();
  }
}
