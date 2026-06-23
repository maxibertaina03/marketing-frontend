import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { GeneracionIa, PaginaBanco, RespuestaIa } from '../ia-estrategia/hooks';

export type Canal = 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'LINKEDIN' | 'TIKTOK' | 'YOUTUBE' | 'OTRO';

export interface PayloadCampana {
  clienteId: string;
  estrategiaId?: string;
  nombre: string;
  objetivo: string;
  duracionDias?: number;
  canales?: Canal[];
  presupuesto?: string;
}

export interface SalidaCampana {
  nombre: string;
  descripcion: string;
  publico: string;
  fases: { nombre: string; duracionDias: number; acciones: string[] }[];
  contenidosClave: string[];
  hashtags: string[];
  kpis: string[];
}

export function useGenerarCampana() {
  const api = useApi();
  return useMutation({
    mutationFn: (payload: PayloadCampana) =>
      api.post<RespuestaIa<SalidaCampana>>('/ia-campanas', payload),
  });
}

export function useBibliotecaCampanas(filtros: {
  clienteId?: string;
  pagina?: number;
  limite?: number;
}) {
  const api = useApi();
  const params = new URLSearchParams();
  if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
  if (filtros.pagina) params.set('pagina', String(filtros.pagina));
  if (filtros.limite) params.set('limite', String(filtros.limite));
  const query = params.toString();

  return useQuery({
    queryKey: ['biblioteca-campanas', filtros],
    queryFn: () => api.get<PaginaBanco>(`/ia-campanas/biblioteca${query ? `?${query}` : ''}`),
  });
}

export type { GeneracionIa };
