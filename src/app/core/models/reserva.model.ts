export enum EstadoReserva {
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
}

export interface Reserva {
  codReserva: number;
  codZona: number;
  codResidente: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  costo: number;
  estado: EstadoReserva;
  facturada: boolean;
  creadoEn: string;
}

export interface CrearReservaRequest {
  codZona: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}
