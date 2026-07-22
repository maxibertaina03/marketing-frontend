import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarClock,
  ClipboardList,
  Unplug,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMarcarLeida,
  useMarcarTodasLeidas,
  useNotificaciones,
  type Notificacion,
  type TipoNotificacion,
} from '@/funcionalidades/notificaciones/hooks';

const ICONOS: Record<TipoNotificacion, LucideIcon> = {
  APROBACIONES_PENDIENTES: Clock,
  PUBLICACION_APROBADA: CheckCircle2,
  PUBLICACION_RECHAZADA: XCircle,
  DIAS_SIN_PUBLICAR: CalendarClock,
  CAMPANA_POR_TERMINAR: CalendarClock,
  TAREA_ASIGNADA: ClipboardList,
  INSTAGRAM_DESCONECTADO: Unplug,
  CUOTA_IA_CERCA: Sparkles,
  CUOTA_IA_AGOTADA: Sparkles,
};

/** Los avisos que piden acción se destacan; el resto va en gris. */
const COLORES: Partial<Record<TipoNotificacion, string>> = {
  PUBLICACION_APROBADA: 'text-emerald-600',
  PUBLICACION_RECHAZADA: 'text-red-600',
  INSTAGRAM_DESCONECTADO: 'text-amber-600',
  CUOTA_IA_AGOTADA: 'text-red-600',
  CUOTA_IA_CERCA: 'text-amber-600',
};

function haceCuanto(fecha: string): string {
  const minutos = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (minutos < 1) return 'recién';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'ayer' : `hace ${dias} días`;
}

/** Campanita de la barra superior: contador de no leídos + panel desplegable. */
export function Campanita() {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const navegar = useNavigate();

  const { data } = useNotificaciones();
  const marcarLeida = useMarcarLeida();
  const marcarTodas = useMarcarTodasLeidas();

  const notificaciones = data?.notificaciones ?? [];
  const sinLeer = data?.sinLeer ?? 0;

  // Cerrar al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!abierto) return;

    function alClicAfuera(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    function alEscape(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAbierto(false);
    }

    document.addEventListener('mousedown', alClicAfuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alClicAfuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [abierto]);

  function alAbrirAviso(notificacion: Notificacion) {
    if (!notificacion.leida) marcarLeida.mutate(notificacion.id);
    setAbierto(false);
    if (notificacion.enlace) navegar(notificacion.enlace);
  }

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="relative rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        aria-label={sinLeer > 0 ? `Notificaciones (${sinLeer} sin leer)` : 'Notificaciones'}
        aria-expanded={abierto}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {sinLeer > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-marca px-1 text-[10px] font-semibold text-white">
            {sinLeer > 9 ? '9+' : sinLeer}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
            {sinLeer > 0 && (
              <button
                type="button"
                onClick={() => marcarTodas.mutate()}
                disabled={marcarTodas.isPending}
                className="text-xs font-medium text-marca hover:underline disabled:opacity-50"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No tenés notificaciones.
              </p>
            ) : (
              notificaciones.map((notificacion) => {
                const Icono = ICONOS[notificacion.tipo] ?? Bell;
                return (
                  <button
                    key={notificacion.id}
                    type="button"
                    onClick={() => alAbrirAviso(notificacion)}
                    className={cn(
                      'flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50',
                      !notificacion.leida && 'bg-marca/[0.03]',
                    )}
                  >
                    <Icono
                      className={cn(
                        'mt-0.5 h-4 w-4 shrink-0',
                        COLORES[notificacion.tipo] ?? 'text-slate-400',
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block text-sm text-slate-800',
                          !notificacion.leida && 'font-medium text-slate-900',
                        )}
                      >
                        {notificacion.titulo}
                      </span>
                      {notificacion.cuerpo && (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {notificacion.cuerpo}
                        </span>
                      )}
                      <span className="mt-1 block text-xs text-slate-400">
                        {haceCuanto(notificacion.creadoEn)}
                      </span>
                    </span>
                    {!notificacion.leida && (
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-marca"
                        aria-label="Sin leer"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
