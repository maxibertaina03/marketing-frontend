import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

/** Lo que devuelve cualquier botón de IA: la salida ya parseada + su traza. */
export interface RespuestaIa<T = unknown> {
  salida: T;
  generacionId: string;
  tokens?: { entrada: number; salida: number };
}

interface BaseGenerar {
  clienteId: string;
  estrategiaId?: string;
  red?: string;
}

export interface GenerarIdeas extends BaseGenerar {
  cantidad?: number;
  tema?: string;
}
export interface GenerarCopy extends BaseGenerar {
  brief: string;
  cta?: string;
}
export interface GenerarHooks extends BaseGenerar {
  tema: string;
  cantidad?: number;
}
export interface GenerarCarrusel extends BaseGenerar {
  tema: string;
  cantidadSlides?: number;
}

/** Cada botón es un endpoint; al terminar refrescamos la Biblioteca de Copys. */
function useBotonIa<P>(ruta: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: P) => api.post<RespuestaIa>(`/ia-contenido/${ruta}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['biblioteca-copys'] }),
  });
}

export const useGenerarIdeas = () => useBotonIa<GenerarIdeas>('ideas');
export const useGenerarCopy = () => useBotonIa<GenerarCopy>('copy');
export const useGenerarHooks = () => useBotonIa<GenerarHooks>('hooks');
export const useGenerarCarrusel = () => useBotonIa<GenerarCarrusel>('carrusel');
