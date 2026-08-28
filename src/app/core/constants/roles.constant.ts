// Roles sembrados por el backend (src/middleware/seguridad/rol.helper.ts)
export const RoleNames = {
  SUPERADMIN: 'superadministrador',
  DUENO: 'dueno',
  ADMIN: 'admin',
  RESIDENTE: 'residente',
  CELADOR: 'celador',
} as const;

export type RolNombre = (typeof RoleNames)[keyof typeof RoleNames];

// Los roles se guardan como slug (`dueno`, `celador`…). Para mostrarlos en la
// UI se usa esta tabla — nunca el slug crudo, que sale sin tilde ni ñ.
export const ETIQUETAS_ROL: Record<string, string> = {
  [RoleNames.SUPERADMIN]: 'Superadministrador',
  [RoleNames.DUENO]: 'Dueño',
  [RoleNames.ADMIN]: 'Administrador',
  [RoleNames.RESIDENTE]: 'Residente',
  [RoleNames.CELADOR]: 'Portería',
};

export function etiquetaRol(slug: string | null | undefined): string {
  if (!slug) {
    return '—';
  }
  return ETIQUETAS_ROL[slug.trim().toLowerCase()] ?? slug;
}
