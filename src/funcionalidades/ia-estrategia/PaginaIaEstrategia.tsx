import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Users, Target, BarChart3, Lightbulb, ChevronLeft, TrendingUp } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaDescripcion,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';
import { usePermisos } from '@/permisos/usePermisos';
import { useClienteActivo } from '@/contexto/contexto-cliente-activo';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { SelectorClienteEstrategia, type SeleccionPublicacion } from '@/funcionalidades/calendario/SelectorClienteEstrategia';
import {
  useGenerarEstrategiaMensual,
  useGenerarFoda,
  useGenerarBuyerPersona,
  useGenerarPilares,
  useGenerarOportunidades,
  type SalidaEstrategiaMensual,
  type SalidaFoda,
  type SalidaBuyerPersona,
  type SalidaPilares,
  type SalidaOportunidades,
  type RespuestaIa,
} from './hooks';

type BotonIa = 'estrategia-mensual' | 'foda' | 'buyer-persona' | 'pilares' | 'oportunidades';
type SalidaUnion = SalidaEstrategiaMensual | SalidaFoda | SalidaBuyerPersona | SalidaPilares | SalidaOportunidades;

const BOTONES: { id: BotonIa; titulo: string; descripcion: string; icono: React.ElementType; color: string; badge?: string }[] = [
  {
    id: 'oportunidades',
    titulo: 'Oportunidades de Crecimiento',
    descripcion: 'IA consultora que cruza tu estrategia con métricas reales y detecta oportunidades accionables.',
    icono: TrendingUp,
    color: 'text-rose-600 bg-rose-50',
    badge: 'Nuevo',
  },
  {
    id: 'estrategia-mensual',
    titulo: 'Estrategia mensual',
    descripcion: 'Plan de contenido semana a semana para el mes elegido.',
    icono: BarChart3,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'foda',
    titulo: 'Análisis FODA',
    descripcion: 'Fortalezas, oportunidades, debilidades y amenazas de la marca.',
    icono: Brain,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    id: 'buyer-persona',
    titulo: 'Buyer Persona',
    descripcion: 'Perfil detallado del cliente ideal de la marca.',
    icono: Users,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    id: 'pilares',
    titulo: 'Pilares de contenido',
    descripcion: 'Pilares temáticos con ejemplos concretos para el feed.',
    icono: Target,
    color: 'text-amber-600 bg-amber-50',
  },
];

