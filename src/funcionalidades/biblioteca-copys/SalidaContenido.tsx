/**
 * Renderiza de forma legible la salida de la IA de Contenido, según su tipo
 * (no JSON crudo). Lo usan tanto la Biblioteca de Copys como la pantalla que
 * genera el contenido.
 */
export function SalidaContenido({
  tipo,
  salida,
  detallado = false,
}: {
  tipo: string;
  salida: unknown;
  /** En la pantalla de generación mostramos todo; en la biblioteca, un resumen. */
  detallado?: boolean;
}) {
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
      <ul className="space-y-2 text-sm text-slate-700">
        {(s.ideas as { titulo?: string; formato?: string; descripcion?: string }[]).map(
          (idea, i) => (
            <li key={i}>
              <span className="font-medium">{idea.titulo}</span>
              {idea.formato && <span className="text-xs text-slate-400"> · {idea.formato}</span>}
              {detallado && idea.descripcion && (
                <p className="text-xs text-slate-500">{idea.descripcion}</p>
              )}
            </li>
          ),
        )}
      </ul>
    );
  }

  if (tipo === 'CARRUSEL') {
    const slides = (Array.isArray(s.slides) ? s.slides : []) as {
      titulo?: string;
      texto?: string;
    }[];
    return (
      <div className="space-y-2 text-sm text-slate-700">
        <p className="font-medium">{String(s.titulo ?? 'Carrusel')}</p>
        {detallado ? (
          <ol className="space-y-1.5">
            {slides.map((slide, i) => (
              <li key={i} className="rounded-md bg-slate-50 px-3 py-2">
                <span className="text-xs font-medium text-slate-400">Slide {i + 1}</span>
                <p className="font-medium">{slide.titulo}</p>
                {slide.texto && <p className="text-xs text-slate-600">{slide.texto}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-slate-400">{slides.length} slides</p>
        )}
        {s.pieDeFoto ? (
          <p className="whitespace-pre-wrap text-xs text-slate-600">{String(s.pieDeFoto)}</p>
        ) : null}
      </div>
    );
  }

  return (
    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-600">
      {JSON.stringify(salida, null, 2)}
    </pre>
  );
}
