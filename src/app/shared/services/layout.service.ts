import { Injectable, signal } from '@angular/core';

const CLAVE_COLAPSADO = 'propify_sidebar_colapsado';

// Estado compartido entre Navbar (dispara los toggles) y Sidebar (los
// consume) para el colapsado en desktop y el off-canvas en móvil.
@Injectable({ providedIn: 'root' })
export class LayoutService {
  protected readonly inicial = localStorage.getItem(CLAVE_COLAPSADO) === '1';

  public readonly sidebarColapsado = signal(this.inicial);
  public readonly sidebarMovilAbierto = signal(false);

  public toggleColapsado(): void {
    const nuevo = !this.sidebarColapsado();
    this.sidebarColapsado.set(nuevo);
    localStorage.setItem(CLAVE_COLAPSADO, nuevo ? '1' : '0');
  }

  public toggleMovil(): void {
    this.sidebarMovilAbierto.update((abierto) => !abierto);
  }

  public cerrarMovil(): void {
    this.sidebarMovilAbierto.set(false);
  }
}
