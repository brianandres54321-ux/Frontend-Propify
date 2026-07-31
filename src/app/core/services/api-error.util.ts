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
