import { useState } from 'react';
import { Boton } from '@/componentes/ui/boton';
import type { Canal, EstadoContenido, CrearPublicacionPayload, Publicacion } from './hooks';

const CANALES: { valor: Canal; etiqueta: string }[] = [
  { valor: 'INSTAGRAM', etiqueta: 'Instagram' },
  { valor: 'FACEBOOK', etiqueta: 'Facebook' },
  { valor: 'TWITTER', etiqueta: 'Twitter / X' },
  { valor: 'LINKEDIN', etiqueta: 'LinkedIn' },
  { valor: 'TIKTOK', etiqueta: 'TikTok' },
  { valor: 'YOUTUBE', etiqueta: 'YouTube' },
  { valor: 'OTRO', etiqueta: 'Otro' },
];

const ESTADOS: { valor: EstadoContenido; etiqueta: string }[] = [
  { valor: 'BORRADOR', etiqueta: 'Borrador' },
  { valor: 'EN_REVISION', etiqueta: 'En revisión' },
  { valor: 'APROBADO', etiqueta: 'Aprobado' },
  { valor: 'PROGRAMADO', etiqueta: 'Programado' },
];

interface Props {
  clienteId: string;
  estrategiaId?: string;
  fechaInicial?: string;
  inicial?: Partial<Publicacion>;
  onGuardar: (payload: CrearPublicacionPayload) => void;
  onCancelar: () => void;
  guardando: boolean;
}

function toInputDatetime(iso?: string | null) {
  if (!iso) return '';
  return iso.slice(0, 16);
}

export function FormularioPublicacion({ clienteId, estrategiaId, fechaInicial, inicial, onGuardar, onCancelar, guardando }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [contenido, setContenido] = useState(inicial?.contenido ?? '');
  const [canal, setCanal] = useState<Canal>(inicial?.canal ?? 'INSTAGRAM');
  const [estado, setEstado] = useState<EstadoContenido>(inicial?.estado ?? 'BORRADOR');
  const [fechaProgramada, setFechaProgramada] = useState(
    toInputDatetime(inicial?.fechaProgramada) || (fechaInicial ? `${fechaInicial}T09:00` : ''),
  );
  const [imagenUrl, setImagenUrl] = useState(inicial?.imagenUrl ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGuardar({
      titulo,
      clienteId,
      estrategiaId,
      contenido,
      canal,
      estado,
      fechaProgramada: fechaProgramada ? new Date(fechaProgramada).toISOString() : undefined,
      imagenUrl: imagenUrl || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="ej. Post lanzamiento verano"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Canal</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
            value={canal}
            onChange={(e) => setCanal(e.target.value as Canal)}
          >
            {CANALES.map((c) => (
              <option key={c.valor} value={c.valor}>{c.etiqueta}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoContenido)}
          >
            {ESTADOS.map((s) => (
              <option key={s.valor} value={s.valor}>{s.etiqueta}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Fecha programada <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <input
          type="datetime-local"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
          value={fechaProgramada}
          onChange={(e) => setFechaProgramada(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contenido</label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca min-h-[120px]"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribí el copy de la publicación…"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          URL de imagen <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          placeholder="https://…"
          type="url"
        />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Boton type="button" variante="contorno" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar publicación'}
        </Boton>
      </div>
    </form>
  );
}
