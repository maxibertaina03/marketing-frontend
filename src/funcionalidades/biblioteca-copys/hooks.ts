import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

/** Tipos de contenido que guarda la biblioteca (deben coincidir con el backend). */
export const TIPOS_CONTENIDO = ['IDEAS_CONTENIDO', 'COPYWRITING', 'CARRUSEL', 'HOOKS'] as const;
export type TipoContenido = (typeof TIPOS_CONTENIDO)[number];

export const ETIQUETA_TIPO: Record<string, string> = {
  IDEAS_CONTENIDO: 'Ideas',
  COPYWRITING: 'Copy',
  CARRUSEL: 'Carrusel',
  HOOKS: 'Hooks',
};

export const COLOR_TIPO: Record<string, string> = {
  IDEAS_CONTENIDO: 'bg-amber-100 text-amber-800',
  COPYWRITING: 'bg-blue-100 text-blue-800',
  CARRUSEL: 'bg-purple-100 text-purple-800',
  HOOKS: 'bg-emerald-100 text-emerald-800',
};

/** Una generación de contenido persistida (fila de GeneracionIa). */
export interface GeneracionContenido {
  id: string;
  tipoBoton: string;
  instruccion: string;
  salida: unknown;
  modelo: string;
  tokensEntrada: number;
  tokensSalida: number;
  clienteId: string | null;
  creadoEn: string;
}

export interface RespuestaBiblioteca {
  total: number;
  pagina: number;
  limite: number;
  items: GeneracionContenido[];
}

export interface FiltrosBiblioteca {
  clienteId?: string;
  tipoBoton?: string;
  pagina?: number;
  limite?: number;
}

/** Historial de contenido generado con IA (ideas, copys, hooks, carruseles). */
export function useBiblioteca(filtros: FiltrosBiblioteca) {
  const api = useApi();
  return useQuery({
    queryKey: ['biblioteca-copys', filtros],
    queryFn: () => {
      const p = new URLSearchParams();
      if (filtros.clienteId) p.set('clienteId', filtros.clienteId);
      if (filtros.tipoBoton) p.set('tipoBoton', filtros.tipoBoton);
      if (filtros.pagina) p.set('pagina', String(filtros.pagina));
      if (filtros.limite) p.set('limite', String(filtros.limite));
      const qs = p.toString();
      return api.get<RespuestaBiblioteca>(`/ia-contenido/biblioteca${qs ? `?${qs}` : ''}`);
    },
  });
}
