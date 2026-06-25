import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

export interface ItemInforme {
  id: string;
  periodo: string;
  clienteId: string;
  cliente: { nombre: string };
  resumenMetricas: unknown;
  analisisIa: unknown;
  creadoEn: string;
  actualizadoEn: string;
}

export interface PaginaInformes {
  total: number;
  pagina: number;
  limite: number;
  items: ItemInforme[];
}

export function useInformes(filtros: { clienteId?: string; pagina?: number; limite?: number } = {}) {
  const api = useApi();
  const params = new URLSearchParams();
  if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
  if (filtros.pagina) params.set('pagina', String(filtros.pagina));
  if (filtros.limite) params.set('limite', String(filtros.limite));
  const query = params.toString();

  return useQuery({
    queryKey: ['informes', filtros],
    queryFn: () => api.get<PaginaInformes>(`/informes${query ? `?${query}` : ''}`),
  });
}

export function useInforme(id: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ['informe', id],
    queryFn: () => api.get<ItemInforme>(`/informes/${id}`),
    enabled: !!id,
  });
}

export function useGenerarInforme() {
  const api = useApi();
  return useMutation({
    mutationFn: (payload: { clienteId: string; periodo?: string }) =>
      api.post<ItemInforme>('/informes/generar', payload),
  });
}
