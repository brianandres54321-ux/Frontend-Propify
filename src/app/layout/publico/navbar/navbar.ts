import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle';

// Navbar público: sólido siempre (con blur). El hero de "/" ya no es una
// foto a sangre, así que no hay nada detrás que justifique el modo
// transparente que tenía antes.
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {}
