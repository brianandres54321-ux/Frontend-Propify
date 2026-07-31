import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './footer/footer';
import { NavbarComponent } from './navbar/navbar';

@Component({
  selector: 'app-publico-layout',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './publico-layout.html',
  styleUrl: './publico-layout.scss',
})
export class PublicoLayout {}
