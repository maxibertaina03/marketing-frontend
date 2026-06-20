import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Publicacion, EstadoContenido } from './hooks';

const COLORES_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'bg-slate-200 text-slate-700',
  EN_REVISION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-blue-100 text-blue-800',
  PROGRAMADO: 'bg-purple-100 text-purple-800',
  PUBLICADO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-700',
};

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface Props {
  anio: number;
  mes: number; // 0-indexed
  publicaciones: Publicacion[];
  onMesAnterior: () => void;
  onMesSiguiente: () => void;
  onClickDia: (fecha: string) => void;
  onClickPublicacion: (p: Publicacion) => void;
}

export function CalendarioMensual({
  anio,
  mes,
  publicaciones,
  onMesAnterior,
  onMesSiguiente,
  onClickDia,
  onClickPublicacion,
}: Props) {
  const { celdas } = useMemo(() => {
    const primero = new Date(anio, mes, 1);
    const ultimo = new Date(anio, mes + 1, 0);
    const offset = primero.getDay(); // día de semana del primer día

    const totalCeldas = offset + ultimo.getDate();
    const filas = Math.ceil(totalCeldas / 7);

    const celdas: Array<{ dia: number | null; fecha: string | null }> = [];

    for (let i = 0; i < filas * 7; i++) {
      const dia = i - offset + 1;
      if (dia < 1 || dia > ultimo.getDate()) {
        celdas.push({ dia: null, fecha: null });
      } else {
        const mm = String(mes + 1).padStart(2, '0');
        const dd = String(dia).padStart(2, '0');
        celdas.push({ dia, fecha: `${anio}-${mm}-${dd}` });
      }
    }

    return { celdas };
  }, [anio, mes]);

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
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Header del mes */}
      <div className="flex items-center justify-between">
        <button
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
          onClick={onMesAnterior}
        >
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900">
          {MESES[mes]} {anio}
        </h2>
        <button
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
          onClick={onMesSiguiente}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Grilla */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        {/* Encabezado días */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-slate-500">
              {d}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div className="grid grid-cols-7 divide-x divide-slate-100">
          {celdas.map((celda, i) => {
            const esHoy = celda.fecha === hoyStr;
            const pubs = celda.fecha ? (pubsPorFecha[celda.fecha] ?? []) : [];

            return (
              <div
                key={i}
                className={`min-h-[90px] p-1.5 border-b border-slate-100 ${
                  celda.dia ? 'cursor-pointer hover:bg-slate-50' : 'bg-slate-50/50'
                } ${Math.floor(i / 7) === Math.ceil(celdas.length / 7) - 1 ? 'border-b-0' : ''}`}
                onClick={() => celda.fecha && onClickDia(celda.fecha)}
              >
                {celda.dia !== null && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                          esHoy ? 'bg-marca text-white' : 'text-slate-600'
                        }`}
                      >
                        {celda.dia}
                      </span>
                      {celda.fecha && (
                        <button
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 rounded hover:bg-slate-200 text-slate-400"
                          onClick={(e) => { e.stopPropagation(); onClickDia(celda.fecha!); }}
                        >
                          <Plus className="size-3" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {pubs.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${COLORES_ESTADO[p.estado]}`}
                          onClick={(e) => { e.stopPropagation(); onClickPublicacion(p); }}
                        >
                          {p.titulo}
                        </button>
                      ))}
                      {pubs.length > 3 && (
                        <p className="text-xs text-slate-400 pl-1">+{pubs.length - 3} más</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
