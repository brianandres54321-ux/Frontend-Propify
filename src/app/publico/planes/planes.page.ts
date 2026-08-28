import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevelarAlScrollDirective } from '@shared/directives';

// Precios de ejemplo — sin pasarela de pago conectada todavía, el plan
// "pagado" lo activa manualmente el superadministrador (ver Tenant.pagado).
interface PlanVitrina {
  nombre: string;
  precio: string;
  periodo: string;
  descripcion: string;
  incluye: string[];
  destacado?: boolean;
}

const PLANES: PlanVitrina[] = [
  {
    nombre: 'Casas',
    precio: '$39.900',
    periodo: '/ mes',
    descripcion: 'Para una casa o casa de varios pisos con apartamentos independientes.',
    incluye: [
      '1 inmueble',
      'Hasta 12 unidades',
      'Cobranza y gastos',
      'Publicar en arriendo y venta',
    ],
  },
  {
    nombre: 'Edificios',
    precio: '$89.900',
    periodo: '/ mes',
    descripcion: 'Para un edificio con torres, parqueaderos y portería.',
    incluye: [
      'Torres y parqueaderos',
      'Portería y cartelera',
      'Hasta 120 unidades',
      'Publicar en arriendo y venta',
    ],
    destacado: true,
  },
  {
    nombre: 'Conjuntos',
    precio: '$149.900',
    periodo: '/ mes',
    descripcion: 'Para conjuntos residenciales con zonas comunes y varios inmuebles.',
    incluye: [
      'Zonas comunes y reservas',
      'Torres, parqueaderos y portería',
      'Inmuebles y unidades ilimitados',
      'Publicar en arriendo y venta',
    ],
  },
];

interface FilaComparativa {
  caracteristica: string;
  casas: string | boolean;
  edificios: string | boolean;
  conjuntos: string | boolean;
}

const COMPARATIVA: FilaComparativa[] = [
  { caracteristica: 'Inmuebles', casas: '1', edificios: '1', conjuntos: 'Ilimitados' },
  {
    caracteristica: 'Unidades',
    casas: 'Hasta 12',
    edificios: 'Hasta 120',
    conjuntos: 'Ilimitadas',
  },
  { caracteristica: 'Cobranza mensual y gastos', casas: true, edificios: true, conjuntos: true },
  { caracteristica: 'Residentes y contratos', casas: true, edificios: true, conjuntos: true },
  {
    caracteristica: 'Publicar unidades en arriendo',
    casas: true,
    edificios: true,
    conjuntos: true,
  },
  { caracteristica: 'Portal para residentes', casas: true, edificios: true, conjuntos: true },
  { caracteristica: 'Torres y parqueaderos', casas: false, edificios: true, conjuntos: true },
  { caracteristica: 'Cartelera digital de avisos', casas: false, edificios: true, conjuntos: true },
  {
    caracteristica: 'Portería y control de visitantes',
    casas: false,
    edificios: false,
    conjuntos: true,
  },
  { caracteristica: 'Zonas comunes y reservas', casas: false, edificios: false, conjuntos: true },
];

interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

const FAQS: PreguntaFrecuente[] = [
  {
    pregunta: '¿El plan demo tiene costo?',
    respuesta:
      'No. El plan demo es gratis y no pide tarjeta: puedes registrar 1 inmueble y hasta 5 unidades para probar cobranza, portería y publicación en arriendo.',
  },
  {
    pregunta: '¿Cómo activo un plan pagado?',
    respuesta:
      'Por ahora la activación se coordina con nuestro equipo. Escríbenos desde la página de contacto con el tipo de propiedad que administras y te guiamos.',
  },
  {
    pregunta: '¿Puedo cambiar de plan más adelante?',
    respuesta:
      'Sí, en cualquier momento. Si tu propiedad crece o cambia de tipo, actualizas el plan sin perder la información ya registrada.',
  },
  {
    pregunta: '¿Qué pasa si mi propiedad no encaja exactamente en un tipo?',
    respuesta:
      'Elige el plan más cercano: los módulos se activan por inmueble, así que puedes ajustar qué herramientas usa cada propiedad dentro de lo que permite el plan.',
  },
  {
    pregunta: '¿Los precios incluyen IVA?',
    respuesta:
      'Son precios de referencia mientras definimos la facturación. El valor final y las condiciones se confirman al activar el plan con el equipo.',
  },
];

// Landing pública: detalle de planes y precios.
@Component({
  selector: 'app-planes-page',
  imports: [RouterLink, RevelarAlScrollDirective],
  templateUrl: './planes.page.html',
  styleUrl: './planes.page.scss',
})
export class PlanesPage {
  protected readonly planes = PLANES;
  protected readonly comparativa = COMPARATIVA;
  protected readonly faqs = FAQS;

  protected readonly faqAbierta = signal<number | null>(null);

  protected alternarFaq(indice: number): void {
    this.faqAbierta.update((actual) => (actual === indice ? null : indice));
  }

  protected esBooleano(valor: string | boolean): valor is boolean {
    return typeof valor === 'boolean';
  }
}
