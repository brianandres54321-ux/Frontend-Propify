import { PlanTipo } from '../models';

// Espejo de BANDERAS_PERMITIDAS_POR_PLAN en el backend
// (src/modulos/privado/inmuebles/inmuebles.service.ts) — qué banderas de
// módulo puede tener encendidas cada plan (ver propify_especificacion.md
// §2). Se usa tanto para el formulario de inmueble como para ocultar del
// sidebar módulos que ningún inmueble de este tenant podría tener nunca.
export type BanderaModulo =
  'tieneTorres' | 'tieneCartelera' | 'tieneZonasComunes' | 'tieneParqueaderos' | 'tieneCelador';

export const BANDERAS_MODULO: BanderaModulo[] = [
  'tieneTorres',
  'tieneCartelera',
  'tieneZonasComunes',
  'tieneParqueaderos',
  'tieneCelador',
];

export const BANDERAS_DISPONIBLES_POR_PLAN: Record<PlanTipo, ReadonlySet<BanderaModulo>> = {
  [PlanTipo.CASAS]: new Set([]),
  [PlanTipo.EDIFICIOS]: new Set(['tieneTorres', 'tieneCartelera']),
  [PlanTipo.CONJUNTOS]: new Set(BANDERAS_MODULO),
};

export const BANDERAS_POR_PLAN: Record<PlanTipo, Record<BanderaModulo, boolean>> = {
  [PlanTipo.CASAS]: {
    tieneTorres: false,
    tieneCartelera: false,
    tieneZonasComunes: false,
    tieneParqueaderos: false,
    tieneCelador: false,
  },
  [PlanTipo.EDIFICIOS]: {
    tieneTorres: true,
    tieneCartelera: true,
    tieneZonasComunes: false,
    tieneParqueaderos: false,
    tieneCelador: false,
  },
  [PlanTipo.CONJUNTOS]: {
    tieneTorres: true,
    tieneCartelera: true,
    tieneZonasComunes: true,
    tieneParqueaderos: true,
    tieneCelador: true,
  },
};
