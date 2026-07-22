import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

/** Estado de la conexión con Instagram de una marca. */
export interface EstadoMeta {
  conectado: boolean;
  igUsername?: string | null;
  ultimaSync?: string | null;
  tokenExpiraEn?: string | null;
}

export interface ResultadoSync {
  medios: number;
  sincronizadas: number;
}

/** Conexión con Instagram de una marca (para saber si se puede sincronizar). */
export function useEstadoMeta(clienteId: string) {
  const api = useApi();
  return useQuery({
    queryKey: ['meta-estado', clienteId],
    queryFn: () => api.get<EstadoMeta>(`/meta/estado?clienteId=${clienteId}`),
    enabled: !!clienteId,
  });
}

/**
 * Trae las métricas actuales de Instagram de esa marca. Es a pedido: Instagram no
 * notifica cambios y sus insights se actualizan con horas de demora, así que
 * sondear seguido gastaría cuota sin traer nada nuevo.
 */
export function useSincronizarMeta() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clienteId: string) =>
      api.post<ResultadoSync>('/meta/sincronizar', { clienteId }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['metricas-resumen'] });
      await qc.invalidateQueries({ queryKey: ['meta-estado'] });
    },
  });
}
