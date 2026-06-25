import { Trash2, User2, CalendarClock } from 'lucide-react';
import { Selector } from '@/componentes/ui/campo';
import {
  ESTADOS_TAREA,
  ETIQUETA_ESTADO_TAREA,
  ETIQUETA_TIPO_TAREA,
  type EstadoTarea,
  type Tarea,
} from './tipos';

interface Props {
  tarea: Tarea;
  onCambiarEstado: (estado: EstadoTarea) => void;
  onEliminar: () => void;
  ocupado?: boolean;
}

/** Tarjeta de una tarea dentro de una columna del tablero. */
export function TarjetaTarea({ tarea, onCambiarEstado, onEliminar, ocupado }: Props) {
  const responsable = tarea.asignado?.usuario.nombre ?? tarea.asignado?.usuario.email ?? null;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-900">{tarea.titulo}</p>
        <button
          type="button"
          onClick={onEliminar}
          disabled={ocupado}
          className="text-slate-400 transition-colors hover:text-red-600 disabled:opacity-50"
          aria-label="Eliminar tarea"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-1 truncate text-xs text-slate-500" title={tarea.publicacion.titulo}>
        {tarea.publicacion.titulo}
      </p>

      {tarea.descripcion && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">{tarea.descripcion}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
          {ETIQUETA_TIPO_TAREA[tarea.tipo]}
        </span>
        {responsable && (
          <span className="inline-flex items-center gap-1">
            <User2 className="h-3 w-3" /> {responsable}
          </span>
        )}
        {tarea.fechaLimite && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            {new Date(tarea.fechaLimite).toLocaleDateString('es-AR')}
          </span>
        )}
      </div>

      <Selector
        className="mt-2 h-8 py-1 text-xs"
        value={tarea.estado}
        disabled={ocupado}
        onChange={(e) => onCambiarEstado(e.target.value as EstadoTarea)}
      >
        {ESTADOS_TAREA.map((estado) => (
          <option key={estado} value={estado}>
            {ETIQUETA_ESTADO_TAREA[estado].texto}
          </option>
        ))}
      </Selector>
    </div>
  );
}
