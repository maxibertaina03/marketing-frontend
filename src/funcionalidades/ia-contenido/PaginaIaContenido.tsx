import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lightbulb, PenLine, Anchor, GalleryHorizontal } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Entrada, AreaTexto, Selector } from '@/componentes/ui/campo';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { useClienteActivo } from '@/contexto/contexto-cliente-activo';
import { usePermisos } from '@/permisos/usePermisos';
import { ErrorGeneracionIa } from '@/planes/ErrorGeneracionIa';
import { SalidaContenido } from '@/funcionalidades/biblioteca-copys/SalidaContenido';
import {
  useGenerarIdeas,
  useGenerarCopy,
  useGenerarHooks,
  useGenerarCarrusel,
  type RespuestaIa,
} from './hooks';

type Boton = 'ideas' | 'copy' | 'hooks' | 'carrusel';

const BOTONES: { id: Boton; nombre: string; descripcion: string; icono: typeof Sparkles; tipo: string }[] = [
  {
    id: 'ideas',
    nombre: 'Ideas de contenido',
    descripcion: 'Ideas variadas alineadas a la estrategia de la marca.',
    icono: Lightbulb,
    tipo: 'IDEAS_CONTENIDO',
  },
  {
    id: 'copy',
    nombre: 'Copy',
    descripcion: 'El texto de una publicación a partir de un brief.',
    icono: PenLine,
    tipo: 'COPYWRITING',
  },
  {
    id: 'hooks',
    nombre: 'Hooks',
    descripcion: 'Ganchos de apertura para captar la atención.',
    icono: Anchor,
    tipo: 'HOOKS',
  },
  {
    id: 'carrusel',
    nombre: 'Carrusel',
    descripcion: 'Guion de un carrusel, slide por slide.',
    icono: GalleryHorizontal,
    tipo: 'CARRUSEL',
  },
];

const REDES = ['instagram', 'tiktok', 'linkedin', 'facebook'];

/** IA de Contenido: genera ideas, copys, hooks y carruseles para una marca. */
export function PaginaIaContenido() {
  const { puedeEditar } = usePermisos();
  const { clienteActivoId } = useClienteActivo();
  const { data: clientes = [] } = useClientes();

  const [clienteLocal, setClienteLocal] = useState('');
  const clienteId = clienteActivoId || clienteLocal;

  const [boton, setBoton] = useState<Boton>('ideas');
  const [red, setRed] = useState('instagram');
  const [tema, setTema] = useState('');
  const [brief, setBrief] = useState('');
  const [cta, setCta] = useState('');
  const [cantidad, setCantidad] = useState(5);

  const ideas = useGenerarIdeas();
  const copy = useGenerarCopy();
  const hooks = useGenerarHooks();
  const carrusel = useGenerarCarrusel();
  const mutaciones = { ideas, copy, hooks, carrusel };
  const actual = mutaciones[boton];
  const definicion = BOTONES.find((b) => b.id === boton)!;

  const puedeGenerar = puedeEditar('ia');
  const faltaDato =
    (boton === 'copy' && !brief.trim()) ||
    ((boton === 'hooks' || boton === 'carrusel') && !tema.trim());

  function generar(e: FormEvent) {
    e.preventDefault();
    if (!clienteId || faltaDato) return;
    const base = { clienteId, red };
    if (boton === 'ideas') ideas.mutate({ ...base, cantidad, tema: tema.trim() || undefined });
    if (boton === 'copy') copy.mutate({ ...base, brief: brief.trim(), cta: cta.trim() || undefined });
    if (boton === 'hooks') hooks.mutate({ ...base, tema: tema.trim(), cantidad });
    if (boton === 'carrusel')
      carrusel.mutate({ ...base, tema: tema.trim(), cantidadSlides: cantidad });
  }

  const resultado = actual.data as RespuestaIa | undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">IA de Contenido</h1>
          <p className="text-slate-500">
            Generá ideas, copys, hooks y carruseles con el contexto real de la marca.
          </p>
        </div>
        <Link to="/biblioteca-copys" className="text-sm text-marca hover:underline">
          Ver la Biblioteca de Copys →
        </Link>
      </div>

      {!puedeGenerar && (
        <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-500">
          Tu rol puede consultar la Biblioteca, pero no generar contenido nuevo.
        </p>
      )}

      {/* Elegir el botón de IA */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BOTONES.map((b) => {
          const Icono = b.icono;
          const activo = boton === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setBoton(b.id)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                activo
                  ? 'border-marca bg-marca/5 ring-1 ring-marca'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Icono className={`mb-2 size-5 ${activo ? 'text-marca' : 'text-slate-400'}`} />
              <p className="font-medium text-slate-900">{b.nombre}</p>
              <p className="mt-0.5 text-xs text-slate-500">{b.descripcion}</p>
            </button>
          );
        })}
      </div>

      {/* Formulario */}
      <Tarjeta className="p-6">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={generar}>
          {!clienteActivoId && (
            <Campo etiqueta="Marca *">
              <Selector value={clienteLocal} onChange={(e) => setClienteLocal(e.target.value)}>
                <option value="">Elegí una marca…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Selector>
            </Campo>
          )}

          <Campo etiqueta="Red social">
            <Selector value={red} onChange={(e) => setRed(e.target.value)}>
              {REDES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Selector>
          </Campo>

          {boton === 'copy' ? (
            <>
              <div className="sm:col-span-2">
                <Campo etiqueta="Brief * — qué querés comunicar">
                  <AreaTexto
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Ej: promocionar el nuevo menú de otoño, con foco en los ingredientes de estación."
                  />
                </Campo>
              </div>
              <Campo etiqueta="Llamado a la acción (opcional)">
                <Entrada
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Reservá por WhatsApp"
                />
              </Campo>
            </>
          ) : (
            <>
              <Campo etiqueta={boton === 'ideas' ? 'Tema (opcional)' : 'Tema *'}>
                <Entrada
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder={
                    boton === 'carrusel' ? 'Beneficios del pilates' : 'Lanzamiento de temporada'
                  }
                />
              </Campo>
              <Campo etiqueta={boton === 'carrusel' ? 'Cantidad de slides' : 'Cantidad'}>
                <Entrada
                  type="number"
                  min={1}
                  max={10}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </Campo>
            </>
          )}

          <div className="sm:col-span-2">
            <Boton type="submit" disabled={!puedeGenerar || !clienteId || faltaDato || actual.isPending}>
              <Sparkles className="size-4" />
              {actual.isPending ? 'Generando…' : `Generar ${definicion.nombre.toLowerCase()}`}
            </Boton>
            {!clienteId && (
              <p className="mt-2 text-xs text-slate-400">Elegí una marca para poder generar.</p>
            )}
            {actual.isError && (
              <ErrorGeneracionIa
                error={actual.error}
                fallback="No se pudo generar. Revisá que la marca tenga su estrategia cargada."
              />
            )}
          </div>
        </form>
      </Tarjeta>

      {/* Resultado */}
      {resultado && (
        <Tarjeta className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">{definicion.nombre}</h2>
            <span className="text-xs text-slate-400">
              Guardado en la Biblioteca
              {resultado.tokens
                ? ` · ${resultado.tokens.entrada + resultado.tokens.salida} tokens`
                : ''}
            </span>
          </div>
          <SalidaContenido tipo={definicion.tipo} salida={resultado.salida} detallado />
        </Tarjeta>
      )}
    </div>
  );
}
