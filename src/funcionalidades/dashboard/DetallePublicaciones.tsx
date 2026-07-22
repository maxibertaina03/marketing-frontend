import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight, Film, Image as Icono } from 'lucide-react';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import type { DetallePublicacion } from './hooks';

const num = (n: number) => n.toLocaleString('es-AR');

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

function EtiquetaTipo({ tipo }: { tipo: string | null }) {
  const esReel = tipo === 'REELS';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        esReel ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'
      }`}
    >
      {esReel ? <Film className="size-3" /> : <Icono className="size-3" />}
      {esReel ? 'Reel' : 'Publicación'}
    </span>
  );
}

/**
 * Detalle por publicación: cuándo se publicó, su total acumulado y —al desplegar—
 * cuánto sumó cada día.
 */
export function DetallePublicaciones({ items }: { items: DetallePublicacion[] }) {
  const [abierta, setAbierta] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <Tarjeta className="overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold text-slate-900">Detalle por publicación</h2>
        <p className="text-xs text-slate-500">
          Tocá una fila para ver cuánto sumó cada día. Los totales son acumulados.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Publicación</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Publicado</th>
              <th className="px-3 py-2 text-right font-medium">Impresiones</th>
              <th className="px-3 py-2 text-right font-medium">Alcance</th>
              <th className="px-3 py-2 text-right font-medium">Interac.</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const desplegada = abierta === p.publicacionId;
              return (
                <Fragment key={p.publicacionId}>
                  <tr
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    onClick={() => setAbierta(desplegada ? null : p.publicacionId)}
                  >
                    <td className="max-w-xs truncate px-4 py-2.5 font-medium text-slate-900">
                      <span className="mr-1.5 inline-block align-middle text-slate-400">
                        {desplegada ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </span>
                      {p.titulo}
                    </td>
                    <td className="px-3 py-2.5">
                      <EtiquetaTipo tipo={p.tipoMedio} />
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{fecha(p.fechaPublicacion)}</td>
                    <td className="px-3 py-2.5 text-right">{num(p.totales.impresiones)}</td>
                    <td className="px-3 py-2.5 text-right">{num(p.totales.alcance)}</td>
                    <td className="px-3 py-2.5 text-right">{num(p.totales.interacciones)}</td>
                  </tr>

                  {desplegada && (
                    <tr className="border-b border-slate-100">
                      <td colSpan={6} className="bg-slate-50/70 px-4 py-3">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                          Evolución — cuánto sumó cada día
                        </p>
                        <table className="w-full text-xs">
                          <thead className="text-left text-slate-500">
                            <tr>
                              <th className="py-1 font-medium">Día</th>
                              <th className="py-1 text-right font-medium">+ Impresiones</th>
                              <th className="py-1 text-right font-medium">+ Alcance</th>
                              <th className="py-1 text-right font-medium">+ Me gusta</th>
                              <th className="py-1 text-right font-medium">+ Interacciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.serie.map((d) => (
                              <tr key={d.fecha} className="border-t border-slate-200/70">
                                <td className="py-1 text-slate-600">{fecha(d.fecha)}</td>
                                <td className="py-1 text-right">{num(d.impresiones)}</td>
                                <td className="py-1 text-right">{num(d.alcance)}</td>
                                <td className="py-1 text-right">{num(d.meGusta)}</td>
                                <td className="py-1 text-right font-medium">
                                  {num(d.interacciones)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {p.serie.length === 1 && (
                          <p className="mt-2 text-xs text-slate-400">
                            Hay una sola medición. Al actualizar las métricas otro día vas a ver
                            cuánto sumó respecto de hoy.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Tarjeta>
  );
}
