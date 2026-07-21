import { useMutation, useQuery } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface PayloadEstrategiaMensual {
  clienteId: string;
  estrategiaId?: string;
  mes?: number;
  anio?: number;
}

export interface PayloadFoda {
  clienteId: string;
  estrategiaId?: string;
}

export interface PayloadBuyerPersona {
  clienteId: string;
  estrategiaId?: string;
}

export interface PayloadPilares {
  clienteId: string;
  estrategiaId?: string;
  cantidad?: number;
}

// ── Salidas ───────────────────────────────────────────────────────────────────

export interface SalidaEstrategiaMensual {
  resumen: string;
  semanal: { semana: number; temas: string[]; canal?: string; formato?: string }[];
  hashtags: string[];
}

export interface SalidaFoda {
  fortalezas: string[];
  oportunidades: string[];
  debilidades: string[];
  amenazas: string[];
}

export interface SalidaBuyerPersona {
  nombre: string;
  edad: string;
  ocupacion: string;
  intereses: string[];
  dolores: string[];
  motivaciones: string[];
  canalesFavoritos: string[];
}

export interface SalidaPilares {
  pilares: { nombre: string; descripcion: string; ejemplos: string[] }[];
}

export interface SalidaOportunidades {
  resumen: string;
  oportunidades: {
    titulo: string;
    descripcion: string;
    accion: string;
    impacto: 'ALTO' | 'MEDIO' | 'BAJO';
  }[];
}

// ── Envelope común de ServicioIa ──────────────────────────────────────────────

export interface RespuestaIa<T> {
  generacionId: string;
  salida: T;
  modelo: string;
  tokens: { entrada: number; salida: number; cacheCreacion: number; cacheLectura: number };
}

// ── Banco de Ideas ────────────────────────────────────────────────────────────

export interface GeneracionIa {
  id: string;
  tipoBoton: string;
  instruccion: string;
  salida: unknown;
  modelo: string;
  tokensEntrada: number;
  tokensSalida: number;
  tokensCacheCreacion: number;
  tokensCacheLectura: number;
  clienteId: string | null;
  estrategiaId: string | null;
  organizacionId: string;
  creadoEn: string;
}

export interface PaginaBanco {
  total: number;
  pagina: number;
  limite: number;
  items: GeneracionIa[];
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useGenerarEstrategiaMensual() {
  const api = useApi();
  return useMutation({
    mutationFn: (payload: PayloadEstrategiaMensual) =>
      api.post<RespuestaIa<SalidaEstrategiaMensual>>('/ia-estrategia/estrategia-mensual', payload),
  });
}

export function useGenerarFoda() {
  const api = useApi();
  return useMutation({
    mutationFn: (payload: PayloadFoda) =>
      api.post<RespuestaIa<SalidaFoda>>('/ia-estrategia/foda', payload),
  });
}

export function useGenerarBuyerPersona() {
  const api = useApi();
  return useMutation({
    mutationFn: (payload: PayloadBuyerPersona) =>
      api.post<RespuestaIa<SalidaBuyerPersona>>('/ia-estrategia/buyer-persona', payload),
  });
}

export function useGenerarPilares() {
  const api = useApi();
  return useMutation({
    mutationFn: (payload: PayloadPilares) =>
      api.post<RespuestaIa<SalidaPilares>>('/ia-estrategia/pilares', payload),
  });
}

export function useGenerarOportunidades() {
  const api = useApi();
  return useMutation({
    mutationFn: (payload: { clienteId: string; estrategiaId?: string }) =>
      api.post<RespuestaIa<SalidaOportunidades>>('/ia-estrategia/oportunidades', payload),
  });
}

export function useBancoIdeas(filtros: {
  clienteId?: string;
  estrategiaId?: string;
  tipoBoton?: string;
  pagina?: number;
  limite?: number;
}) {
  const api = useApi();
  const params = new URLSearchParams();
  if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
  if (filtros.estrategiaId) params.set('estrategiaId', filtros.estrategiaId);
  if (filtros.tipoBoton) params.set('tipoBoton', filtros.tipoBoton);
  if (filtros.pagina) params.set('pagina', String(filtros.pagina));
  if (filtros.limite) params.set('limite', String(filtros.limite));
  const query = params.toString();

  return useQuery({
    queryKey: ['banco-ideas', filtros],
    queryFn: () => api.get<PaginaBanco>(`/ia-estrategia/banco${query ? `?${query}` : ''}`),
  });
}
