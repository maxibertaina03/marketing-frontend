import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Publicacion, EstadoContenido } from './hooks';

const COLORES_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'bg-slate-200 text-slate-700 border-slate-300',
  EN_REVISION: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  APROBADO: 'bg-blue-50 text-blue-800 border-blue-300',
  PROGRAMADO: 'bg-purple-50 text-purple-800 border-purple-300',
  PUBLICADO: 'bg-green-50 text-green-800 border-green-300',
  RECHAZADO: 'bg-red-50 text-red-700 border-red-300',
};

const ETIQUETAS_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En revisión',
  APROBADO: 'Aprobado',
  PROGRAMADO: 'Programado',
  PUBLICADO: 'Publicado',
  RECHAZADO: 'Rechazado',
};

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function inicioSemana(fecha: Date): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

interface Props {
  semanaBase: Date;
  publicaciones: Publicacion[];
  onSemanaAnterior: () => void;
  onSemanaSiguiente: () => void;
  onClickPublicacion: (p: Publicacion) => void;
}

export function CalendarioSemanal({
  semanaBase,
  publicaciones,
  onSemanaAnterior,
  onSemanaSiguiente,
  onClickPublicacion,
}: Props) {
  const inicio = useMemo(() => inicioSemana(semanaBase), [semanaBase]);

  const dias = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      return d;
    }), [inicio]);

  const pubsPorFecha = useMemo(() => {
    const mapa: Record<string, Publicacion[]> = {};
    for (const p of publicaciones) {
      if (!p.fechaProgramada) continue;
      const clave = p.fechaProgramada.slice(0, 10);
      if (!mapa[clave]) mapa[clave] = [];
      mapa[clave].push(p);
    }
    return mapa;
  }, [publicaciones]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const primerDia = dias[0];
  const ultimoDia = dias[6];
  const mismoMes = primerDia.getMonth() === ultimoDia.getMonth();
  const rangoLabel = mismoMes
    ? `${primerDia.getDate()} – ${ultimoDia.getDate()} de ${primerDia.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`
    : `${primerDia.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} – ${ultimoDia.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
          onClick={onSemanaAnterior}
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 capitalize">{rangoLabel}</h2>
        <button
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
          onClick={onSemanaSiguiente}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Grid semanal */}
      <div className="grid grid-cols-7 gap-2">
        {dias.map((dia, i) => {
          const yyyy = dia.getFullYear();
          const mm = String(dia.getMonth() + 1).padStart(2, '0');
          const dd = String(dia.getDate()).padStart(2, '0');
          const clave = `${yyyy}-${mm}-${dd}`;
          const pubs = pubsPorFecha[clave] ?? [];
          const esHoy = dia.getTime() === hoy.getTime();

          return (
            <div key={i} className="space-y-2">
              {/* Encabezado del día */}
              <div className={`text-center py-2 rounded-lg ${esHoy ? 'bg-marca text-white' : 'bg-slate-50'}`}>
                <p className={`text-xs font-medium ${esHoy ? 'text-white/80' : 'text-slate-500'}`}>
                  {DIAS_SEMANA[i]}
                </p>
                <p className={`text-lg font-bold ${esHoy ? 'text-white' : 'text-slate-900'}`}>
                  {dia.getDate()}
                </p>
              </div>

              {/* Publicaciones del día */}
              <div className="space-y-1 min-h-[120px]">
                {pubs.map((p) => (
                  <button
                    key={p.id}
                    className={`w-full text-left text-xs p-2 rounded-md border ${COLORES_ESTADO[p.estado]} hover:opacity-80 transition-opacity`}
                    onClick={() => onClickPublicacion(p)}
                  >
                    <p className="font-medium truncate">{p.titulo}</p>
                    <p className="opacity-70 mt-0.5">{p.canal}</p>
                    <p className="opacity-60 mt-0.5">{ETIQUETAS_ESTADO[p.estado]}</p>
                    {p.fechaProgramada && (
                      <p className="opacity-60">
                        {new Date(p.fechaProgramada).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
        {(Object.keys(COLORES_ESTADO) as EstadoContenido[]).map((estado) => (
          <span key={estado} className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${COLORES_ESTADO[estado]}`}>
            {ETIQUETAS_ESTADO[estado]}
          </span>
        ))}
      </div>
    </div>
  );
}
