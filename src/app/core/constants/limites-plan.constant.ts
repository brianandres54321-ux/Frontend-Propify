// Espejo de LIMITES_PLAN_DEMO en el backend
// (src/utilidades/compartido/limites-plan.ts) — solo para mostrar el límite
// en la UI (banners, página de planes). La restricción real vive en el
// backend; esto es puramente informativo.
export const LIMITES_PLAN_DEMO = {
  MAX_INMUEBLES: 1,
  MAX_UNIDADES: 5,
} as const;
