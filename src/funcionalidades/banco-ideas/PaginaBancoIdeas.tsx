import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Tarjeta, TarjetaCabecera, TarjetaTitulo, TarjetaDescripcion, TarjetaContenido } from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { useBancoIdeas, type GeneracionIa } from '../ia-estrategia/hooks';
import type {
  SalidaEstrategiaMensual,
  SalidaFoda,
  SalidaBuyerPersona,
  SalidaPilares,
} from '../ia-estrategia/hooks';

type TipoFiltro = '' | 'ESTRATEGIA_MENSUAL' | 'FODA' | 'BUYER_PERSONA' | 'PILARES';

const ETIQUETAS_TIPO: Record<string, string> = {
  ESTRATEGIA_MENSUAL: 'Estrategia mensual',
  FODA: 'Análisis FODA',
  BUYER_PERSONA: 'Buyer Persona',
  PILARES: 'Pilares de contenido',
};

const COLORES_TIPO: Record<string, string> = {
  ESTRATEGIA_MENSUAL: 'bg-blue-100 text-blue-800',
  FODA: 'bg-purple-100 text-purple-800',
  BUYER_PERSONA: 'bg-emerald-100 text-emerald-800',
  PILARES: 'bg-amber-100 text-amber-800',
};

// ── Renders legibles por tipo ─────────────────────────────────────────────────

