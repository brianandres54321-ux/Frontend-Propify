import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevelarAlScrollDirective } from '@shared/directives';

import { HeroPanelDemoComponent } from './components/hero-panel-demo/hero-panel-demo';

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
];

interface PlanResumen {
  nombre: string;
  precio: string;
  para: string;
}

const PLANES_RESUMEN: PlanResumen[] = [
  { nombre: 'Casas', precio: '$39.900/mes', para: 'Una casa con apartamentos independientes' },
  { nombre: 'Edificios', precio: '$89.900/mes', para: 'Torres, parqueaderos y portería' },
  { nombre: 'Conjuntos', precio: '$149.900/mes', para: 'Zonas comunes y varios inmuebles' },
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

interface Modulo {
  icono: string;
  titulo: string;
  descripcion: string;
}

const MODULOS: Modulo[] = [
  {
    icono: 'cash-coin',
    titulo: 'Cobranza mensual',
    descripcion:
      'Genera las cuentas de cada mes, cobra en línea y avisa a tiempo sin perseguir a nadie.',
  },
  {
    icono: 'people',
    titulo: 'Residentes y unidades',
    descripcion:
      'Torres, apartamentos, propietarios y arrendatarios — con su historial de pagos a la mano.',
  },
  {
    icono: 'shield-lock',
    titulo: 'Portería y visitantes',
    descripcion:
      'Registro de visitas, paquetes y autorizaciones — el celador desde su propio acceso.',
  },
  {
    icono: 'flower1',
    titulo: 'Zonas comunes y avisos',
    descripcion: 'Reservas del salón, cartelera digital y reportes de daño para toda la comunidad.',
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
  imports: [RouterLink, RevelarAlScrollDirective, HeroPanelDemoComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly planesResumen = PLANES_RESUMEN;
  protected readonly modulos = MODULOS;
  protected readonly tiposPropiedad = TIPOS_PROPIEDAD;
  protected readonly pasos = PASOS;
  protected readonly capacidades = CAPACIDADES;
  protected readonly faqs = FAQS;

  protected readonly faqAbierta = signal<number | null>(null);

  protected alternarFaq(indice: number): void {
    this.faqAbierta.update((actual) => (actual === indice ? null : indice));
  }
}
