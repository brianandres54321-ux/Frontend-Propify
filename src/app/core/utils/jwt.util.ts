import { SesionUsuario } from '../models';

// Decodifica el payload de un JWT sin verificar la firma — la verificación
// real ocurre siempre en el backend, esto solo lee los claims para la UI.
export function decodificarJwt(token: string): SesionUsuario | null {
  const partes = token.split('.');
  if (partes.length !== 3) {
    return null;
  }

  try {
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as SesionUsuario;
  } catch {
    return null;
  }
}

export function tokenExpirado(sesion: SesionUsuario): boolean {
  if (!sesion.exp) {
    return false;
  }
  return Date.now() >= sesion.exp * 1000;
}
