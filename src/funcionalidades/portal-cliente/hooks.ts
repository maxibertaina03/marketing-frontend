import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { EstadoContenido, PublicacionResumen } from '../aprobaciones/hooks';

export interface PublicacionPortal extends PublicacionResumen {
  contenido: string;
  imagenUrl: string | null;
  cliente: { id: string; nombre: string; logoUrl: string | null };
}

export interface PaginaPortal {
  total: number;
  pagina: number;
  limite: number;
  items: PublicacionPortal[];
}

export function usePublicacionesPortal(filtros: {
  estado?: EstadoContenido;
  pagina?: number;
  limite?: number;
} = {}) {
  const api = useApi();
  const params = new URLSearchParams();
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.pagina) params.set('pagina', String(filtros.pagina));
  if (filtros.limite) params.set('limite', String(filtros.limite));
  const query = params.toString();

  return useQuery({
    queryKey: ['portal-publicaciones', filtros],
    queryFn: () => api.get<PaginaPortal>(`/portal-cliente/publicaciones${query ? `?${query}` : ''}`),
  });
}

export function usePublicacionPortal(id: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ['portal-publicacion', id],
    queryFn: () => api.get<PublicacionPortal>(`/portal-cliente/publicaciones/${id}`),
    enabled: !!id,
  });
}

export type { EstadoContenido };
