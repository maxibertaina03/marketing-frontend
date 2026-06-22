import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

export type Canal =
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'TWITTER'
  | 'LINKEDIN'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'OTRO';

export type EstadoContenido =
  | 'BORRADOR'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'PROGRAMADO'
  | 'PUBLICADO'
  | 'RECHAZADO';

export interface Resumen {
  id: string;
  nombre: string;
}

export interface Publicacion {
  id: string;
  titulo: string;
  contenido: string;
  imagenUrl: string | null;
  canal: Canal;
  estado: EstadoContenido;
  fechaProgramada: string | null;
  clienteId: string;
  cliente: Resumen;
  estrategiaId: string | null;
  estrategia: Resumen | null;
  organizacionId: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearPublicacionPayload {
  titulo: string;
  clienteId: string;
  estrategiaId?: string;
  contenido: string;
  canal: Canal;
  estado?: EstadoContenido;
  fechaProgramada?: string;
  imagenUrl?: string;
}

export function usePublicaciones(filtros: {
  estrategiaId?: string;
  canal?: Canal;
  estado?: EstadoContenido;
  desde?: string;
  hasta?: string;
}) {
  const api = useApi();
  const params = new URLSearchParams();
  if (filtros.estrategiaId) params.set('estrategiaId', filtros.estrategiaId);
  if (filtros.canal) params.set('canal', filtros.canal);
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  const query = params.toString();

  return useQuery({
    queryKey: ['publicaciones', filtros],
    queryFn: () => api.get<Publicacion[]>(`/contenido${query ? `?${query}` : ''}`),
  });
}

export function useCrearPublicacion() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearPublicacionPayload) =>
      api.post<Publicacion>('/contenido', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publicaciones'] }),
  });
}

export function useActualizarPublicacion(id: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CrearPublicacionPayload>) =>
      api.patch<Publicacion>(`/contenido/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publicaciones'] }),
  });
}

export function useCambiarEstado() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoContenido }) =>
      api.patch<Publicacion>(`/contenido/${id}/estado`, { estado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publicaciones'] }),
  });
}

export function useEliminarPublicacion() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/contenido/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publicaciones'] }),
  });
}
