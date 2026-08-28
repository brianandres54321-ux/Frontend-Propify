import { Location } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ArriendoRelacionada, ArriendoUnidadPublico, TipoUnidad } from '@core/models';
import { ArriendosService } from '@core/services/arriendos.service';
import { mensajeErrorApi, urlWhatsapp } from '@core/utils';
import { AlertComponent } from '@shared/components/alert/alert';
import { LoadingComponent } from '@shared/components/loading/loading';

import { GaleriaFotosComponent } from './components/galeria-fotos/galeria-fotos';

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

function formatoMillones(valor?: number): string {
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) {
    return '';
  }
  if (n < 1_000_000) {
    return '$' + n.toLocaleString('es-CO');
  }
  const millones = n / 1_000_000;
  const texto =
    millones >= 100 || Number.isInteger(millones)
      ? millones.toLocaleString('es-CO', { maximumFractionDigits: 0 })
      : millones.toLocaleString('es-CO', { maximumFractionDigits: 1 });
  return `$${texto} M`;
}

interface DatoClave {
  icono: string;
  valor: string;
  etiqueta: string;
}

interface Chip {
  icono: string;
  texto: string;
}

// Página pública (sin login): anuncio de una unidad en arriendo y/o venta.
// Ver ArriendosController en el backend — solo existe mientras la unidad esté
// publicada (VACANTE o enVenta), si no responde 404.
@Component({
  selector: 'app-arriendo-unidad-page',
  imports: [RouterLink, AlertComponent, LoadingComponent, GaleriaFotosComponent],
  templateUrl: './arriendo-unidad.page.html',
  styleUrl: './arriendo-unidad.page.scss',
})
export class ArriendoUnidadPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly arriendosService = inject(ArriendosService);

  protected readonly unidad = signal<ArriendoUnidadPublico | null>(null);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly etiquetasTipo = ETIQUETAS_TIPO;
  protected readonly formatoMonto = formatoMonto;
  protected readonly formatoMillones = formatoMillones;

  protected readonly fotosUrls = computed<string[]>(() => {
    const u = this.unidad();
    if (!u) {
      return [];
    }
    return u.fotos.map((foto) => this.arriendosService.urlFoto(u.codUnidad, foto.codFoto));
  });

  protected readonly titulo = computed(() => {
    const u = this.unidad();
    return u ? `${ETIQUETAS_TIPO[u.tipo]} ${u.identificador}` : '';
  });

  protected readonly ubicacion = computed(() => {
    const u = this.unidad();
    if (!u) {
      return '';
    }
    return [u.barrio, u.ciudad, u.departamento].filter(Boolean).join(', ');
  });

  protected readonly datosClave = computed<DatoClave[]>(() => {
    const u = this.unidad();
    if (!u) {
      return [];
    }
    const datos: DatoClave[] = [];
    if (u.areaM2) {
      datos.push({ icono: 'bi-rulers', valor: `${u.areaM2}`, etiqueta: 'm²' });
    }
    if (u.numeroCuartos) {
      datos.push({
        icono: 'bi-door-open',
        valor: `${u.numeroCuartos}`,
        etiqueta: u.numeroCuartos === 1 ? 'cuarto' : 'cuartos',
      });
    }
    if (u.numeroBanos) {
      datos.push({
        icono: 'bi-droplet',
        valor: `${u.numeroBanos}`,
        etiqueta: u.numeroBanos === 1 ? 'baño' : 'baños',
      });
    }
    if (u.piso) {
      datos.push({ icono: 'bi-building', valor: `${u.piso}`, etiqueta: 'piso' });
    }
    return datos;
  });

  protected readonly caracteristicas = computed<Chip[]>(() => {
    const u = this.unidad();
    if (!u) {
      return [];
    }
    const chips: Chip[] = [];
    if (u.tieneSala) chips.push({ icono: 'bi-tv', texto: 'Sala' });
    if (u.tieneComedor) chips.push({ icono: 'bi-cup-hot', texto: 'Comedor' });
    if (u.tieneCocina) chips.push({ icono: 'bi-fire', texto: 'Cocina' });
    if (u.amoblado) chips.push({ icono: 'bi-lamp', texto: 'Amoblado' });
    return chips;
  });

  protected readonly amenidades = computed<Chip[]>(() => {
    const a = this.unidad()?.amenidades;
    if (!a) {
      return [];
    }
    const chips: Chip[] = [];
    if (a.parqueadero) chips.push({ icono: 'bi-p-square', texto: 'Parqueadero' });
    if (a.zonasComunes) chips.push({ icono: 'bi-trees', texto: 'Zonas comunes' });
    if (a.porteria) chips.push({ icono: 'bi-shield-lock', texto: 'Portería / vigilancia' });
    return chips;
  });

  protected readonly relacionadas = computed<ArriendoRelacionada[]>(
    () => this.unidad()?.relacionadas ?? [],
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const unidadId = Number(params.get('unidadId'));
      this.cargar(unidadId);
    });
  }

  private cargar(unidadId: number): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.unidad.set(null);
    this.arriendosService.consultarUnidad(unidadId).subscribe({
      next: (unidad) => {
        this.unidad.set(unidad);
        this.cargando.set(false);
        window.scrollTo({ top: 0 });
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorMensaje.set(mensajeErrorApi(error, 'Este anuncio no está disponible.'));
      },
    });
  }

  protected volver(): void {
    if (typeof history !== 'undefined' && history.length > 1) {
      this.location.back();
    } else {
      void this.router.navigate(['/arriendos']);
    }
  }

  protected urlWhatsapp(telefono: string): string {
    const u = this.unidad();
    let interes = 'y estoy interesado';
    if (u?.enVenta && !u.enArriendo) {
      interes = 'y estoy interesado en comprarlo';
    } else if (u?.enArriendo && !u.enVenta) {
      interes = 'y estoy interesado en arrendarlo';
    }
    return urlWhatsapp(
      telefono,
      `Hola, vi tu anuncio de ${u?.identificador} en Propify ${interes}.`,
    );
  }

  protected urlPortada(rel: ArriendoRelacionada): string | null {
    if (rel.codFotoPortada == null) {
      return null;
    }
    return this.arriendosService.urlFoto(rel.codUnidad, rel.codFotoPortada);
  }

  protected ubicacionRel(rel: ArriendoRelacionada): string {
    return [rel.barrio, rel.ciudad].filter((p): p is string => !!p).join(', ');
  }

  protected etiquetaRel(rel: ArriendoRelacionada): string {
    if (rel.enArriendo && rel.enVenta) {
      return 'Arriendo y venta';
    }
    return rel.enVenta ? 'Venta' : 'Arriendo';
  }

  protected precioRelacionada(rel: ArriendoRelacionada): string | null {
    if (rel.enArriendo && rel.precioArriendo) {
      return `${formatoMonto(rel.precioArriendo)}/mes`;
    }
    if (rel.enVenta && rel.precioVenta) {
      return formatoMillones(rel.precioVenta);
    }
    return null;
  }
}