export function PaginaIaEstrategia() {
  const { puedeEditar } = usePermisos();
  const { clienteActivoId } = useClienteActivo();
  const { data: clientes = [] } = useClientes();
  const [botonActivo, setBotonActivo] = useState<BotonIa | null>(null);
  const [seleccion, setSeleccion] = useState<SeleccionPublicacion | null>(null);
  const [cantidad, setCantidad] = useState(5);
  const [mesAnio, setMesAnio] = useState(() => {
    const hoy = new Date();
    return { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
  });
  const [resultado, setResultado] = useState<RespuestaIa<SalidaUnion> | null>(null);

  const estrategiaMensualMutation = useGenerarEstrategiaMensual();
  const fodaMutation = useGenerarFoda();
  const buyerPersonaMutation = useGenerarBuyerPersona();
  const pilaresMutation = useGenerarPilares();
  const oportunidadesMutation = useGenerarOportunidades();

  const pendiente =
    estrategiaMensualMutation.isPending ||
    fodaMutation.isPending ||
    buyerPersonaMutation.isPending ||
    pilaresMutation.isPending ||
    oportunidadesMutation.isPending;

  function activarBoton(id: BotonIa) {
    setBotonActivo(id);
    setResultado(null);
    if (clienteActivoId) {
      const cliente = clientes.find((c) => c.id === clienteActivoId);
      if (cliente) setSeleccion({ clienteId: cliente.id, clienteNombre: cliente.nombre });
    }
  }

  function volver() {
    setBotonActivo(null);
    setSeleccion(null);
    setResultado(null);
    estrategiaMensualMutation.reset();
    fodaMutation.reset();
    buyerPersonaMutation.reset();
    pilaresMutation.reset();
    oportunidadesMutation.reset();
  }

  async function handleGenerar() {
    if (!seleccion) return;
    const base = { clienteId: seleccion.clienteId, estrategiaId: seleccion.estrategiaId };

    try {
      let res: RespuestaIa<SalidaUnion>;
      if (botonActivo === 'estrategia-mensual') {
        res = await estrategiaMensualMutation.mutateAsync({ ...base, ...mesAnio });
      } else if (botonActivo === 'foda') {
        res = await fodaMutation.mutateAsync(base);
      } else if (botonActivo === 'buyer-persona') {
        res = await buyerPersonaMutation.mutateAsync(base);
      } else if (botonActivo === 'oportunidades') {
        res = await oportunidadesMutation.mutateAsync(base);
      } else {
        res = await pilaresMutation.mutateAsync({ ...base, cantidad });
      }
      setResultado(res);
    } catch {
      // el error queda en la mutation
    }
  }

  const error =
    estrategiaMensualMutation.error ??
    fodaMutation.error ??
    buyerPersonaMutation.error ??
    pilaresMutation.error ??
    oportunidadesMutation.error;

  // ── Vista resultado ──────────────────────────────────────────────────────────
  if (resultado) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={volver} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ChevronLeft className="size-4" /> Volver
          </button>
          <h1 className="text-xl font-bold">Resultado generado</h1>
        </div>
        <ResultadoIa boton={botonActivo!} respuesta={resultado} />
        <div className="flex gap-3">
          <Boton variante="contorno" onClick={volver}>Nueva generación</Boton>
          <Link to="/ideas">
            <Boton variante="fantasma">Ver Banco de Ideas →</Boton>
          </Link>
        </div>
      </div>
    );
  }

  // ── Vista selector + botones opcionales ─────────────────────────────────────
  if (botonActivo && !resultado) {
    const boton = BOTONES.find((b) => b.id === botonActivo)!;
    const Icono = boton.icono;

    return (
      <div className="space-y-6 max-w-lg">
        <button onClick={volver} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ChevronLeft className="size-4" /> Volver
        </button>

        <div className="flex items-center gap-3">
          <span className={`size-10 rounded-lg flex items-center justify-center ${boton.color}`}>
            <Icono className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">{boton.titulo}</h1>
            <p className="text-sm text-slate-500">{boton.descripcion}</p>
          </div>
        </div>

        {!seleccion ? (
          <Tarjeta>
            <TarjetaContenido>
              <SelectorClienteEstrategia onSeleccionar={setSeleccion} />
            </TarjetaContenido>
          </Tarjeta>
        ) : (
          <Tarjeta>
            <TarjetaContenido className="space-y-4">
              <div className="text-sm text-slate-600">
                Cliente: <strong>{seleccion.clienteNombre}</strong>
                {seleccion.estrategiaNombre && (
                  <> · Estrategia: <strong>{seleccion.estrategiaNombre}</strong></>
                )}
                <button
                  type="button"
                  className="ml-2 text-marca hover:underline text-xs"
                  onClick={() => setSeleccion(null)}
                >
                  (cambiar)
                </button>
              </div>

              {botonActivo === 'estrategia-mensual' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mes</label>
                    <select
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={mesAnio.mes}
                      onChange={(e) => setMesAnio((prev) => ({ ...prev, mes: Number(e.target.value) }))}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i, 1).toLocaleString('es-AR', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
                    <select
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={mesAnio.anio}
                      onChange={(e) => setMesAnio((prev) => ({ ...prev, anio: Number(e.target.value) }))}
                    >
                      {[2025, 2026, 2027].map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {botonActivo === 'pilares' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cantidad de pilares ({cantidad})
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                  {(error as Error).message || 'Error al generar. Intentá de nuevo.'}
                </p>
              )}

              {puedeEditar('ia') && (
                <Boton
                  className="w-full"
                  onClick={handleGenerar}
                  disabled={pendiente}
                >
                  <Sparkles className="size-4" />
                  {pendiente ? 'Generando…' : 'Generar con IA'}
                </Boton>
              )}
            </TarjetaContenido>
          </Tarjeta>
        )}
      </div>
    );
  }

  // ── Vista inicial — grilla de botones ────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Centro de IA — Estrategia</h1>
          <p className="text-slate-500">Generá análisis estratégicos y planes de contenido con IA.</p>
        </div>
        <Link to="/ideas">
          <Boton variante="contorno" tamano="sm">
            <Lightbulb className="size-4" /> Banco de Ideas
          </Boton>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {BOTONES.map((b) => {
          const Icono = b.icono;
          const puedeIa = puedeEditar('ia');
          return (
            <Tarjeta
              key={b.id}
              className={puedeIa ? 'cursor-pointer hover:border-marca/50 transition-colors group' : undefined}
              onClick={puedeIa ? () => activarBoton(b.id) : undefined}
            >
              <TarjetaCabecera>
                <div className="flex items-center gap-3">
                  <span className={`size-10 rounded-lg flex items-center justify-center ${b.color}`}>
                    <Icono className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <TarjetaTitulo>{b.titulo}</TarjetaTitulo>
                      {b.badge && (
                        <span className="shrink-0 text-xs bg-rose-100 text-rose-700 rounded-full px-1.5 py-0.5 font-medium">{b.badge}</span>
                      )}
                    </div>
                    <TarjetaDescripcion>{b.descripcion}</TarjetaDescripcion>
                  </div>
                </div>
              </TarjetaCabecera>
              {puedeIa && (
                <TarjetaContenido>
                  <Boton variante="contorno" tamano="sm" className="w-full group-hover:bg-marca group-hover:text-white group-hover:border-marca transition-colors">
                    <Sparkles className="size-3.5" /> Generar
                  </Boton>
                </TarjetaContenido>
              )}
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
}

// ── Componente de resultado por tipo ─────────────────────────────────────────

function ResultadoIa({ boton, respuesta }: { boton: BotonIa; respuesta: RespuestaIa<SalidaUnion> }) {
  if (boton === 'estrategia-mensual') {
    const salida = respuesta.salida as SalidaEstrategiaMensual;
    return (
      <div className="space-y-4">
        <Tarjeta>
          <TarjetaCabecera><TarjetaTitulo>Resumen</TarjetaTitulo></TarjetaCabecera>
          <TarjetaContenido>
            <p className="text-sm text-slate-700">{salida.resumen}</p>
          </TarjetaContenido>
        </Tarjeta>
        <div className="grid gap-3 sm:grid-cols-2">
          {salida.semanal.map((s) => (
            <Tarjeta key={s.semana}>
              <TarjetaCabecera><TarjetaTitulo>Semana {s.semana}</TarjetaTitulo></TarjetaCabecera>
              <TarjetaContenido>
                {s.canal && <p className="text-xs text-slate-500 mb-2">Canal: {s.canal} {s.formato && `· ${s.formato}`}</p>}
                <ul className="space-y-1">
                  {s.temas.map((t, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-marca mt-0.5">•</span> {t}
                    </li>
                  ))}
                </ul>
              </TarjetaContenido>
            </Tarjeta>
          ))}
        </div>
        {salida.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {salida.hashtags.map((h) => (
              <span key={h} className="text-xs bg-marca/10 text-marca rounded-full px-2 py-0.5">{h}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (boton === 'foda') {
    const salida = respuesta.salida as SalidaFoda;
    const cuadrantes: { key: keyof SalidaFoda; label: string; color: string }[] = [
      { key: 'fortalezas', label: 'Fortalezas', color: 'bg-green-50 border-green-200' },
      { key: 'oportunidades', label: 'Oportunidades', color: 'bg-blue-50 border-blue-200' },
      { key: 'debilidades', label: 'Debilidades', color: 'bg-yellow-50 border-yellow-200' },
      { key: 'amenazas', label: 'Amenazas', color: 'bg-red-50 border-red-200' },
    ];
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {cuadrantes.map(({ key, label, color }) => (
          <div key={key} className={`rounded-lg border p-4 ${color}`}>
            <h3 className="font-semibold text-sm mb-2">{label}</h3>
            <ul className="space-y-1">
              {(salida[key] as string[]).map((item, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="mt-0.5 shrink-0">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (boton === 'buyer-persona') {
    const salida = respuesta.salida as SalidaBuyerPersona;
    return (
      <Tarjeta>
        <TarjetaCabecera>
          <div>
            <TarjetaTitulo>{salida.nombre}</TarjetaTitulo>
            <TarjetaDescripcion>{salida.edad} · {salida.ocupacion}</TarjetaDescripcion>
          </div>
        </TarjetaCabecera>
        <TarjetaContenido className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Intereses', items: salida.intereses },
            { label: 'Dolores', items: salida.dolores },
            { label: 'Motivaciones', items: salida.motivaciones },
            { label: 'Canales favoritos', items: salida.canalesFavoritos },
          ].map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">{label}</p>
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-marca mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TarjetaContenido>
      </Tarjeta>
    );
  }

  if (boton === 'oportunidades') {
    const salida = respuesta.salida as SalidaOportunidades;
    const colorImpacto: Record<string, string> = {
      ALTO: 'bg-rose-100 text-rose-700',
      MEDIO: 'bg-amber-100 text-amber-700',
      BAJO: 'bg-slate-100 text-slate-600',
    };
    return (
      <div className="space-y-4">
        <Tarjeta>
          <TarjetaCabecera><TarjetaTitulo>Panorama actual</TarjetaTitulo></TarjetaCabecera>
          <TarjetaContenido>
            <p className="text-sm text-slate-700 leading-relaxed">{salida.resumen}</p>
          </TarjetaContenido>
        </Tarjeta>
        <div className="space-y-3">
          {salida.oportunidades.map((o, i) => (
            <Tarjeta key={i}>
              <TarjetaCabecera>
                <div className="flex items-start justify-between gap-3">
                  <TarjetaTitulo>{o.titulo}</TarjetaTitulo>
                  <span className={`shrink-0 text-xs rounded-full px-2 py-0.5 font-medium ${colorImpacto[o.impacto] ?? 'bg-slate-100 text-slate-600'}`}>
                    {o.impacto}
                  </span>
                </div>
              </TarjetaCabecera>
              <TarjetaContenido className="space-y-2">
                <p className="text-sm text-slate-600">{o.descripcion}</p>
                <div className="rounded-md bg-marca/5 border border-marca/20 px-3 py-2">
                  <p className="text-xs font-semibold text-marca mb-0.5">Acción inmediata</p>
                  <p className="text-sm text-slate-700">{o.accion}</p>
                </div>
              </TarjetaContenido>
            </Tarjeta>
          ))}
        </div>
      </div>
    );
  }

  // pilares
  const salida = respuesta.salida as SalidaPilares;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {salida.pilares.map((p, i) => (
        <Tarjeta key={i}>
          <TarjetaCabecera><TarjetaTitulo>{p.nombre}</TarjetaTitulo></TarjetaCabecera>
          <TarjetaContenido>
            <p className="text-sm text-slate-600 mb-3">{p.descripcion}</p>
            <p className="text-xs font-medium text-slate-500 mb-1">Ejemplos:</p>
            <ul className="space-y-1">
              {p.ejemplos.map((ej, j) => (
                <li key={j} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-marca mt-0.5">•</span> {ej}
                </li>
              ))}
            </ul>
          </TarjetaContenido>
        </Tarjeta>
      ))}
    </div>
  );
}
