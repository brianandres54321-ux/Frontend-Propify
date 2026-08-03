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

// Payload de POST /privado/cobranza/cuentas/:id/pagos — el codCuenta va en
// la URL, no en el body.
export interface RegistrarPagoRequest {
  monto: number;
  fecha?: string;
  metodo?: string;
  referencia?: string;
}
