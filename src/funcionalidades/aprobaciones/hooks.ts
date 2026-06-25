import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

export type EstadoContenido =
  | 'BORRADOR'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'PROGRAMADO'
  | 'PUBLICADO';

export interface PublicacionResumen {
  id: string;
  titulo: string;
  canal: string;
  estado: EstadoContenido;
  motivoRechazo: string | null;
  fechaProgramada: string | null;
  creadoEn: string;
  actualizadoEn: string;
  cliente: { id: string; nombre: string };
}

export interface PublicacionDetalle extends PublicacionResumen {
  contenido: string;
  imagenUrl: string | null;
}

export interface PaginaAprobaciones {
  total: number;
  pagina: number;
  limite: number;
  items: PublicacionResumen[];
}

export interface ResultadoAccion {
  id: string;
  titulo: string;
  estado: EstadoContenido;
  motivoRechazo: string | null;
  actualizadoEn: string;
}

export function useAprobacionesPendientes(filtros: { clienteId?: string; pagina?: number; limite?: number } = {}) {
  const api = useApi();
  const params = new URLSearchParams();
  if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
  if (filtros.pagina) params.set('pagina', String(filtros.pagina));
  if (filtros.limite) params.set('limite', String(filtros.limite));
  const query = params.toString();

  return useQuery({
    queryKey: ['aprobaciones', filtros],
    queryFn: () => api.get<PaginaAprobaciones>(`/aprobaciones${query ? `?${query}` : ''}`),
  });
}

export function useDetalleAprobacion(id: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ['aprobacion', id],
    queryFn: () => api.get<PublicacionDetalle>(`/aprobaciones/${id}`),
    enabled: !!id,
  });
}

export function useEnviarRevision() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<ResultadoAccion>(`/aprobaciones/${id}/enviar-revision`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['aprobaciones'] }); },
  });
}

export function useAprobar() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comentario }: { id: string; comentario?: string }) =>
      api.post<ResultadoAccion>(`/aprobaciones/${id}/aprobar`, { comentario }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['aprobaciones'] });
      qc.invalidateQueries({ queryKey: ['aprobacion', id] });
    },
  });
}

export function useRechazar() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      api.post<ResultadoAccion>(`/aprobaciones/${id}/rechazar`, { motivo }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['aprobaciones'] });
      qc.invalidateQueries({ queryKey: ['aprobacion', id] });
    },
  });
}
