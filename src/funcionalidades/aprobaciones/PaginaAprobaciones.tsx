import { useState } from 'react';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { Campo, AreaTexto } from '@/componentes/ui/campo';
import {
  useAprobacionesPendientes,
  useDetalleAprobacion,
  useEnviarRevision,
  useAprobar,
  useRechazar,
  type PublicacionResumen,
  type EstadoContenido,
} from './hooks';

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

function BadgeEstado({ estado }: { estado: EstadoContenido }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ESTADO[estado]}`}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}

function ModalDetalle({
  id,
  onCerrar,
}: {
  id: string;
  onCerrar: () => void;
}) {
  const { data: pub, isLoading } = useDetalleAprobacion(id);
  const aprobar = useAprobar();
  const rechazar = useRechazar();
  const [motivo, setMotivo] = useState('');
  const [vista, setVista] = useState<'detalle' | 'rechazar'>('detalle');

  const handleAprobar = async () => {
    await aprobar.mutateAsync({ id });
    onCerrar();
  };

  const handleRechazar = async () => {
    if (!motivo.trim()) return;
    await rechazar.mutateAsync({ id, motivo: motivo.trim() });
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isLoading ? 'Cargando…' : pub?.titulo}
          </h2>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">✕</button>
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
                <strong>Motivo de rechazo previo:</strong> {pub.motivoRechazo}
              </div>
            )}

            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {pub.contenido}
            </div>

            {pub.imagenUrl && (
              <img src={pub.imagenUrl} alt="Imagen de la publicación" className="rounded-lg max-h-40 object-cover" />
            )}

            {vista === 'detalle' && pub.estado === 'EN_REVISION' && (
              <div className="flex gap-3 pt-2">
                <Boton
                  variante="primario"
                  onClick={handleAprobar}
                  disabled={aprobar.isPending}
                  className="flex-1"
                >
                  {aprobar.isPending ? 'Aprobando…' : '✓ Aprobar'}
                </Boton>
                <Boton
                  variante="peligro"
                  onClick={() => setVista('rechazar')}
                  className="flex-1"
                >
                  ✕ Rechazar
                </Boton>
              </div>
            )}

            {vista === 'rechazar' && (
              <div className="space-y-3">
                <Campo etiqueta="Motivo del rechazo *">
                  <AreaTexto
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Indicá qué hay que corregir…"
                    rows={3}
                  />
                </Campo>
                <div className="flex gap-3">
                  <Boton variante="contorno" onClick={() => setVista('detalle')} className="flex-1">
                    Volver
                  </Boton>
                  <Boton
                    variante="peligro"
                    onClick={handleRechazar}
                    disabled={!motivo.trim() || rechazar.isPending}
                    className="flex-1"
                  >
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

function TarjetaPublicacion({
  pub,
  onVerDetalle,
  onEnviarRevision,
}: {
  pub: PublicacionResumen;
  onVerDetalle: (id: string) => void;
  onEnviarRevision: (id: string) => void;
}) {
  const enviar = useEnviarRevision();
  const puedeEnviar = pub.estado === 'BORRADOR' || pub.estado === 'RECHAZADO';

  return (
    <Tarjeta className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">{pub.titulo}</p>
          <p className="text-xs text-slate-500 mt-0.5">{pub.cliente.nombre} · {pub.canal}</p>
        </div>
        <BadgeEstado estado={pub.estado} />
      </div>

      {pub.motivoRechazo && (
        <p className="text-xs text-red-600 border-l-2 border-red-300 pl-2">
          Rechazada: {pub.motivoRechazo}
        </p>
      )}

      <div className="flex gap-2">
        {pub.estado === 'EN_REVISION' && (
          <Boton tamano="sm" variante="primario" onClick={() => onVerDetalle(pub.id)} className="flex-1">
            Revisar
          </Boton>
        )}
        {puedeEnviar && (
          <Boton
            tamano="sm"
            variante="secundario"
            onClick={() => onEnviarRevision(pub.id)}
            disabled={enviar.isPending}
            className="flex-1"
          >
            Enviar a revisión
          </Boton>
        )}
        {pub.estado !== 'EN_REVISION' && !puedeEnviar && (
          <Boton tamano="sm" variante="fantasma" onClick={() => onVerDetalle(pub.id)} className="flex-1">
            Ver detalle
          </Boton>
        )}
      </div>
    </Tarjeta>
  );
}

export function PaginaAprobaciones() {
  const [pagina, setPagina] = useState(1);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const enviarRevision = useEnviarRevision();

  const { data, isLoading } = useAprobacionesPendientes({ pagina, limite: 12 });

  const totalPaginas = data ? Math.ceil(data.total / 12) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Centro de Aprobaciones</h1>
        <p className="text-slate-500 mt-1">
          Publicaciones enviadas a revisión y pendientes de aprobación.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Cargando publicaciones…</div>
      ) : !data || data.items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          No hay publicaciones en revisión.
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{data.total} publicación{data.total !== 1 ? 'es' : ''} en revisión</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((pub) => (
              <TarjetaPublicacion
                key={pub.id}
                pub={pub}
                onVerDetalle={setIdDetalle}
                onEnviarRevision={(id) => enviarRevision.mutate(id)}
              />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-center gap-2">
              <Boton variante="contorno" tamano="sm" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>
                Anterior
              </Boton>
              <span className="flex items-center text-sm text-slate-500">
                {pagina} / {totalPaginas}
              </span>
              <Boton variante="contorno" tamano="sm" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>
                Siguiente
              </Boton>
            </div>
          )}
        </>
      )}

      {idDetalle && (
        <ModalDetalle id={idDetalle} onCerrar={() => setIdDetalle(null)} />
      )}
    </div>
  );
}
