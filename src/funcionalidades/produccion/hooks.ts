import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { Miembro } from '@/funcionalidades/equipo/tipos';
import type {
  ActualizarTareaPayload,
  CrearTareaPayload,
  PublicacionResumen,
  Tablero,
  Tarea,
} from './tipos';

/** Filtros opcionales del tablero / listado de tareas. */
export interface FiltrosTareas {
  clienteId?: string;
  publicacionId?: string;
  asignadoId?: string;
}

function query(filtros: FiltrosTareas): string {
  const params = new URLSearchParams();
  if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
  if (filtros.publicacionId) params.set('publicacionId', filtros.publicacionId);
  if (filtros.asignadoId) params.set('asignadoId', filtros.asignadoId);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Tablero de producción: tareas agrupadas por estado. */
export function useTablero(filtros: FiltrosTareas) {
  const api = useApi();
  return useQuery({
    queryKey: ['tareas', 'tablero', filtros],
    queryFn: () => api.get<Tablero>(`/produccion/tareas/tablero${query(filtros)}`),
  });
}

export function useCrearTarea() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearTareaPayload) => api.post<Tarea>('/produccion/tareas', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tareas'] }),
  });
}

export function useActualizarTarea() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; cambios: ActualizarTareaPayload }) =>
      api.patch<Tarea>(`/produccion/tareas/${vars.id}`, vars.cambios),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tareas'] }),
  });
}

export function useEliminarTarea() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/produccion/tareas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tareas'] }),
  });
}

/** Publicaciones de la organización, para elegir sobre cuál crear la tarea. */
export function usePublicacionesParaTareas() {
  const api = useApi();
  return useQuery({
    queryKey: ['publicaciones-resumen'],
    queryFn: () => api.get<PublicacionResumen[]>('/contenido'),
  });
}

/** Miembros del equipo, para asignar responsables a las tareas. */
export function useMiembros() {
  const api = useApi();
  return useQuery({
    queryKey: ['equipo-miembros'],
    queryFn: () => api.get<Miembro[]>('/equipo/miembros'),
  });
}
