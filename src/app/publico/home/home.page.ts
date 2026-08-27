import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ArriendoDestacada } from '@core/models';
import { ArriendosService } from '@core/services/arriendos.service';
import { urlWhatsapp } from '@core/utils';
import { RevelarAlScrollDirective } from '@shared/directives';

function formatoMonto(valor: number): string {
  return '$' + Number(valor).toLocaleString('es-CO');
}

// Precios de ejemplo — sin pasarela de pago conectada todavía, el plan
// "pagado" lo activa manualmente el superadministrador (ver Tenant.pagado).
// Ajustar cuando se definan precios reales.
interface PlanVitrina {
  nombre: string;
  precio: string;
  descripcion: string;
  incluye: string[];
  // Resalta visualmente una tarjeta (borde/badge "Más elegido") — puramente
  // de presentación en la vitrina, no afecta qué banderas activa el plan.
  destacado?: boolean;
}

const PLANES: PlanVitrina[] = [
  {
    nombre: 'Casas',
    precio: '$39.900/mes',
    descripcion: 'Para una casa o casa de varios pisos con apartamentos independientes.',
    incluye: ['Hasta 3 pisos', 'Hasta 6 unidades', 'Cobranza y gastos', 'Publicar en arriendo'],
  },
  {
    nombre: 'Edificios',
    precio: '$89.900/mes',
    descripcion: 'Para un edificio con torres, parqueaderos y portería.',
    incluye: [
      'Torres y parqueaderos',
      'Portería y cartelera',
      'Hasta 60 unidades',
      'Publicar en arriendo',
    ],
    destacado: true,
  },
  {
    nombre: 'Conjuntos',
    precio: '$149.900/mes',
    descripcion: 'Para conjuntos residenciales con zonas comunes y varios inmuebles.',
    incluye: [
      'Zonas comunes y reservas',
      'Torres, parqueaderos y portería',
      'Unidades ilimitadas',
      'Publicar en arriendo',
    ],
  },
];

interface TipoPropiedad {
  foto: string;
  icono: string;
  nombre: string;
  descripcion: string;
}

const TIPOS_PROPIEDAD: TipoPropiedad[] = [
  {
    foto: '/images/proyecto-casa.jpg',
    icono: 'house-door',
    nombre: 'Casas',
    descripcion:
      'Una casa de varios pisos subdividida en apartamentos — el caso que la mayoría del software de administración ignora.',
  },
  {
    foto: '/images/proyecto-edificio.jpg',
    icono: 'building',
    nombre: 'Edificios',
    descripcion:
      'Torres, parqueaderos y portería, con cobranza y cartelera digital para todos los residentes.',
  },
  {
    foto: '/images/proyecto-conjunto.jpg',
    icono: 'buildings',
    nombre: 'Conjuntos',
    descripcion:
      'Varios inmuebles, zonas comunes con reservas, y todo el control de acceso en un solo panel.',
  },
  {
    foto: '/images/proyecto-edificio.jpg',
    icono: 'shop',
    nombre: 'Locales y oficinas',
    descripcion:
      'Unidades comerciales dentro de tu inmueble, con el mismo registro de arriendo y cobranza.',
  },
];

// Fotos ilustrativas del TIPO de propiedad — no son clientes ni casos de
// éxito reales de Propify (el producto es nuevo), por eso el título de la
// sección habla de "tipo de propiedad" y no de "proyectos reales".
interface EjemploPropiedad {
  foto: string;
  titulo: string;
  etiqueta: string;
}

const EJEMPLOS_PROPIEDAD: EjemploPropiedad[] = [
  {
    foto: '/images/proyecto-casa.jpg',
    titulo: 'Casa de varios pisos',
    etiqueta: 'Plan Casas',
  },
  {
    foto: '/images/proyecto-edificio.jpg',
    titulo: 'Edificio residencial',
    etiqueta: 'Plan Edificios',
  },
  {
    foto: '/images/proyecto-conjunto.jpg',
    titulo: 'Conjunto residencial',
    etiqueta: 'Plan Conjuntos',
  },
];

interface PasoComoFunciona {
  numero: number;
  icono: string;
  titulo: string;
  descripcion: string;
}

