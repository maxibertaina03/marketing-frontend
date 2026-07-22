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

/** Una fila de la evolución diaria de una publicación (lo que sumó ese día). */
export interface DiaMetrica {
  fecha: string;
  impresiones: number;
  alcance: number;
  meGusta: number;
  comentarios: number;
  compartidos: number;
  guardados: number;
  clics: number;
  interacciones: number;
}

export interface DetallePublicacion {
  publicacionId: string;
  titulo: string;
  tipoMedio: string | null;
  canal: string;
  imagenUrl: string | null;
  fechaPublicacion: string | null;
  totales: Omit<DiaMetrica, 'fecha'>;
  serie: DiaMetrica[];
}

/** Detalle por publicación: cuándo se publicó, su total y su evolución diaria. */
export function useDetalleMetricas(clienteId: string, filtros: FiltrosMetricas = {}) {
  const api = useApi();
  return useQuery({
    queryKey: ['metricas-detalle', clienteId, filtros],
    queryFn: () => {
      const params = new URLSearchParams({ clienteId });
      if (filtros.desde) params.set('desde', filtros.desde);
      if (filtros.hasta) params.set('hasta', filtros.hasta);
      if (filtros.tipoMedio) params.set('tipoMedio', filtros.tipoMedio);
      return api.get<DetallePublicacion[]>(`/metricas/detalle?${params.toString()}`);
    },
    enabled: !!clienteId,
  });
}
