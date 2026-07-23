import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { Plan } from '@/planes/planes';

export interface AgenciaAdmin {
  id: string;
  nombre: string;
  plan: Plan;
  planContratado: Plan;
  planExpiraEn: string | null;
  suspendida: boolean;
  marcas: number;
  usuarios: number;
  limites: {
    marcas: number | null;
    usuariosInternos: number | null;
    generacionesIaPorMes: number | null;
  };
  consumoIaMes: number;
  costoIaMes: number;
  creadoEn: string;
}

interface ConsumoTotal {
  periodo: string;
  agenciasActivas: number;
  generaciones: number;
  costoUsd: number;
}

/** Si el usuario actual es superadmin (define si se ve la ruta /admin). */
export function useEsSuperadmin() {
  const api = useApi();
  return useQuery({
    queryKey: ['admin-estado'],
    queryFn: () => api.get<{ esSuperadmin: boolean }>('/admin/estado'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAgencias() {
  const api = useApi();
  return useQuery({
    queryKey: ['admin-agencias'],
    queryFn: () => api.get<AgenciaAdmin[]>('/admin/agencias'),
  });
}

export function useConsumoTotal() {
  const api = useApi();
  return useQuery({
    queryKey: ['admin-consumo-total'],
    queryFn: () => api.get<ConsumoTotal>('/admin/consumo-total'),
  });
}

/** Invalida la lista de agencias tras una acción. */
function useAccionAgencia<T>(fn: (api: ReturnType<typeof useApi>, arg: T) => Promise<unknown>) {
  const api = useApi();
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (arg: T) => fn(api, arg),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['admin-agencias'] }),
  });
}

export function useCambiarPlan() {
  return useAccionAgencia<{ id: string; plan: Plan }>((api, { id, plan }) =>
    api.patch(`/admin/agencias/${id}/plan`, { plan }),
  );
}

export function useSuspension() {
  return useAccionAgencia<{ id: string; activar: boolean }>((api, { id, activar }) =>
    api.post(`/admin/agencias/${id}/suspension?activar=${activar}`, {}),
  );
}

export function useReiniciarCuota() {
  return useAccionAgencia<string>((api, id) =>
    api.post(`/admin/agencias/${id}/reiniciar-cuota`, {}),
  );
}
