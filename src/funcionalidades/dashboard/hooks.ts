import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { ResumenMetricas } from './tipos';

/** Filtros del dashboard: rango de fechas y tipo de medio (publicaciones / reels). */
export interface FiltrosMetricas {
  desde?: string;
  hasta?: string;
  tipoMedio?: string;
}

/** Resumen agregado de métricas de un cliente, para el dashboard. */
export function useResumenMetricas(clienteId: string, filtros: FiltrosMetricas = {}) {
  const api = useApi();
  return useQuery({
    queryKey: ['metricas-resumen', clienteId, filtros],
    queryFn: () => {
      const params = new URLSearchParams({ clienteId });
      if (filtros.desde) params.set('desde', filtros.desde);
      if (filtros.hasta) params.set('hasta', filtros.hasta);
      if (filtros.tipoMedio) params.set('tipoMedio', filtros.tipoMedio);
      return api.get<ResumenMetricas>(`/metricas/resumen?${params.toString()}`);
    },
    enabled: !!clienteId,
  });
}
