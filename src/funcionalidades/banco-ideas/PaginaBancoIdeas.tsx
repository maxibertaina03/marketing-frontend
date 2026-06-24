import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tarjeta, TarjetaCabecera, TarjetaTitulo, TarjetaDescripcion, TarjetaContenido } from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { useBancoIdeas, type GeneracionIa } from '../ia-estrategia/hooks';

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

      {/* Filtros */}
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
          <p className="text-sm text-slate-500 mt-1">
            Usá el Centro de IA para generar análisis estratégicos.
          </p>
          <Link to="/ia" className="mt-4">
            <Boton>Ir al Centro de IA</Boton>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((g) => (
              <TarjetaGeneracion key={g.id} generacion={g} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Boton
                variante="contorno"
                tamano="sm"
                onClick={() => setPagina((p) => p - 1)}
                disabled={pagina === 1}
              >
                <ChevronLeft className="size-4" />
              </Boton>
              <span className="text-sm text-slate-600">
                {pagina} / {totalPaginas} · {data.total} generaciones
              </span>
              <Boton
                variante="contorno"
                tamano="sm"
                onClick={() => setPagina((p) => p + 1)}
                disabled={pagina >= totalPaginas}
              >
                <ChevronRight className="size-4" />
              </Boton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
          className="text-xs text-marca hover:underline"
          onClick={() => setExpandido((v) => !v)}
        >
          {expandido ? 'Ocultar salida' : 'Ver salida'}
        </button>
        {expandido && (
          <pre className="mt-2 text-xs bg-slate-50 rounded-md p-3 overflow-auto max-h-64 whitespace-pre-wrap text-slate-700">
            {JSON.stringify(g.salida, null, 2)}
          </pre>
        )}
        <p className="mt-2 text-xs text-slate-400">
          {g.tokensEntrada + g.tokensSalida} tokens · {g.modelo}
        </p>
      </TarjetaContenido>
    </Tarjeta>
  );
}
