import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  protected readonly layout = inject(LayoutService);

  protected readonly itemsVisibles = computed(() =>
    NAV_ITEMS.filter(
      (item) => item.roles.length === 0 || this.auth.tieneRol(...item.roles),
    ),
  );

  protected cerrarMovil(): void {
    this.layout.cerrarMovil();
  }
}
