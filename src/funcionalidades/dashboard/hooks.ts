import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { ResumenMetricas } from './tipos';

/** Resumen agregado de métricas de un cliente, para el dashboard. */
export function useResumenMetricas(clienteId: string) {
  const api = useApi();
  return useQuery({
    queryKey: ['metricas-resumen', clienteId],
    queryFn: () => api.get<ResumenMetricas>(`/metricas/resumen?clienteId=${clienteId}`),
    enabled: !!clienteId,
  });
}

/** Genera métricas de prueba para un cliente (mientras no está la ingesta de Meta). */
export function useSimularMetricas() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clienteId: string) =>
      api.post<{ generadas: number }>('/metricas/simular', { clienteId, dias: 14 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metricas-resumen'] }),
  });
}
