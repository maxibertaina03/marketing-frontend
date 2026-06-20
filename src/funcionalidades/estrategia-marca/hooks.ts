import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

export type TonoComunicacion =
  | 'FORMAL'
  | 'INFORMAL'
  | 'CASUAL'
  | 'PROFESIONAL'
  | 'CERCANO'
  | 'INSPIRADOR'
  | 'HUMORISTICO';

export interface ClienteResumen {
  id: string;
  nombre: string;
}

export interface EstrategiaDeMarca {
  id: string;
  nombre: string;
  objetivo: string;
  publicoObjetivo: string;
  tono: TonoComunicacion;
  pilares: string[];
  restricciones: string | null;
  clienteId: string;
  cliente: ClienteResumen;
  organizacionId: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearEstrategiaPayload {
  nombre: string;
  clienteId: string;
  objetivo: string;
  publicoObjetivo: string;
  tono: TonoComunicacion;
  pilares: string[];
  restricciones?: string;
}

export function useEstrategias(clienteId?: string) {
  const api = useApi();
  return useQuery({
    queryKey: ['estrategias', clienteId],
    queryFn: () =>
      api.get<EstrategiaDeMarca[]>(
        `/estrategia-marca${clienteId ? `?clienteId=${clienteId}` : ''}`,
      ),
  });
}

export function useEstrategia(id: string) {
  const api = useApi();
  return useQuery({
    queryKey: ['estrategias', id],
    queryFn: () => api.get<EstrategiaDeMarca>(`/estrategia-marca/${id}`),
    enabled: !!id,
  });
}

export function useCrearEstrategia() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearEstrategiaPayload) =>
      api.post<EstrategiaDeMarca>('/estrategia-marca', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['estrategias'] }),
  });
}

export function useActualizarEstrategia(id: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Omit<CrearEstrategiaPayload, 'clienteId'>>) =>
      api.patch<EstrategiaDeMarca>(`/estrategia-marca/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['estrategias'] }),
  });
}

export function useEliminarEstrategia() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/estrategia-marca/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['estrategias'] }),
  });
}
