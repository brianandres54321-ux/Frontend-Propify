// Cuerpo de POST /publico/contacto — formulario público de contacto.
export interface MensajeContacto {
  nombre: string;
  correo: string;
  telefono?: string;
  asunto?: string;
  mensaje: string;
}
