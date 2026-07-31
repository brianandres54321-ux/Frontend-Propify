// Roles sembrados por el backend (src/middleware/seguridad/rol.helper.ts)
export const RoleNames = {
  SUPERADMIN: 'superadministrador',
  DUENO: 'dueno',
  ADMIN: 'admin',
  RESIDENTE: 'residente',
  CELADOR: 'celador',
} as const;

export type RolNombre = (typeof RoleNames)[keyof typeof RoleNames];
