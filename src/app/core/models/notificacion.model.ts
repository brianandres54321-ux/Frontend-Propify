export enum TipoNotificacion {
  RECORDATORIO_PAGO = 'RECORDATORIO_PAGO',
  MORA = 'MORA',
  PAQUETE = 'PAQUETE',
  AVISO = 'AVISO',
  ALERTA_DANO = 'ALERTA_DANO',
}

export enum CanalNotificacion {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export interface NotificacionEnviada {
  codNotificacion: number;
  codCuenta?: number;
  tipo: TipoNotificacion;
  canal: CanalNotificacion;
  destinatario: string;
  contenido?: string;
  enviadoEn: string;
}
