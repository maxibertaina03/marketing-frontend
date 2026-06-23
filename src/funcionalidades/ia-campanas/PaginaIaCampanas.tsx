import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaDescripcion,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';
import { SelectorClienteEstrategia, type SeleccionPublicacion } from '@/funcionalidades/calendario/SelectorClienteEstrategia';
import {
  useGenerarCampana,
  useBibliotecaCampanas,
  type SalidaCampana,
  type Canal,
  type GeneracionIa,
} from './hooks';
import type { RespuestaIa } from '../ia-estrategia/hooks';

const CANALES: { valor: Canal; etiqueta: string }[] = [
  { valor: 'INSTAGRAM', etiqueta: 'Instagram' },
  { valor: 'FACEBOOK', etiqueta: 'Facebook' },
  { valor: 'TWITTER', etiqueta: 'Twitter / X' },
  { valor: 'LINKEDIN', etiqueta: 'LinkedIn' },
  { valor: 'TIKTOK', etiqueta: 'TikTok' },
  { valor: 'YOUTUBE', etiqueta: 'YouTube' },
];

type Vista = 'menu' | 'nueva' | 'resultado' | 'biblioteca';

export function PaginaIaCampanas() {
  const [vista, setVista] = useState<Vista>('menu');
  const [seleccion, setSeleccion] = useState<SeleccionPublicacion | null>(null);
  const [nombre, setNombre] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [duracionDias, setDuracionDias] = useState<number | undefined>();
  const [canales, setCanales] = useState<Canal[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [resultado, setResultado] = useState<RespuestaIa<SalidaCampana> | null>(null);

  const generarMutation = useGenerarCampana();

  function toggleCanal(canal: Canal) {
    setCanales((prev) =>
      prev.includes(canal) ? prev.filter((c) => c !== canal) : [...prev, canal],
    );
  }

  async function handleGenerar() {
    if (!seleccion || !nombre || !objetivo) return;
    try {
      const res = await generarMutation.mutateAsync({
        clienteId: seleccion.clienteId,
        estrategiaId: seleccion.estrategiaId,
        nombre,
        objetivo,
        duracionDias,
        canales: canales.length > 0 ? canales : undefined,
        presupuesto: presupuesto || undefined,
      });
      setResultado(res);
      setVista('resultado');
    } catch {
      // error queda en mutation
    }
  }

  function volverAlMenu() {
    setVista('menu');
    setSeleccion(null);
    setNombre('');
    setObjetivo('');
    setDuracionDias(undefined);
    setCanales([]);
    setPresupuesto('');
    setResultado(null);
    generarMutation.reset();
  }

  // ── Biblioteca ──────────────────────────────────────────────────────────────
  if (vista === 'biblioteca') {
    return <VistaBiblioteca onVolver={() => setVista('menu')} />;
  }

  // ── Resultado ───────────────────────────────────────────────────────────────
  if (vista === 'resultado' && resultado) {
    const s = resultado.salida;
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={volverAlMenu} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ChevronLeft className="size-4" /> Volver
          </button>
          <h1 className="text-xl font-bold">Campaña generada: {s.nombre}</h1>
        </div>

        <Tarjeta>
          <TarjetaCabecera>
            <TarjetaTitulo>Descripción</TarjetaTitulo>
            <TarjetaDescripcion>{s.publico}</TarjetaDescripcion>
          </TarjetaCabecera>
          <TarjetaContenido>
            <p className="text-sm text-slate-700">{s.descripcion}</p>
          </TarjetaContenido>
        </Tarjeta>

        <div className="space-y-3">
          <h2 className="font-semibold">Fases</h2>
          {s.fases.map((f, i) => (
            <Tarjeta key={i}>
              <TarjetaCabecera>
                <TarjetaTitulo>{f.nombre}</TarjetaTitulo>
                <TarjetaDescripcion>{f.duracionDias} días</TarjetaDescripcion>
              </TarjetaCabecera>
              <TarjetaContenido>
                <ul className="space-y-1">
                  {f.acciones.map((a, j) => (
                    <li key={j} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-marca mt-0.5">•</span> {a}
                    </li>
                  ))}
                </ul>
              </TarjetaContenido>
            </Tarjeta>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Tarjeta>
            <TarjetaCabecera><TarjetaTitulo>Contenidos clave</TarjetaTitulo></TarjetaCabecera>
            <TarjetaContenido>
              <ul className="space-y-1">
                {s.contenidosClave.map((c, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-marca mt-0.5">•</span> {c}
                  </li>
                ))}
              </ul>
            </TarjetaContenido>
          </Tarjeta>
          <Tarjeta>
            <TarjetaCabecera><TarjetaTitulo>KPIs a medir</TarjetaTitulo></TarjetaCabecera>
            <TarjetaContenido>
              <ul className="space-y-1">
                {s.kpis.map((k, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-marca mt-0.5">•</span> {k}
                  </li>
                ))}
              </ul>
            </TarjetaContenido>
          </Tarjeta>
        </div>

        {s.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {s.hashtags.map((h) => (
              <span key={h} className="text-xs bg-marca/10 text-marca rounded-full px-2 py-0.5">{h}</span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Boton variante="contorno" onClick={volverAlMenu}>Nueva campaña</Boton>
          <Boton variante="fantasma" onClick={() => setVista('biblioteca')}>
            <BookOpen className="size-4" /> Ver Biblioteca →
          </Boton>
        </div>
      </div>
    );
  }

  // ── Nueva campaña ───────────────────────────────────────────────────────────
  if (vista === 'nueva') {
    return (
      <div className="space-y-6 max-w-lg">
        <button onClick={volverAlMenu} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ChevronLeft className="size-4" /> Volver
        </button>

        <div className="flex items-center gap-3">
          <span className="size-10 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
            <Megaphone className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Nueva campaña</h1>
            <p className="text-sm text-slate-500">Completá los datos y la IA armará la campaña completa.</p>
          </div>
        </div>

        <Tarjeta>
          <TarjetaContenido className="space-y-4">
            {!seleccion ? (
              <SelectorClienteEstrategia onSeleccionar={setSeleccion} />
            ) : (
              <>
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre de la campaña <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="ej. Lanzamiento verano 2026"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Objetivo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca min-h-[80px]"
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    placeholder="ej. Aumentar ventas de bikinis un 30% en enero"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duración (días)
                    </label>
                    <input
                      type="number"
                      min={7}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
                      value={duracionDias ?? ''}
                      onChange={(e) => setDuracionDias(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Presupuesto
                    </label>
                    <input
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
                      value={presupuesto}
                      onChange={(e) => setPresupuesto(e.target.value)}
                      placeholder="USD 500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Canales</label>
                  <div className="flex flex-wrap gap-2">
                    {CANALES.map((c) => (
                      <button
                        key={c.valor}
                        type="button"
                        onClick={() => toggleCanal(c.valor)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                          canales.includes(c.valor)
                            ? 'bg-marca text-white border-marca'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {c.etiqueta}
                      </button>
                    ))}
                  </div>
                </div>

                {generarMutation.isError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                    {(generarMutation.error as Error).message || 'Error al generar. Intentá de nuevo.'}
                  </p>
                )}

                <Boton
                  className="w-full"
                  onClick={handleGenerar}
                  disabled={generarMutation.isPending || !nombre || !objetivo}
                >
                  <Sparkles className="size-4" />
                  {generarMutation.isPending ? 'Generando campaña…' : 'Generar con IA'}
                </Boton>
              </>
            )}
          </TarjetaContenido>
        </Tarjeta>
      </div>
    );
  }

  // ── Menú principal ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campañas</h1>
        <p className="text-slate-500">Generá campañas de marketing completas con IA y consultá tu historial.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        <Tarjeta
          className="cursor-pointer hover:border-marca/50 transition-colors group"
          onClick={() => setVista('nueva')}
        >
          <TarjetaCabecera>
            <div className="flex items-center gap-3">
              <span className="size-10 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
                <Megaphone className="size-5" />
              </span>
              <div>
                <TarjetaTitulo>Nueva campaña</TarjetaTitulo>
                <TarjetaDescripcion>Generá un plan de campaña completo con IA.</TarjetaDescripcion>
              </div>
            </div>
          </TarjetaCabecera>
          <TarjetaContenido>
            <Boton variante="contorno" tamano="sm" className="w-full group-hover:bg-marca group-hover:text-white group-hover:border-marca transition-colors">
              <Sparkles className="size-3.5" /> Generar
            </Boton>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta
          className="cursor-pointer hover:border-marca/50 transition-colors group"
          onClick={() => setVista('biblioteca')}
        >
          <TarjetaCabecera>
            <div className="flex items-center gap-3">
              <span className="size-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
                <BookOpen className="size-5" />
              </span>
              <div>
                <TarjetaTitulo>Biblioteca</TarjetaTitulo>
                <TarjetaDescripcion>Consultá todas las campañas generadas.</TarjetaDescripcion>
              </div>
            </div>
          </TarjetaCabecera>
          <TarjetaContenido>
            <Boton variante="contorno" tamano="sm" className="w-full">
              Ver historial
            </Boton>
          </TarjetaContenido>
        </Tarjeta>
      </div>
    </div>
  );
}

function VistaBiblioteca({ onVolver }: { onVolver: () => void }) {
  const [pagina, setPagina] = useState(1);
  const limite = 10;
  const { data, isLoading } = useBibliotecaCampanas({ pagina, limite });
  const totalPaginas = data ? Math.ceil(data.total / limite) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onVolver} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ChevronLeft className="size-4" /> Volver
        </button>
        <h1 className="text-xl font-bold">Biblioteca de Campañas</h1>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 text-center">
          <BookOpen className="size-10 text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">Sin campañas todavía</p>
          <p className="text-sm text-slate-500 mt-1">Generá tu primera campaña con IA.</p>
          <Boton className="mt-4" onClick={onVolver}>Generar campaña</Boton>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map((g) => (
              <TarjetaCampana key={g.id} generacion={g} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Boton variante="contorno" tamano="sm" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}>
                <ChevronLeft className="size-4" />
              </Boton>
              <span className="text-sm text-slate-600">{pagina} / {totalPaginas}</span>
              <Boton variante="contorno" tamano="sm" onClick={() => setPagina((p) => p + 1)} disabled={pagina >= totalPaginas}>
                <ChevronRight className="size-4" />
              </Boton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TarjetaCampana({ generacion: g }: { generacion: GeneracionIa }) {
  const [expandido, setExpandido] = useState(false);
  const fecha = new Date(g.creadoEn).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  const salida = g.salida as SalidaCampana;

  return (
    <Tarjeta>
      <TarjetaCabecera>
        <div className="flex items-center justify-between">
          <div>
            <TarjetaTitulo>{(salida as SalidaCampana)?.nombre ?? 'Campaña'}</TarjetaTitulo>
            <TarjetaDescripcion>{fecha} · {g.tokensEntrada + g.tokensSalida} tokens</TarjetaDescripcion>
          </div>
          <button
            type="button"
            className="text-sm text-marca hover:underline"
            onClick={() => setExpandido((v) => !v)}
          >
            {expandido ? 'Ocultar' : 'Ver detalle'}
          </button>
        </div>
      </TarjetaCabecera>
      {expandido && (
        <TarjetaContenido>
          <p className="text-sm text-slate-600 mb-3">{salida?.descripcion}</p>
          <pre className="text-xs bg-slate-50 rounded-md p-3 overflow-auto max-h-64 whitespace-pre-wrap text-slate-700">
            {JSON.stringify(salida, null, 2)}
          </pre>
        </TarjetaContenido>
      )}
    </Tarjeta>
  );
}
