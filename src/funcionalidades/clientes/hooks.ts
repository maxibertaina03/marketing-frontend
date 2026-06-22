import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { Cliente } from './tipos';

/** Lista todos los clientes de la organización (se reutiliza para selectores, etc.). */
export function useClientes() {
  const api = useApi();
  return useQuery({
    queryKey: ['clientes', { estado: '', busqueda: '' }],
    queryFn: () => api.get<Cliente[]>('/clientes'),
  });
}
