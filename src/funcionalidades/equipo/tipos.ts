/** Roles dentro de una organización (debe coincidir con el enum del backend). */
export const ROLES = [
  'ADMIN',
  'COMMUNITY_MANAGER',
  'DISENADOR',
  'COPYWRITER',
  'ANALISTA',
  'CLIENTE',
] as const;
export type Rol = (typeof ROLES)[number];

export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  COMMUNITY_MANAGER: 'Community Manager',
  DISENADOR: 'Diseñador',
  COPYWRITER: 'Copywriter',
  ANALISTA: 'Analista',
  CLIENTE: 'Cliente',
};

export interface Miembro {
  membresiaId: string;
  usuarioId: string;
  email: string;
  nombre: string | null;
  rol: Rol;
  /** Solo para rol CLIENTE: la marca que representa. */
  clienteId: string | null;
  cliente: { id: string; nombre: string } | null;
}

export interface Invitacion {
  id: string;
  email: string;
  rol: Rol;
  clienteId: string | null;
  creadoEn: string;
}
