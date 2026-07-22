import { useState } from 'react';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { SelectorClienteEstrategia, type SeleccionPublicacion } from '@/funcionalidades/calendario/SelectorClienteEstrategia';
import { useInformes, useInforme, useGenerarInforme, type ItemInforme } from './hooks';
import { usePlan } from '@/planes/usePlan';
import { AvisoPlan } from '@/planes/AvisoPlan';
import type { SalidaAnalisis } from '@/funcionalidades/ia-metricas/hooks';

function PanelInforme({ informe, onCerrar }: { informe: ItemInforme; onCerrar: () => void }) {
  const analisis = informe.analisisIa as SalidaAnalisis;
  const resumen = informe.resumenMetricas as Record<string, unknown>;

  const totales = resumen?.totales as Record<string, number> | undefined;
  const periodoLabel = informe.periodo.length === 6
    ? `${informe.periodo.slice(0, 4)}/${informe.periodo.slice(4)}`
    : informe.periodo;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl my-8">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Informe {periodoLabel}</h2>
            <p className="text-xs text-slate-400">{informe.cliente.nombre}</p>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {totales && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { etiqueta: 'Impresiones', valor: totales.impresiones },
                { etiqueta: 'Alcance', valor: totales.alcance },
                { etiqueta: 'Interacciones', valor: totales.interacciones },
                { etiqueta: 'Publicaciones', valor: totales.publicaciones },
              ].map(({ etiqueta, valor }) => (
                <div key={etiqueta} className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">{Number(valor ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{etiqueta}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800">Análisis IA</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{analisis.interpretacion}</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-green-700">Fortalezas</p>
                <ul className="space-y-0.5">
                  {analisis.fortalezas?.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600">✓ {f}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-blue-700">Oportunidades</p>
                <ul className="space-y-0.5">
                  {analisis.oportunidades?.map((o, i) => (
                    <li key={i} className="text-xs text-slate-600">→ {o}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-amber-700">Recomendaciones</p>
                <ul className="space-y-0.5">
                  {analisis.recomendaciones?.map((r, i) => (
                    <li key={i} className="text-xs text-slate-600">★ {r}</li>
                  ))}
                </ul>
              </div>
              {analisis.alertas?.length > 0 && (
                <div className="rounded-lg bg-red-50 p-3 space-y-1">
                  <p className="text-xs font-semibold text-red-700">Alertas</p>
                  <ul className="space-y-0.5">
                    {analisis.alertas.map((a, i) => (
                      <li key={i} className="text-xs text-slate-600">! {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaginaInformes() {
  const { incluye } = usePlan();
  const [seleccion, setSeleccion] = useState<SeleccionPublicacion | null>(null);
  const [pagina, setPagina] = useState(1);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const { data, isLoading, refetch } = useInformes({
    clienteId: seleccion?.clienteId,
    pagina,
    limite: 12,
  });
  const { data: informeDetalle } = useInforme(idDetalle);
  const generar = useGenerarInforme();

  if (!incluye('informes')) {
    return (
      <AvisoPlan
        funcionalidad="informes"
        detalle="Generá informes mensuales por cliente con análisis de métricas e IA."
      />
    );
  }

  const handleGenerar = async () => {
    if (!seleccion) return;
    setGenerando(true);
    try {
      await generar.mutateAsync({ clienteId: seleccion.clienteId });
      refetch();
    } finally {
      setGenerando(false);
    }
  };

  const totalPaginas = data ? Math.ceil(data.total / 12) : 1;

  const formatPeriodo = (periodo: string) =>
    periodo.length === 6
      ? `${periodo.slice(0, 4)}/${periodo.slice(4)}`
      : periodo;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Informes</h1>
        <p className="text-slate-500 mt-1">Informes mensuales con análisis IA por cliente.</p>
      </div>

      <Tarjeta className="p-5 space-y-4">
        {!seleccion ? (
          <SelectorClienteEstrategia onSeleccionar={setSeleccion} />
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">{seleccion.clienteNombre}</p>
              <p className="text-xs text-slate-400">Mostrando informes de este cliente</p>
            </div>
            <div className="flex gap-2">
              <Boton onClick={handleGenerar} disabled={generando}>
                {generando ? 'Generando…' : '✦ Generar informe'}
              </Boton>
              <Boton variante="contorno" onClick={() => { setSeleccion(null); setPagina(1); }}>
                Cambiar cliente
              </Boton>
            </div>
          </div>
        )}
        {generar.isError && (
          <p className="text-sm text-red-600">Error al generar el informe.</p>
        )}
      </Tarjeta>

      {seleccion && (
        <>
          {isLoading ? (
            <div className="text-center py-16 text-slate-400">Cargando informes…</div>
          ) : !data || data.items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              No hay informes para este cliente. Generá el primero con el botón de arriba.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((inf) => (
                  <Tarjeta key={inf.id} className="p-4 flex flex-col gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">Período {formatPeriodo(inf.periodo)}</p>
                      <p className="text-xs text-slate-400">{inf.cliente.nombre}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Actualizado: {new Date(inf.actualizadoEn).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Boton variante="contorno" tamano="sm" className="w-full" onClick={() => setIdDetalle(inf.id)}>
                        Ver informe
                      </Boton>
                    </div>
                  </Tarjeta>
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="flex justify-center gap-2">
                  <Boton variante="contorno" tamano="sm" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>Anterior</Boton>
                  <span className="flex items-center text-sm text-slate-500">{pagina} / {totalPaginas}</span>
                  <Boton variante="contorno" tamano="sm" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>Siguiente</Boton>
                </div>
              )}
            </>
          )}
        </>
      )}

      {informeDetalle && (
        <PanelInforme informe={informeDetalle} onCerrar={() => setIdDetalle(null)} />
      )}
    </div>
  );
}
