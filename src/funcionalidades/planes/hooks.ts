import { useMutation } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { Plan } from '@/planes/planes';

/**
 * Inicia el checkout de un plan: pide la URL de Mercado Pago al backend y manda
 * al usuario ahí. La activación del plan la confirma el webhook, no el retorno.
 */
export function useIniciarPago() {
  const api = useApi();
  return useMutation({
    mutationFn: (plan: Plan) =>
      api.post<{ urlCheckout: string }>('/pagos/checkout', { plan }),
    onSuccess: ({ urlCheckout }) => {
      window.location.href = urlCheckout;
    },
  });
}
