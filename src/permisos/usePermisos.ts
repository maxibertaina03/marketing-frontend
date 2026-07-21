import { useOrganizacion } from '@/contexto/contexto-organizacion';
import type { Rol } from '@/componentes/layout/secciones';
import { puedeEditar, type Area } from './permisos';

/** Rol del usuario en la organización activa (undefined si aún no cargó / sin org). */
export function useRolActual(): Rol | undefined {
  const { organizaciones, organizacionId } = useOrganizacion();
  return organizaciones.find((o) => o.organizacionId === organizacionId)?.rol as Rol | undefined;
}

/** Permisos del usuario actual: su rol + si puede editar en un área dada. */
export function usePermisos() {
  const rol = useRolActual();
  return {
    rol,
    puedeEditar: (area: Area) => puedeEditar(rol, area),
  };
}
