import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ArriendoInmueblePublico, ArriendoResumenUnidad, TipoUnidad } from '@core/models';
import { ArriendosService } from '@core/services/arriendos.service';
import { mensajeErrorApi, urlWhatsapp } from '@core/utils';
import { AlertComponent } from '@shared/components/alert/alert';
import { LoadingComponent } from '@shared/components/loading/loading';

const ETIQUETAS_TIPO: Record<TipoUnidad, string> = {
  [TipoUnidad.APARTAMENTO]: 'Apartamento',
  [TipoUnidad.APARTAESTUDIO]: 'Apartaestudio',
  [TipoUnidad.HABITACION]: 'Habitación / Pieza',
  [TipoUnidad.LOCAL]: 'Local comercial',
  [TipoUnidad.OFICINA]: 'Oficina',
};

function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

// Página pública (sin login): vitrina de las unidades VACANTE de un
// inmueble — útil cuando un edificio/conjunto tiene varias unidades
// disponibles al tiempo. Ver ArriendosController en el backend.
@Component({
  selector: 'app-arriendo-inmueble-page',
  imports: [RouterLink, AlertComponent, LoadingComponent],
  templateUrl: './arriendo-inmueble.page.html',
  styleUrl: './arriendo-inmueble.page.scss',
})
export class ArriendoInmueblePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly arriendosService = inject(ArriendosService);

  protected readonly datos = signal<ArriendoInmueblePublico | null>(null);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly etiquetasTipo = ETIQUETAS_TIPO;
  protected readonly formatoMonto = formatoMonto;

  ngOnInit(): void {
    const inmuebleId = Number(this.route.snapshot.paramMap.get('inmuebleId'));
    this.arriendosService.consultarPorInmueble(inmuebleId).subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'No se pudo cargar este inmueble.'));
      },
    });
  }

  protected urlFotoPortada(codUnidad: number, codFoto: number): string {
    return this.arriendosService.urlFoto(codUnidad, codFoto);
  }

  protected urlWhatsapp(unidad: ArriendoResumenUnidad): string {
    return urlWhatsapp(
      this.datos()!.telefonoContacto!,
      `Hola, vi tu anuncio de ${this.etiquetasTipo[unidad.tipo]} ${unidad.identificador} en Propify y estoy interesado.`,
    );
  }
}
