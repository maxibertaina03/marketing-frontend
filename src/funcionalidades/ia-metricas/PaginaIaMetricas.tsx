import { useState } from 'react';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Entrada } from '@/componentes/ui/campo';
import { SelectorClienteEstrategia, type SeleccionPublicacion } from '@/funcionalidades/calendario/SelectorClienteEstrategia';
import { useAnalizarMetricas, useHistorialAnalisis, type SalidaAnalisis } from './hooks';

function SeccionAnalisis({ salida }: { salida: SalidaAnalisis }) {
  return (
    <div className="space-y-4">
      <Tarjeta className="p-5 space-y-3">
        <h3 className="font-semibold text-slate-800">Interpretación</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{salida.interpretacion}</p>
      </Tarjeta>

      <div className="grid sm:grid-cols-2 gap-4">
        <Tarjeta className="p-4 space-y-2">
          <h4 className="text-sm font-semibold text-green-700">Fortalezas</h4>
          <ul className="space-y-1">
            {salida.fortalezas.map((f, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-green-500">✓</span>{f}</li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta className="p-4 space-y-2">
          <h4 className="text-sm font-semibold text-blue-700">Oportunidades</h4>
          <ul className="space-y-1">
            {salida.oportunidades.map((o, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-blue-500">→</span>{o}</li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta className="p-4 space-y-2">
          <h4 className="text-sm font-semibold text-amber-700">Recomendaciones</h4>
          <ul className="space-y-1">
            {salida.recomendaciones.map((r, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-amber-500">★</span>{r}</li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta className="p-4 space-y-2">
          <h4 className="text-sm font-semibold text-red-700">Alertas</h4>
          {salida.alertas.length === 0 ? (
            <p className="text-sm text-slate-400">Sin alertas para el período.</p>
          ) : (
            <ul className="space-y-1">
              {salida.alertas.map((a, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-red-500">!</span>{a}</li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}

export function PaginaIaMetricas() {
  const [seleccion, setSeleccion] = useState<SeleccionPublicacion | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [resultado, setResultado] = useState<SalidaAnalisis | null>(null);
  const [vistaHistorial, setVistaHistorial] = useState(false);
  const [paginaH, setPaginaH] = useState(1);

  const analizar = useAnalizarMetricas();
  const { data: historial } = useHistorialAnalisis({
    clienteId: seleccion?.clienteId,
    pagina: paginaH,
    limite: 10,
  });

  const handleSeleccion = (s: SeleccionPublicacion) => {
    setSeleccion(s);
    setResultado(null);
  };

  const handleAnalizar = async () => {
    if (!seleccion) return;
    const res = await analizar.mutateAsync({
      clienteId: seleccion.clienteId,
      estrategiaId: seleccion.estrategiaId,
      desde: desde || undefined,
      hasta: hasta || undefined,
    });
    setResultado(res.salida);
    setVistaHistorial(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">IA de Métricas</h1>
        <p className="text-slate-500 mt-1">Análisis inteligente del rendimiento de una marca en el período indicado.</p>
      </div>

      <Tarjeta className="p-5 space-y-4">
        {!seleccion ? (
          <SelectorClienteEstrategia onSeleccionar={handleSeleccion} />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">{seleccion.clienteNombre}</p>
                {seleccion.estrategiaNombre && (
                  <p className="text-xs text-slate-400">Estrategia: {seleccion.estrategiaNombre}</p>
                )}
              </div>
              <button
                type="button"
                className="text-xs text-marca hover:underline"
                onClick={() => { setSeleccion(null); setResultado(null); }}
              >
                Cambiar cliente
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Campo etiqueta="Desde (opcional)">
                <Entrada type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </Campo>
              <Campo etiqueta="Hasta (opcional)">
                <Entrada type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </Campo>
            </div>
            <div className="flex gap-3">
              <Boton onClick={handleAnalizar} disabled={analizar.isPending} className="flex-1 sm:flex-none">
                {analizar.isPending ? 'Analizando…' : '✦ Analizar con IA'}
              </Boton>
              <Boton variante="contorno" onClick={() => setVistaHistorial(!vistaHistorial)}>
                {vistaHistorial ? 'Ocultar historial' : 'Ver historial'}
              </Boton>
            </div>
            {analizar.isError && (
              <p className="text-sm text-red-600">Error al analizar. Verificá que el cliente tenga métricas cargadas.</p>
            )}
          </>
        )}
      </Tarjeta>

      {resultado && !vistaHistorial && <SeccionAnalisis salida={resultado} />}

      {vistaHistorial && historial && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800">Historial de análisis</h2>
          {historial.items.length === 0 ? (
            <p className="text-slate-400 text-sm">No hay análisis previos.</p>
          ) : (
            historial.items.map((item) => (
              <Tarjeta key={item.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{new Date(item.creadoEn).toLocaleDateString()}</span>
                  <span className="text-xs text-slate-400">{item.modelo} · {item.tokensEntrada + item.tokensSalida} tokens</span>
                </div>
                <SeccionAnalisis salida={item.salida as SalidaAnalisis} />
              </Tarjeta>
            ))
          )}
          {historial.total > 10 && (
            <div className="flex justify-center gap-2">
              <Boton variante="contorno" tamano="sm" disabled={paginaH === 1} onClick={() => setPaginaH(p => p - 1)}>Anterior</Boton>
              <span className="flex items-center text-sm text-slate-500">{paginaH} / {Math.ceil(historial.total / 10)}</span>
              <Boton variante="contorno" tamano="sm" disabled={paginaH * 10 >= historial.total} onClick={() => setPaginaH(p => p + 1)}>Siguiente</Boton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
