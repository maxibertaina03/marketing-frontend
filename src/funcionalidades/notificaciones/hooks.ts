import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi, useOrganizacion } from '@/contexto/contexto-organizacion';

export type TipoNotificacion =
  | 'APROBACIONES_PENDIENTES'
  | 'PUBLICACION_APROBADA'
  | 'PUBLICACION_RECHAZADA'
  | 'DIAS_SIN_PUBLICAR'
  | 'CAMPANA_POR_TERMINAR'
  | 'TAREA_ASIGNADA'
  | 'INSTAGRAM_DESCONECTADO'
  | 'CUOTA_IA_CERCA'
  | 'CUOTA_IA_AGOTADA';

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  cuerpo: string | null;
  enlace: string | null;
  leida: boolean;
  creadoEn: string;
}

interface RespuestaListado {
  notificaciones: Notificacion[];
  sinLeer: number;
}

/** Cada cuánto se vuelve a preguntar por avisos nuevos. */
const REFRESCO_MS = 2 * 60 * 1000;

export function useNotificaciones() {
  const api = useApi();
  const { organizacionId } = useOrganizacion();

  return useQuery({
    queryKey: ['notificaciones', organizacionId],
    queryFn: () => api.get<RespuestaListado>('/notificaciones'),
    enabled: Boolean(organizacionId),
    // Los avisos los genera un job diario: no hace falta preguntar seguido, pero
    // sí que aparezcan sin recargar la página.
    refetchInterval: REFRESCO_MS,
  });
}

export function useMarcarLeida() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { organizacionId } = useOrganizacion();

  return useMutation({
    mutationFn: (id: string) => api.patch(`/notificaciones/${id}/leer`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notificaciones', organizacionId] });
    },
  });
}

export function useMarcarTodasLeidas() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { organizacionId } = useOrganizacion();

  return useMutation({
    mutationFn: () => api.post('/notificaciones/leer-todas', {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notificaciones', organizacionId] });
    },
  });
}
