import { useState } from 'react';
import { Boton } from '@/componentes/ui/boton';
import { Campo, AreaTexto } from '@/componentes/ui/campo';
import {
  useAprobacionesPorEstado,
  useDetalleAprobacion,
  useEnviarRevision,
  useAprobar,
  useRechazar,
  type PublicacionResumen,
  type EstadoContenido,
} from './hooks';

// ── Badges y colores ─────────────────────────────────────────────────────────

const ETIQUETA_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  PROGRAMADO: 'Programado',
  PUBLICADO: 'Publicado',
};

const COLOR_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'bg-slate-100 text-slate-600',
  EN_REVISION: 'bg-amber-100 text-amber-700',
  APROBADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  PROGRAMADO: 'bg-blue-100 text-blue-700',
  PUBLICADO: 'bg-indigo-100 text-indigo-700',
};

const COLOR_COLUMNA: Record<string, string> = {
  EN_REVISION: 'border-t-amber-400',
  APROBADO: 'border-t-green-400',
  RECHAZADO: 'border-t-red-400',
};

const BG_COLUMNA: Record<string, string> = {
  EN_REVISION: 'bg-amber-50/50',
  APROBADO: 'bg-green-50/50',
  RECHAZADO: 'bg-red-50/50',
};

function BadgeEstado({ estado }: { estado: EstadoContenido }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ESTADO[estado]}`}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

// ── Modal de detalle ─────────────────────────────────────────────────────────

function ModalDetalle({ id, onCerrar }: { id: string; onCerrar: () => void }) {
  const { data: pub, isLoading } = useDetalleAprobacion(id);
  const aprobar = useAprobar();
  const rechazar = useRechazar();
  const [motivo, setMotivo] = useState('');
  const [vista, setVista] = useState<'detalle' | 'rechazar'>('detalle');

  const handleAprobar = async () => { await aprobar.mutateAsync({ id }); onCerrar(); };
  const handleRechazar = async () => {
    if (!motivo.trim()) return;
    await rechazar.mutateAsync({ id, motivo: motivo.trim() });
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 truncate">
            {isLoading ? 'Cargando…' : pub?.titulo}
          </h2>
          <button onClick={onCerrar} className="ml-4 text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-slate-400">Cargando publicación…</div>
        ) : pub ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <BadgeEstado estado={pub.estado} />
              <span className="text-sm text-slate-500">{pub.canal} · {pub.cliente.nombre}</span>
            </div>

            {pub.motivoRechazo && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <strong>Motivo de rechazo:</strong> {pub.motivoRechazo}
              </div>
            )}

            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {pub.contenido}
            </div>

            {pub.imagenUrl && (
              <img src={pub.imagenUrl} alt="" className="rounded-lg max-h-40 object-cover" />
            )}

            {vista === 'detalle' && pub.estado === 'EN_REVISION' && (
              <div className="flex gap-3 pt-2">
                <Boton variante="primario" onClick={handleAprobar} disabled={aprobar.isPending} className="flex-1">
                  {aprobar.isPending ? 'Aprobando…' : '✓ Aprobar'}
                </Boton>
                <Boton variante="peligro" onClick={() => setVista('rechazar')} className="flex-1">
                  ✕ Rechazar
                </Boton>
              </div>
            )}

            {vista === 'rechazar' && (
              <div className="space-y-3">
                <Campo etiqueta="Motivo del rechazo *">
                  <AreaTexto value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Indicá qué hay que corregir…" rows={3} />
                </Campo>
                <div className="flex gap-3">
                  <Boton variante="contorno" onClick={() => setVista('detalle')} className="flex-1">Volver</Boton>
                  <Boton variante="peligro" onClick={handleRechazar} disabled={!motivo.trim() || rechazar.isPending} className="flex-1">
                    {rechazar.isPending ? 'Rechazando…' : 'Confirmar rechazo'}
                  </Boton>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Tarjeta kanban ────────────────────────────────────────────────────────────

function TarjetaKanban({
  pub,
  onVerDetalle,
}: {
  pub: PublicacionResumen;
  onVerDetalle: (id: string) => void;
}) {
  const enviar = useEnviarRevision();
  const puedeEnviar = pub.estado === 'BORRADOR' || pub.estado === 'RECHAZADO';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm space-y-2">
      <p className="text-sm font-medium text-slate-900 line-clamp-2">{pub.titulo}</p>
      <p className="text-xs text-slate-500">{pub.cliente.nombre} · {pub.canal}</p>

      {pub.motivoRechazo && (
        <p className="text-xs text-red-600 border-l-2 border-red-300 pl-2 line-clamp-2">
          {pub.motivoRechazo}
        </p>
      )}

      <div className="flex gap-1.5 pt-1">
        {pub.estado === 'EN_REVISION' && (
          <Boton tamano="sm" variante="primario" onClick={() => onVerDetalle(pub.id)} className="flex-1 text-xs">
            Revisar
          </Boton>
        )}
        {puedeEnviar && (
          <Boton tamano="sm" variante="secundario" onClick={() => enviar.mutate(pub.id)} disabled={enviar.isPending} className="flex-1 text-xs">
            Enviar a revisión
          </Boton>
        )}
        {pub.estado !== 'EN_REVISION' && !puedeEnviar && (
          <Boton tamano="sm" variante="fantasma" onClick={() => onVerDetalle(pub.id)} className="flex-1 text-xs">
            Ver
          </Boton>
        )}
      </div>
    </div>
  );
}

// ── Columna kanban ────────────────────────────────────────────────────────────

const COLUMNAS: { estado: EstadoContenido; etiqueta: string }[] = [
  { estado: 'EN_REVISION', etiqueta: 'En revisión' },
  { estado: 'APROBADO', etiqueta: 'Aprobadas' },
  { estado: 'RECHAZADO', etiqueta: 'Rechazadas' },
];

function ColumnaKanban({
  estado,
  etiqueta,
  clienteId,
  onVerDetalle,
}: {
  estado: EstadoContenido;
  etiqueta: string;
  clienteId?: string;
  onVerDetalle: (id: string) => void;
}) {
  const { data, isLoading } = useAprobacionesPorEstado(estado, { clienteId, limite: 50 });
  const items = data?.items ?? [];

  return (
    <div className={`flex flex-col rounded-xl border-t-4 ${COLOR_COLUMNA[estado]} ${BG_COLUMNA[estado]} border border-slate-200 min-h-[400px]`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">{etiqueta}</h3>
        {!isLoading && (
          <span className="text-xs font-medium bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-600">
            {data?.total ?? 0}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-280px)]">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center pt-4">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center pt-4">Sin publicaciones</p>
        ) : (
          items.map((pub) => (
            <TarjetaKanban key={pub.id} pub={pub} onVerDetalle={onVerDetalle} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export function PaginaAprobaciones() {
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [clienteId] = useState<string | undefined>(undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Centro de Aprobaciones</h1>
        <p className="text-slate-500 mt-1">
          Vista por columnas del flujo editorial de todas las marcas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COLUMNAS.map(({ estado, etiqueta }) => (
          <ColumnaKanban
            key={estado}
            estado={estado}
            etiqueta={etiqueta}
            clienteId={clienteId}
            onVerDetalle={setIdDetalle}
          />
        ))}
      </div>

      {idDetalle && <ModalDetalle id={idDetalle} onCerrar={() => setIdDetalle(null)} />}
    </div>
  );
}
