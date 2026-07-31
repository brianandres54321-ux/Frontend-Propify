import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Landing: qué es Propify y a quién va dirigido. Contenido de marketing
// completo (secciones, precios, capturas) pendiente para la fase de vistas.
@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {}
