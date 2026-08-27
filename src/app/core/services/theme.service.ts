import { Injectable, signal } from '@angular/core';

export type Tema = 'light' | 'dark';

const CLAVE_TEMA = 'propify_theme';

// El script inline en index.html ya aplicó data-theme/data-bs-theme antes
// de que Angular arrancara (evita el parpadeo) — este servicio solo toma
// ese mismo valor como estado inicial y lo mantiene sincronizado cuando el
// usuario alterna el tema desde el toggle.
function leerTemaAplicado(): Tema {
  const atributo = document.documentElement.getAttribute('data-theme');
  return atributo === 'dark' ? 'dark' : 'light';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  public readonly tema = signal<Tema>(leerTemaAplicado());

  public alternar(): void {
    this.establecer(this.tema() === 'dark' ? 'light' : 'dark');
  }

  public establecer(tema: Tema): void {
    this.tema.set(tema);
    document.documentElement.setAttribute('data-theme', tema);
    document.documentElement.setAttribute('data-bs-theme', tema);
    localStorage.setItem(CLAVE_TEMA, tema);
  }
}
