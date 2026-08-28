// Cuerpo de POST /publico/contacto — formulario público de contacto.
export interface MensajeContacto {
  nombre: string;
  correo: string;
  telefono?: string;
  asunto?: string;
  mensaje: string;
}

// Un mensaje guardado, como lo devuelve GET /privado/mensajes-contacto
// (bandeja del superadministrador).
export interface MensajeContactoRegistro {
  codMensaje: number;
  nombre: string;
  correo: string;
  telefono?: string | null;
  asunto?: string | null;
  mensaje: string;
  atendido: boolean;
  creadoEn: string;
}