const PASOS: PasoComoFunciona[] = [
  {
    numero: 1,
    icono: 'person-plus',
    titulo: 'Crea tu cuenta',
    descripcion: 'Elige el tipo de propiedad y empieza gratis con el plan demo.',
  },
  {
    numero: 2,
    icono: 'building-add',
    titulo: 'Registra tu inmueble',
    descripcion: 'Unidades, torres, residentes — con los módulos que tu propiedad necesita.',
  },
  {
    numero: 3,
    icono: 'cash-coin',
    titulo: 'Activa la cobranza',
    descripcion: 'Genera cuentas cada mes y avisa a tiempo, sin perseguir a nadie manualmente.',
  },
  {
    numero: 4,
    icono: 'megaphone',
    titulo: 'Publica en arriendo',
    descripcion: 'Si una unidad queda libre, publícala y recibe interesados directo a tu WhatsApp.',
  },
  {
    numero: 5,
    icono: 'speedometer2',
    titulo: 'Administra todo',
    descripcion: 'Portería, avisos, zonas comunes y reportes de daño, desde un solo lugar.',
  },
];

interface Capacidad {
  icono: string;
  titulo: string;
}

const CAPACIDADES: Capacidad[] = [
  { icono: 'bell', titulo: 'Recordatorios que no se olvidan' },
  { icono: 'shield-lock', titulo: 'Cada tenant ve solo lo suyo' },
  { icono: 'megaphone', titulo: 'Publica en arriendo en minutos' },
  { icono: 'phone', titulo: 'Contacto directo por WhatsApp' },
];

interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

const FAQS: PreguntaFrecuente[] = [
  {
    pregunta: '¿Sirve si solo tengo una casa con apartamentos, no un conjunto?',
    respuesta:
      'Sí — el plan Casas está pensado exactamente para eso: una casa de varios pisos subdividida en unidades independientes, sin las herramientas de un conjunto formal que no necesitas.',
  },
  {
    pregunta: '¿Qué incluye el plan demo gratis?',
    respuesta:
      'Puedes registrar 1 inmueble y hasta 5 unidades sin costo, para probar cobranza, portería y publicación en arriendo antes de decidir si actualizas.',
  },
  {
    pregunta: '¿Mis datos se mezclan con los de otros administradores?',
    respuesta:
      'No. Cada cuenta (tenant) está completamente aislada — nadie más puede ver ni tocar tus inmuebles, residentes o cobros, sin importar el plan.',
  },
  {
    pregunta: '¿Cómo le llega el aviso a un inquilino?',
    respuesta:
      'El sistema identifica todos los días quién necesita un recordatorio o está en mora, y te arma el mensaje listo para enviarlo por WhatsApp con un clic.',
  },
  {
    pregunta: '¿Puedo cambiar de plan más adelante?',
    respuesta:
      'Sí, en cualquier momento — si tu propiedad crece o cambia de tipo, actualizas el plan sin perder la información ya registrada.',
  },
];

// Landing: qué es Propify y a quién va dirigido.
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, RevelarAlScrollDirective],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private readonly arriendosService = inject(ArriendosService);

  protected readonly planes = PLANES;
  protected readonly tiposPropiedad = TIPOS_PROPIEDAD;
  protected readonly ejemplosPropiedad = EJEMPLOS_PROPIEDAD;
  protected readonly pasos = PASOS;
  protected readonly capacidades = CAPACIDADES;
  protected readonly faqs = FAQS;
  protected readonly destacadas = signal<ArriendoDestacada[]>([]);
  protected readonly formatoMonto = formatoMonto;

  protected readonly faqAbierta = signal<number | null>(null);

  protected alternarFaq(indice: number): void {
    this.faqAbierta.update((actual) => (actual === indice ? null : indice));
  }

  ngOnInit(): void {
    this.arriendosService.consultarDestacadas().subscribe({
      next: (destacadas) => this.destacadas.set(destacadas),
      error: () => this.destacadas.set([]),
    });
  }

  protected urlFoto(unidadId: number, codFoto: number): string {
    return this.arriendosService.urlFoto(unidadId, codFoto);
  }

  protected urlWhatsapp(unidad: ArriendoDestacada): string {
    return urlWhatsapp(
      unidad.telefonoContacto!,
      `Hola, vi tu anuncio de ${unidad.identificador} en Propify y estoy interesado.`,
    );
  }
}
