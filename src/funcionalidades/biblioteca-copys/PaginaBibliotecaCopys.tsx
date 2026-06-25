import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Selector } from '@/componentes/ui/campo';
import { Tarjeta, TarjetaCabecera, TarjetaContenido } from '@/componentes/ui/tarjeta';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import {
  useBiblioteca,
  ETIQUETA_TIPO,
  COLOR_TIPO,
  TIPOS_CONTENIDO,
  type GeneracionContenido,
} from './hooks';

const LIMITE = 12;

/** Biblioteca de Copys: historial de contenido generado con IA (Fase 2, slice masita). */
export function PaginaBibliotecaCopys() {
  const [clienteId, setClienteId] = useState('');
  const [tipo, setTipo] = useState('');
  const [pagina, setPagina] = useState(1);

  const { data: clientes = [] } = useClientes();
  const { data, isLoading } = useBiblioteca({
    clienteId: clienteId || undefined,
    tipoBoton: tipo || undefined,
    pagina,
    limite: LIMITE,
  });

  const totalPaginas = data ? Math.ceil(data.total / LIMITE) : 0;

  function cambiarFiltro(setter: (v: string) => void, valor: string) {
    setter(valor);
    setPagina(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Biblioteca de Copys</h1>
          <p className="text-slate-500">Todo el contenido generado con IA, listo para reutilizar.</p>
        </div>
        <Link to="/ia">
          <Boton variante="contorno" tamano="sm">
            <Sparkles className="size-4" /> Generar contenido
          </Boton>
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Campo etiqueta="Cliente">
          <Selector
            className="w-60"
            value={clienteId}
            onChange={(e) => cambiarFiltro(setClienteId, e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Tipo">
          <Selector
            className="w-48"
            value={tipo}
            onChange={(e) => cambiarFiltro(setTipo, e.target.value)}
          >
            <option value="">Todos</option>
            {TIPOS_CONTENIDO.map((t) => (
              <option key={t} value={t}>
                {ETIQUETA_TIPO[t]}
              </option>
            ))}
          </Selector>
        </Campo>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 text-center">
          <FileText className="mb-3 size-10 text-slate-300" />
          <p className="font-medium text-slate-700">Sin contenido todavía</p>
          <p className="mt-1 text-sm text-slate-500">
            Generá ideas, copys, hooks o carruseles desde el Centro de IA.
          </p>
          <Link to="/ia" className="mt-4">
            <Boton>Ir al Centro de IA</Boton>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((g) => (
              <TarjetaContenidoIa key={g.id} generacion={g} />
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

function TarjetaContenidoIa({ generacion: g }: { generacion: GeneracionContenido }) {
  const fecha = new Date(g.creadoEn).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Tarjeta className="flex flex-col">
      <TarjetaCabecera>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_TIPO[g.tipoBoton] ?? 'bg-slate-100 text-slate-700'}`}
          >
            {ETIQUETA_TIPO[g.tipoBoton] ?? g.tipoBoton}
          </span>
          <span className="text-xs text-slate-400">{fecha}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{g.instruccion}</p>
      </TarjetaCabecera>
      <TarjetaContenido className="flex-1">
        <SalidaContenido tipo={g.tipoBoton} salida={g.salida} />
      </TarjetaContenido>
    </Tarjeta>
  );
}

/** Renderiza la salida según el tipo de contenido (legible, no JSON crudo). */
function SalidaContenido({ tipo, salida }: { tipo: string; salida: unknown }) {
  const s = (salida ?? {}) as Record<string, unknown>;

  if (tipo === 'COPYWRITING') {
    return (
      <div className="space-y-2 text-sm text-slate-700">
        <p className="whitespace-pre-wrap">{String(s.texto ?? '')}</p>
        {Array.isArray(s.hashtags) && s.hashtags.length > 0 && (
          <p className="text-xs text-blue-600">{(s.hashtags as string[]).join(' ')}</p>
        )}
        {s.cta ? <p className="text-xs font-medium text-slate-500">CTA: {String(s.cta)}</p> : null}
      </div>
    );
  }

  if (tipo === 'HOOKS' && Array.isArray(s.hooks)) {
    return (
      <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
        {(s.hooks as string[]).map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    );
  }

  if (tipo === 'IDEAS_CONTENIDO' && Array.isArray(s.ideas)) {
    return (
      <ul className="space-y-1.5 text-sm text-slate-700">
        {(s.ideas as { titulo?: string; formato?: string }[]).map((idea, i) => (
          <li key={i}>
            <span className="font-medium">{idea.titulo}</span>
            {idea.formato && <span className="text-xs text-slate-400"> · {idea.formato}</span>}
          </li>
        ))}
      </ul>
    );
  }

  if (tipo === 'CARRUSEL') {
    const slides = Array.isArray(s.slides) ? s.slides.length : 0;
    return (
      <div className="space-y-1 text-sm text-slate-700">
        <p className="font-medium">{String(s.titulo ?? 'Carrusel')}</p>
        <p className="text-xs text-slate-400">{slides} slides</p>
        {s.pieDeFoto ? <p className="whitespace-pre-wrap text-xs">{String(s.pieDeFoto)}</p> : null}
      </div>
    );
  }

  // Fallback genérico
  return (
    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-600">
      {JSON.stringify(salida, null, 2)}
    </pre>
  );
}
