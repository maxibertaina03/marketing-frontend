import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { Archivo, CrearArchivoPayload, TipoArchivo } from './tipos';

/** Publicación mínima para asociar archivos (incluye clienteId para filtrar). */
export interface PublicacionParaArchivo {
  id: string;
  titulo: string;
  clienteId: string;
}

export interface FiltrosArchivos {
  clienteId?: string;
  publicacionId?: string;
  tipo?: TipoArchivo;
}

/** Lista los archivos de la organización con filtros opcionales. */
export function useArchivos(filtros: FiltrosArchivos) {
  const api = useApi();
  return useQuery({
    queryKey: ['archivos', filtros],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
      if (filtros.publicacionId) params.set('publicacionId', filtros.publicacionId);
      if (filtros.tipo) params.set('tipo', filtros.tipo);
      const qs = params.toString();
      return api.get<Archivo[]>(`/archivos${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useCrearArchivo() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearArchivoPayload) => api.post<Archivo>('/archivos', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['archivos'] }),
  });
}

export function useEliminarArchivo() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/archivos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['archivos'] }),
  });
}

/** Publicaciones (con clienteId) para asociar un archivo opcionalmente. */
export function usePublicacionesParaArchivos() {
  const api = useApi();
  return useQuery({
    queryKey: ['publicaciones-resumen'],
    queryFn: () => api.get<PublicacionParaArchivo[]>('/contenido'),
  });
}
