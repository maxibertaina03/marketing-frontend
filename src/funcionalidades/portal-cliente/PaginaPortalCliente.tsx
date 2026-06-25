import { useState } from 'react';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { Campo, AreaTexto } from '@/componentes/ui/campo';
import { usePublicacionesPortal, usePublicacionPortal, type EstadoContenido } from './hooks';
import { useAprobar, useRechazar } from '../aprobaciones/hooks';

const ESTADOS_FILTRO: { valor: EstadoContenido | undefined; etiqueta: string }[] = [
  { valor: undefined, etiqueta: 'Todas' },
  { valor: 'EN_REVISION', etiqueta: 'Para revisar' },
  { valor: 'APROBADO', etiqueta: 'Aprobadas' },
  { valor: 'RECHAZADO', etiqueta: 'Rechazadas' },
  { valor: 'PUBLICADO', etiqueta: 'Publicadas' },
];

const COLOR_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'bg-slate-100 text-slate-600',
  EN_REVISION: 'bg-amber-100 text-amber-700',
  APROBADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  PROGRAMADO: 'bg-blue-100 text-blue-700',
  PUBLICADO: 'bg-indigo-100 text-indigo-700',
};

const ETIQUETA_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'Para revisar',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  PROGRAMADO: 'Programado',
  PUBLICADO: 'Publicado',
};

function ModalRevision({ id, onCerrar }: { id: string; onCerrar: () => void }) {
  const { data: pub, isLoading } = usePublicacionPortal(id);
  const aprobar = useAprobar();
  const rechazar = useRechazar();
  const [motivo, setMotivo] = useState('');
  const [fase, setFase] = useState<'ver' | 'rechazar'>('ver');

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
          <h2 className="text-base font-semibold text-slate-900 truncate">
            {isLoading ? 'Cargando…' : pub?.titulo}
          </h2>
          <button onClick={onCerrar} className="ml-4 text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-slate-400">Cargando…</div>
        ) : pub ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ESTADO[pub.estado]}`}>
                {ETIQUETA_ESTADO[pub.estado]}
              </span>
              <span className="text-xs text-slate-500">{pub.canal}</span>
            </div>

            {pub.motivoRechazo && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <strong>Motivo de rechazo:</strong> {pub.motivoRechazo}
              </div>
            )}

            {pub.imagenUrl && (
              <img src={pub.imagenUrl} alt="" className="w-full rounded-lg object-cover max-h-48" />
            )}

            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {pub.contenido}
            </div>

            {fase === 'ver' && pub.estado === 'EN_REVISION' && (
              <div className="flex gap-3 pt-2">
                <Boton variante="primario" onClick={handleAprobar} disabled={aprobar.isPending} className="flex-1">
                  {aprobar.isPending ? 'Aprobando…' : '✓ Aprobar'}
                </Boton>
                <Boton variante="peligro" onClick={() => setFase('rechazar')} className="flex-1">
                  ✕ Rechazar
                </Boton>
              </div>
            )}

            {fase === 'rechazar' && (
              <div className="space-y-3">
                <Campo etiqueta="¿Qué hay que corregir? *">
                  <AreaTexto
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Describí el motivo…"
                    rows={3}
                  />
                </Campo>
                <div className="flex gap-3">
                  <Boton variante="contorno" onClick={() => setFase('ver')} className="flex-1">Volver</Boton>
                  <Boton
                    variante="peligro"
                    onClick={handleRechazar}
                    disabled={!motivo.trim() || rechazar.isPending}
                    className="flex-1"
                  >
                    {rechazar.isPending ? 'Enviando…' : 'Confirmar rechazo'}
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

export function PaginaPortalCliente() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoContenido | undefined>(undefined);
  const [pagina, setPagina] = useState(1);
  const [idModal, setIdModal] = useState<string | null>(null);

  const { data, isLoading } = usePublicacionesPortal({ estado: estadoFiltro, pagina, limite: 12 });
  const totalPaginas = data ? Math.ceil(data.total / 12) : 1;

  const cambiarFiltro = (estado: EstadoContenido | undefined) => {
    setEstadoFiltro(estado);
    setPagina(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi Portal</h1>
        <p className="text-slate-500 mt-1">Revisá y aprobá el contenido que el equipo preparó para tu marca.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ESTADOS_FILTRO.map(({ valor, etiqueta }) => (
          <button
            key={etiqueta}
            onClick={() => cambiarFiltro(valor)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              estadoFiltro === valor
                ? 'bg-marca text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Cargando contenido…</div>
      ) : !data || data.items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          No hay publicaciones en esta categoría.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((pub) => (
              <Tarjeta key={pub.id} className="flex flex-col gap-3 p-4">
                {pub.imagenUrl && (
                  <img src={pub.imagenUrl} alt="" className="w-full h-32 object-cover rounded-md" />
                )}
                <div>
                  <p className="font-medium text-slate-900">{pub.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pub.canal}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ESTADO[pub.estado]}`}>
                    {ETIQUETA_ESTADO[pub.estado]}
                  </span>
                  <Boton tamano="sm" variante={pub.estado === 'EN_REVISION' ? 'primario' : 'fantasma'} onClick={() => setIdModal(pub.id)}>
                    {pub.estado === 'EN_REVISION' ? 'Revisar' : 'Ver'}
                  </Boton>
                </div>
              </Tarjeta>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-center gap-2">
              <Boton variante="contorno" tamano="sm" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>
                Anterior
              </Boton>
              <span className="flex items-center text-sm text-slate-500">{pagina} / {totalPaginas}</span>
              <Boton variante="contorno" tamano="sm" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>
                Siguiente
              </Boton>
            </div>
          )}
        </>
      )}

      {idModal && <ModalRevision id={idModal} onCerrar={() => setIdModal(null)} />}
    </div>
  );
}
