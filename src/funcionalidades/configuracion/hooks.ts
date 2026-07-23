import { useQuery } from '@tanstack/react-query';
import { useApi, useOrganizacion } from '@/contexto/contexto-organizacion';
import type { Plan } from '@/planes/planes';

interface Desglose {
  etiqueta: string;
  generaciones: number;
}

export interface ConsumoIa {
  periodo: string;
  plan: Plan | null;
  generaciones: number;
  /** null = el plan no tiene tope (Enterprise). */
  limite: number | null;
  limitePorUsuario: number | null;
  costoUsd: number;
  tokens: {
    entrada: number;
    salida: number;
    cacheEscritura: number;
    cacheLectura: number;
  };
  porUsuario: Desglose[];
  porMarca: Desglose[];
  porBoton: Desglose[];
}

/** Consumo de IA del mes en curso de la organización activa. */
export function useConsumoIa() {
  const api = useApi();
  const { organizacionId } = useOrganizacion();

  return useQuery({
    queryKey: ['consumo-ia', organizacionId],
    queryFn: () => api.get<ConsumoIa>('/ia/consumo'),
    enabled: Boolean(organizacionId),
  });
}