function RenderEstrategiaMensual({ salida }: { salida: SalidaEstrategiaMensual }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-slate-700 leading-relaxed">{salida.resumen}</p>
      <div className="space-y-2">
        {salida.semanal?.map((s) => (
          <div key={s.semana} className="rounded-md bg-slate-50 px-3 py-2">
            <p className="font-medium text-slate-800 mb-1">
              Semana {s.semana}{s.canal ? ` · ${s.canal}` : ''}{s.formato ? ` · ${s.formato}` : ''}
            </p>
            <ul className="space-y-0.5">
              {s.temas.map((t, i) => (
                <li key={i} className="text-slate-600 flex gap-2"><span className="text-blue-400">•</span>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {salida.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {salida.hashtags.map((h) => (
            <span key={h} className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">{h}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function RenderFoda({ salida }: { salida: SalidaFoda }) {
  const cuadrantes = [
    { etiqueta: 'Fortalezas', items: salida.fortalezas, color: 'bg-green-50 text-green-800', dot: 'text-green-500' },
    { etiqueta: 'Oportunidades', items: salida.oportunidades, color: 'bg-blue-50 text-blue-800', dot: 'text-blue-500' },
    { etiqueta: 'Debilidades', items: salida.debilidades, color: 'bg-amber-50 text-amber-800', dot: 'text-amber-500' },
    { etiqueta: 'Amenazas', items: salida.amenazas, color: 'bg-red-50 text-red-800', dot: 'text-red-500' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {cuadrantes.map(({ etiqueta, items, color, dot }) => (
        <div key={etiqueta} className={`rounded-md p-2.5 ${color}`}>
          <p className="text-xs font-semibold mb-1.5">{etiqueta}</p>
          <ul className="space-y-1">
            {items?.map((item, i) => (
              <li key={i} className="text-xs flex gap-1.5"><span className={dot}>•</span>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function RenderBuyerPersona({ salida }: { salida: SalidaBuyerPersona }) {
  const listas = [
    { etiqueta: 'Intereses', items: salida.intereses },
    { etiqueta: 'Dolores', items: salida.dolores },
    { etiqueta: 'Motivaciones', items: salida.motivaciones },
    { etiqueta: 'Canales favoritos', items: salida.canalesFavoritos },
  ];
  return (
    <div className="space-y-2 text-sm">
      <div className="flex gap-4">
        <p><span className="font-medium text-slate-700">{salida.nombre}</span></p>
        <p className="text-slate-500">{salida.edad}</p>
        <p className="text-slate-500">{salida.ocupacion}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {listas.map(({ etiqueta, items }) => (
          <div key={etiqueta} className="rounded-md bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-700 mb-1">{etiqueta}</p>
            <ul className="space-y-0.5">
              {items?.map((item, i) => (
                <li key={i} className="text-xs text-slate-600 flex gap-1.5"><span className="text-emerald-400">•</span>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function RenderPilares({ salida }: { salida: SalidaPilares }) {
  return (
    <div className="space-y-2">
      {salida.pilares?.map((p, i) => (
        <div key={i} className="rounded-md bg-amber-50 px-3 py-2.5">
          <p className="text-sm font-semibold text-amber-900">{p.nombre}</p>
          <p className="text-xs text-amber-700 mt-0.5 mb-1.5">{p.descripcion}</p>
          <div className="flex flex-wrap gap-1">
            {p.ejemplos?.map((e, j) => (
              <span key={j} className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">{e}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SalidaEstrategica({ tipo, salida }: { tipo: string; salida: unknown }) {
  if (tipo === 'ESTRATEGIA_MENSUAL') return <RenderEstrategiaMensual salida={salida as SalidaEstrategiaMensual} />;
  if (tipo === 'FODA') return <RenderFoda salida={salida as SalidaFoda} />;
  if (tipo === 'BUYER_PERSONA') return <RenderBuyerPersona salida={salida as SalidaBuyerPersona} />;
  if (tipo === 'PILARES') return <RenderPilares salida={salida as SalidaPilares} />;
  return (
    <pre className="text-xs bg-slate-50 rounded-md p-3 overflow-auto max-h-64 whitespace-pre-wrap text-slate-700">
      {JSON.stringify(salida, null, 2)}
    </pre>
  );
}

// ── Componentes de página ─────────────────────────────────────────────────────

function TarjetaGeneracion({ generacion: g }: { generacion: GeneracionIa }) {
  const [expandido, setExpandido] = useState(false);
  const fecha = new Date(g.creadoEn).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <Tarjeta>
      <TarjetaCabecera>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-1.5 ${COLORES_TIPO[g.tipoBoton] ?? 'bg-slate-100 text-slate-700'}`}>
              {ETIQUETAS_TIPO[g.tipoBoton] ?? g.tipoBoton}
            </span>
            <TarjetaTitulo className="text-sm truncate">{fecha}</TarjetaTitulo>
            <TarjetaDescripcion className="text-xs line-clamp-2">{g.instruccion}</TarjetaDescripcion>
          </div>
        </div>
      </TarjetaCabecera>
      <TarjetaContenido>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-marca hover:underline"
          onClick={() => setExpandido((v) => !v)}
        >
          {expandido ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          {expandido ? 'Ocultar' : 'Ver resultado'}
        </button>
        {expandido && (
          <div className="mt-3">
            <SalidaEstrategica tipo={g.tipoBoton} salida={g.salida} />
          </div>
        )}
        <p className="mt-2 text-xs text-slate-400">
          {g.tokensEntrada + g.tokensSalida} tokens · {g.modelo}
        </p>
      </TarjetaContenido>
    </Tarjeta>
  );
}

export function PaginaBancoIdeas() {
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('');
  const [pagina, setPagina] = useState(1);
  const limite = 12;

  const { data, isLoading } = useBancoIdeas({
    tipoBoton: tipoFiltro || undefined,
    pagina,
    limite,
  });

  const totalPaginas = data ? Math.ceil(data.total / limite) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banco de Ideas</h1>
          <p className="text-slate-500">Historial de análisis estratégicos generados con IA.</p>
        </div>
        <Link to="/ia">
          <Boton variante="contorno" tamano="sm">
            <Lightbulb className="size-4" /> Generar nuevo
          </Boton>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['', 'ESTRATEGIA_MENSUAL', 'FODA', 'BUYER_PERSONA', 'PILARES'] as TipoFiltro[]).map((t) => (
          <button
            key={t}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              tipoFiltro === t
                ? 'bg-marca text-white border-marca'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => { setTipoFiltro(t); setPagina(1); }}
          >
            {t === '' ? 'Todos' : ETIQUETAS_TIPO[t]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 text-center">
          <Lightbulb className="size-10 text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">Sin generaciones todavía</p>
          <p className="text-sm text-slate-500 mt-1">Usá el Centro de IA para generar análisis estratégicos.</p>
          <Link to="/ia" className="mt-4"><Boton>Ir al Centro de IA</Boton></Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((g) => <TarjetaGeneracion key={g.id} generacion={g} />)}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Boton variante="contorno" tamano="sm" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 1}>
                <ChevronLeft className="size-4" />
              </Boton>
              <span className="text-sm text-slate-600">{pagina} / {totalPaginas} · {data.total} generaciones</span>
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
