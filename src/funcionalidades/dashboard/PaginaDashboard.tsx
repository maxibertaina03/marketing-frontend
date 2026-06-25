import { useState } from 'react';
import { Eye, Users, Heart, FileText } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Selector } from '@/componentes/ui/campo';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { useResumenMetricas, useSimularMetricas } from './hooks';

const num = (n: number) => n.toLocaleString('es-AR');

/** Dashboard de métricas por cliente (Fase 4). Datos de prueba hasta la ingesta de Meta. */
export function PaginaDashboard() {
  const [clienteId, setClienteId] = useState('');
  const { data: clientes = [] } = useClientes();
  const { data: resumen, isLoading } = useResumenMetricas(clienteId);
  const simular = useSimularMetricas();

  const t = resumen?.totales;
  const engagement = t && t.alcance > 0 ? ((t.interacciones / t.alcance) * 100).toFixed(1) : '0';
  const sinDatos = !!resumen && t?.publicaciones === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500">Métricas de rendimiento por marca.</p>
        </div>
        {clienteId && (
          <Boton
            variante="contorno"
            onClick={() => simular.mutate(clienteId)}
            disabled={simular.isPending}
          >
            {simular.isPending ? 'Generando…' : 'Generar datos de prueba'}
          </Boton>
        )}
      </div>

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

      {!clienteId ? (
        <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          Elegí una marca para ver sus métricas.
        </p>
      ) : isLoading ? (
        <p className="text-slate-500">Cargando métricas…</p>
      ) : sinDatos ? (
        <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          Todavía no hay métricas para esta marca. Generá datos de prueba con el botón de arriba
          (la marca necesita tener publicaciones).
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
