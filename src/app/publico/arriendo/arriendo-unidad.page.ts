import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ArriendoUnidadPublico, TipoUnidad } from '@core/models';
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

// Página pública (sin login): anuncio de una unidad en arriendo, ver
// ArriendosController en el backend. Solo existe mientras
// estadoOcupacion = VACANTE — si no, el backend responde 404.
@Component({
  selector: 'app-arriendo-unidad-page',
  imports: [AlertComponent, LoadingComponent],
  templateUrl: './arriendo-unidad.page.html',
  styleUrl: './arriendo-unidad.page.scss',
})
export class ArriendoUnidadPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly arriendosService = inject(ArriendosService);

  protected readonly unidad = signal<ArriendoUnidadPublico | null>(null);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly etiquetasTipo = ETIQUETAS_TIPO;
  protected readonly formatoMonto = formatoMonto;

  ngOnInit(): void {
    const unidadId = Number(this.route.snapshot.paramMap.get('unidadId'));
    this.arriendosService.consultarUnidad(unidadId).subscribe({
      next: (unidad) => {
        this.unidad.set(unidad);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'Este anuncio no está disponible.'));
      },
    });
  }

  protected urlFoto(codFoto: number): string {
    return this.arriendosService.urlFoto(this.unidad()!.codUnidad, codFoto);
  }

  protected urlWhatsapp(telefono: string): string {
    return urlWhatsapp(
      telefono,
      `Hola, vi tu anuncio de ${this.unidad()?.identificador} en Propify y estoy interesado.`,
    );
  }
}
