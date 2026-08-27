import { HttpErrorResponse } from '@angular/common/http';

// Espejo del cuerpo que arma GlobalExceptionFilter en el backend
// (src/middleware/filtros/global-exception.filter.ts).
interface CuerpoErrorApi {
  statusCode: number;
  message: string | string[];
}

export function mensajeErrorApi(
  error: unknown,
  mensajePorDefecto = 'Ha ocurrido un error. Intenta de nuevo.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return mensajePorDefecto;
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  const cuerpo = error.error as CuerpoErrorApi | undefined;
  if (!cuerpo?.message) {
    return mensajePorDefecto;
  }

  return Array.isArray(cuerpo.message) ? cuerpo.message[0] : cuerpo.message;
}

// 402 Payment Required: el backend lo usa exclusivamente para los límites
// del plan demo (ver LIMITES_PLAN_DEMO) — permite mostrar un botón
// "Actualizar plan" en vez de (o junto a) el mensaje de error genérico.
export function esLimitePlan(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 402;
}
