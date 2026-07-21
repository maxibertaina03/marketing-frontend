import type { Rol } from '@/componentes/layout/secciones';

/**
 * Áreas con acciones de escritura (edición). Define QUIÉN puede editar en cada una;
 * la visibilidad de secciones vive en `secciones.ts`. Debe reflejar el RBAC del
 * backend (que igual valida): esto es para no mostrar botones que darían 403.
 */
export type Area =
  | 'clientes'
  | 'estrategia'
  | 'contenido'
  | 'ia'
  | 'produccion'
  | 'archivos'
  | 'aprobaciones'
  | 'metricas'
  | 'equipo';

/** Roles que pueden EDITAR (crear/modificar/borrar) en cada área. */
export const EDICION: Record<Area, Rol[]> = {
  clientes: ['ADMIN', 'COMMUNITY_MANAGER'],
  estrategia: ['ADMIN', 'COMMUNITY_MANAGER'],
  contenido: ['ADMIN', 'COMMUNITY_MANAGER', 'COPYWRITER'],
  ia: ['ADMIN', 'COMMUNITY_MANAGER', 'COPYWRITER'],
  produccion: ['ADMIN', 'COMMUNITY_MANAGER'],
  archivos: ['ADMIN', 'COMMUNITY_MANAGER', 'DISENADOR'],
  aprobaciones: ['ADMIN', 'COMMUNITY_MANAGER', 'CLIENTE'],
  metricas: ['ADMIN', 'COMMUNITY_MANAGER'],
  equipo: ['ADMIN'],
};

/** Etiqueta legible de cada área (para la pantalla de Configuración). */
export const ETIQUETA_AREA: Record<Area, string> = {
  clientes: 'Clientes',
  estrategia: 'Estrategia de marca',
  contenido: 'Calendario',
  ia: 'Centro de IA',
  produccion: 'Producción',
  archivos: 'Archivos',
  aprobaciones: 'Aprobaciones',
  metricas: 'Métricas',
  equipo: 'Equipo',
};

export const AREAS = Object.keys(EDICION) as Area[];

/** ¿El rol puede editar (escribir) en esa área? */
export function puedeEditar(rol: string | undefined, area: Area): boolean {
  if (!rol) return false;
  return EDICION[area].includes(rol as Rol);
}
