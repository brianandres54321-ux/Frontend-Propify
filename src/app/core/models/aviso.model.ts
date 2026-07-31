export interface Aviso {
  codAviso: number;
  codInmueble: number;
  titulo: string;
  mensaje: string;
  publicadoPorId: number;
  creadoEn: string;
}

export interface CrearAvisoRequest {
  codInmueble: number;
  titulo: string;
  mensaje: string;
}
