import { createContext, useContext } from 'react';
import type { ClienteApi } from '@/lib/clienteApi';

/** Una organización del usuario, tal como la devuelve GET /organizaciones/mias. */
export interface OrganizacionDelUsuario {
  organizacionId: string;
  nombre: string;
  rol: string;
}

export interface ValorContextoOrganizacion {
  api: ClienteApi;
  organizaciones: OrganizacionDelUsuario[];
  organizacionId: string | null;
  seleccionar: (id: string) => void;
  cargando: boolean;
}

export const CLAVE_LOCAL = 'contentos.organizacionId';

export const ContextoOrganizacion = createContext<ValorContextoOrganizacion | null>(null);

/** Hook para acceder al contexto de organización. */
export function useOrganizacion(): ValorContextoOrganizacion {
  const ctx = useContext(ContextoOrganizacion);
  if (!ctx) {
    throw new Error('useOrganizacion debe usarse dentro de <OrganizacionProvider>.');
  }
  return ctx;
}

/** Atajo para obtener solo el cliente de API. */
export function useApi(): ClienteApi {
  return useOrganizacion().api;
}

/** Devuelve el rol del usuario en la organización activa, o null si aún no resuelve. */
export function useRolActual(): string | null {
  const { organizaciones, organizacionId } = useOrganizacion();
  const org = organizaciones.find((o) => o.organizacionId === organizacionId);
  return org?.rol ?? null;
}

/** true si el usuario puede editar (ADMIN o COMMUNITY_MANAGER). */
export function usePuedeEditar(): boolean {
  const rol = useRolActual();
  return rol === 'ADMIN' || rol === 'COMMUNITY_MANAGER';
}
