export interface Pago {
  codPago: number;
  codCuenta: number;
  monto: number;
  fecha: string;
  metodo?: string;
  referencia?: string;
}

export interface CrearPagoRequest {
  codCuenta: number;
  monto: number;
  fecha?: string;
  metodo?: string;
  referencia?: string;
}
