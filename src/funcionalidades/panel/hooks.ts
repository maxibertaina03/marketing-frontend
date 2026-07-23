import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

interface ResultadoSalir {
  accion: 'eliminada' | 'abandonada';
}

/**
 * Sale de una organización: la elimina si estabas solo, o la abandona si quedan
 * otros. El backend valida que seas ADMIN y que no tenga marcas.
 *
 * Tras salir, invalida la lista de organizaciones; el provider se encarga de
 * reelegir una activa (o mostrar la bienvenida si no queda ninguna).
 */
export function useSalirOrganizacion() {
  const api = useApi();
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (organizacionId: string) =>
      api.delete<ResultadoSalir>(`/organizaciones/${organizacionId}/salir`),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ['organizaciones-mias'] }),
  });
}
