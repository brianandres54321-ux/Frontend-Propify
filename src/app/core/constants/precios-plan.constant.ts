import { PlanTipo } from '../models';

// Precio de lista mensual por plan, en COP. Fuente única: lo usa la página
// pública /planes y el modal "Registrar pago" del superadmin (como monto
// sugerido, editable). Sin pasarela de pago: son referenciales hasta que se
// conecte un cobro real. Mantener sincronizado con el discurso comercial.
export const PRECIO_PLAN_MENSUAL: Record<PlanTipo, number> = {
  [PlanTipo.CASAS]: 39900,
  [PlanTipo.EDIFICIOS]: 89900,
  [PlanTipo.CONJUNTOS]: 149900,
};

export function precioPlanFormateado(plan: PlanTipo): string {
  return '$' + PRECIO_PLAN_MENSUAL[plan].toLocaleString('es-CO');
}
