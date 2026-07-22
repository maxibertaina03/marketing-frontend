import { useState } from 'react';
import { Eye, Users, Heart, FileText, RefreshCw } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Entrada, Selector } from '@/componentes/ui/campo';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { useClienteActivo } from '@/contexto/contexto-cliente-activo';
import { useEstadoMeta, useSincronizarMeta } from '@/funcionalidades/meta/hooks';
import { useResumenMetricas, useDetalleMetricas } from './hooks';
import { DetallePublicaciones } from './DetallePublicaciones';

const num = (n: number) => n.toLocaleString('es-AR');

/** Dashboard de métricas reales por marca, con filtros de fecha y tipo de medio. */
export function PaginaDashboard() {
  const { clienteActivoId } = useClienteActivo();
  const [clienteId, setClienteId] = useState('');
  // La marca activa manda; si hay una, se oculta el selector local.
  const clienteEfectivo = clienteActivoId || clienteId;
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipoMedio, setTipoMedio] = useState('');
  const { data: clientes = [] } = useClientes();
  const { data: estadoMeta } = useEstadoMeta(clienteEfectivo);
  const sincronizar = useSincronizarMeta();
  const filtros = {
    desde: desde || undefined,
    hasta: hasta || undefined,
    tipoMedio: tipoMedio || undefined,
  };
  const { data: resumen, isLoading } = useResumenMetricas(clienteEfectivo, filtros);
  const { data: detalle = [] } = useDetalleMetricas(clienteEfectivo, filtros);

  const t = resumen?.totales;
  const engagement = t && t.alcance > 0 ? ((t.interacciones / t.alcance) * 100).toFixed(1) : '0';
  const sinDatos = !!resumen && t?.publicaciones === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500">Métricas reales de Instagram, por marca.</p>
        </div>

        {clienteEfectivo && estadoMeta?.conectado && (
          <div className="text-right">
            <Boton
              variante="contorno"
              onClick={() => sincronizar.mutate(clienteEfectivo)}
              disabled={sincronizar.isPending}
            >
              <RefreshCw className={`size-4 ${sincronizar.isPending ? 'animate-spin' : ''}`} />
              {sincronizar.isPending ? 'Actualizando…' : 'Actualizar métricas'}
            </Boton>
            <p className="mt-1 text-xs text-slate-400">
              {sincronizar.isSuccess && !sincronizar.isPending
                ? `Actualizado: ${sincronizar.data.sincronizadas} publicaciones`
                : estadoMeta.ultimaSync
                  ? `Última actualización: ${new Date(estadoMeta.ultimaSync).toLocaleString()}`
                  : 'Nunca actualizado'}
            </p>
            {sincronizar.isError && (
              <p className="mt-1 text-xs text-red-600">No se pudieron traer las métricas.</p>
            )}
          </div>
        )}
      </div>

      {clienteEfectivo && estadoMeta && !estadoMeta.conectado && (
        <p className="rounded-md border border-dashed border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-700">
          Esta marca todavía no tiene Instagram conectado. Conectalo desde su ficha en{' '}
          <strong>Clientes</strong> para ver métricas reales.
        </p>
      )}

      {!clienteActivoId && (
        <Campo etiqueta="Cliente">
          <Selector
            className="w-72"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">Elegí una marca…</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Selector>
        </Campo>
      )}

      {clienteEfectivo && (
        <div className="flex flex-wrap items-end gap-3">
          <Campo etiqueta="Tipo de contenido">
            <Selector
              className="w-52"
              value={tipoMedio}
              onChange={(e) => setTipoMedio(e.target.value)}
            >
              <option value="">Todo</option>
              <option value="FEED">Publicaciones</option>
              <option value="REELS">Reels</option>
            </Selector>
          </Campo>
          <Campo etiqueta="Desde">
            <Entrada
              type="date"
              className="w-44"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </Campo>
          <Campo etiqueta="Hasta">
            <Entrada
              type="date"
              className="w-44"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </Campo>
          {(desde || hasta || tipoMedio) && (
            <button
              type="button"
              className="pb-2 text-sm text-marca hover:underline"
              onClick={() => { setDesde(''); setHasta(''); setTipoMedio(''); }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {!clienteEfectivo ? (
        <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          Elegí una marca para ver sus métricas.
        </p>
      ) : isLoading ? (
        <p className="text-slate-500">Cargando métricas…</p>
      ) : sinDatos ? (
        <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          No hay métricas para estos filtros. Conectá el Instagram de la marca en su ficha y usá
          “Sincronizar métricas”, o probá ampliando el rango de fechas.
        </p>
      ) : (
        t && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TarjetaKpi icono={<Eye />} etiqueta="Impresiones" valor={num(t.impresiones)} />
              <TarjetaKpi icono={<Users />} etiqueta="Alcance" valor={num(t.alcance)} />
              <TarjetaKpi
                icono={<Heart />}
                etiqueta="Interacciones"
                valor={num(t.interacciones)}
                pie={`Engagement ${engagement}%`}
              />
              <TarjetaKpi icono={<FileText />} etiqueta="Publicaciones" valor={num(t.publicaciones)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Tarjeta className="p-5">
                <h2 className="mb-3 font-semibold">Por canal</h2>
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-1 font-medium">Canal</th>
                      <th className="py-1 text-right font-medium">Impresiones</th>
                      <th className="py-1 text-right font-medium">Alcance</th>
                      <th className="py-1 text-right font-medium">Interac.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen!.porCanal.map((c) => (
                      <tr key={c.canal} className="border-t border-slate-100">
                        <td className="py-1.5 font-medium text-slate-700">{c.canal}</td>
                        <td className="py-1.5 text-right">{num(c.impresiones)}</td>
                        <td className="py-1.5 text-right">{num(c.alcance)}</td>
                        <td className="py-1.5 text-right">{num(c.interacciones)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Tarjeta>

              <Tarjeta className="p-5">
                <h2 className="mb-3 font-semibold">Últimos días</h2>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500">
                      <tr>
                        <th className="py-1 font-medium">Fecha</th>
                        <th className="py-1 text-right font-medium">Impresiones</th>
                        <th className="py-1 text-right font-medium">Interac.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...resumen!.serie].reverse().map((s) => (
                        <tr key={s.fecha} className="border-t border-slate-100">
                          <td className="py-1.5 text-slate-700">{s.fecha}</td>
                          <td className="py-1.5 text-right">{num(s.impresiones)}</td>
                          <td className="py-1.5 text-right">{num(s.interacciones)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tarjeta>
            </div>
            <DetallePublicaciones items={detalle} />
          </>
        )
      )}
    </div>
  );
}

function TarjetaKpi({
  icono,
  etiqueta,
  valor,
  pie,
}: {
  icono: React.ReactNode;
  etiqueta: string;
  valor: string;
  pie?: string;
}) {
  return (
    <Tarjeta className="p-5">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="[&_svg]:h-4 [&_svg]:w-4">{icono}</span>
        <span className="text-sm">{etiqueta}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{valor}</p>
      {pie && <p className="mt-1 text-xs text-slate-400">{pie}</p>}
    </Tarjeta>
  );
}
