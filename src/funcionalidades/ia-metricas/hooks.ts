import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

export interface PayloadAnalisis {
  clienteId: string;
  estrategiaId?: string;
  desde?: string;
  hasta?: string;
}

export interface SalidaAnalisis {
  interpretacion: string;
  fortalezas: string[];
  oportunidades: string[];
  recomendaciones: string[];
  alertas: string[];
}

export interface RespuestaAnalisis {
  generacionId: string;
  salida: SalidaAnalisis;
  modelo: string;
  tokens: { entrada: number; salida: number; cacheCreacion: number; cacheLectura: number };
}

export interface ItemHistorial {
  id: string;
  tipoBoton: string;
  salida: unknown;
  modelo: string;
  tokensEntrada: number;
  tokensSalida: number;
  clienteId: string | null;
  creadoEn: string;
}

export interface PaginaHistorial {
  total: number;
  pagina: number;
  limite: number;
  items: ItemHistorial[];
}

export function useAnalizarMetricas() {
  const api = useApi();
  return useMutation({
    mutationFn: (payload: PayloadAnalisis) =>
      api.post<RespuestaAnalisis>('/ia-metricas/analizar', payload),
  });
}

export function useHistorialAnalisis(filtros: { clienteId?: string; pagina?: number; limite?: number } = {}) {
  const api = useApi();
  const params = new URLSearchParams();
  if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
  if (filtros.pagina) params.set('pagina', String(filtros.pagina));
  if (filtros.limite) params.set('limite', String(filtros.limite));
  const query = params.toString();

  return useQuery({
    queryKey: ['ia-metricas-historial', filtros],
    queryFn: () => api.get<PaginaHistorial>(`/ia-metricas/historial${query ? `?${query}` : ''}`),
  });
}
