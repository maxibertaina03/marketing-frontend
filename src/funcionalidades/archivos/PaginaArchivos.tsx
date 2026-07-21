import { useMemo, useState, type FormEvent } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Entrada, Selector } from '@/componentes/ui/campo';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { useClienteActivo } from '@/contexto/contexto-cliente-activo';
import { usePermisos } from '@/permisos/usePermisos';
import {
  useArchivos,
  useCrearArchivo,
  useEliminarArchivo,
  usePublicacionesParaArchivos,
} from './hooks';
import {
  ETIQUETA_TIPO_ARCHIVO,
  TIPOS_ARCHIVO,
  type CrearArchivoPayload,
  type TipoArchivo,
} from './tipos';

const FORM_INICIAL = {
  nombre: '',
  url: '',
  clienteId: '',
  tipo: 'OTRO' as TipoArchivo,
  publicacionId: '',
};

function formatearTamano(bytes: number | null): string | null {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Gestión de archivos de las marcas (MVP: metadata + URL). */
export function PaginaArchivos() {
  const { puedeEditar } = usePermisos();
  const gestiona = puedeEditar('archivos');
  const { clienteActivoId } = useClienteActivo();
  const [clienteFiltro, setClienteFiltro] = useState('');
  // La marca activa manda; si hay una, se oculta el filtro local de cliente.
  const clienteEfectivo = clienteActivoId || clienteFiltro;
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  const { data: clientes = [] } = useClientes();
  const { data: publicaciones = [] } = usePublicacionesParaArchivos();
  const { data: archivos = [], isLoading } = useArchivos(
    clienteEfectivo ? { clienteId: clienteEfectivo } : {},
  );

  const crear = useCrearArchivo();
  const eliminar = useEliminarArchivo();

  // Publicaciones del cliente elegido en el formulario (para asociar el archivo).
  const publicacionesDelCliente = useMemo(
    () => publicaciones.filter((p) => p.clienteId === form.clienteId),
    [publicaciones, form.clienteId],
  );

  function abrirForm() {
    setForm({ ...FORM_INICIAL, clienteId: clienteEfectivo });
    setCreando(true);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!form.clienteId || !form.nombre.trim() || !form.url.trim()) return;
    const payload: CrearArchivoPayload = {
      nombre: form.nombre.trim(),
      url: form.url.trim(),
      clienteId: form.clienteId,
      tipo: form.tipo,
      ...(form.publicacionId ? { publicacionId: form.publicacionId } : {}),
    };
    crear.mutate(payload, {
      onSuccess: () => {
        setForm(FORM_INICIAL);
        setCreando(false);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Archivos</h1>
          <p className="text-slate-500">Diseños, imágenes y documentos de tus marcas.</p>
        </div>
        {gestiona && (
          <Boton
            onClick={() => (creando ? setCreando(false) : abrirForm())}
            variante={creando ? 'secundario' : 'primario'}
          >
            {creando ? 'Cancelar' : 'Registrar archivo'}
          </Boton>
        )}
      </div>

      {creando && gestiona && (
        <Tarjeta className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Registrar archivo</h2>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={enviar}>
            <Campo etiqueta="Cliente">
              <Selector
                value={form.clienteId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clienteId: e.target.value, publicacionId: '' }))
                }
                required
              >
                <option value="">Elegí un cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Nombre">
              <Entrada
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="carrusel-lanzamiento.png"
                required
              />
            </Campo>
            <div className="sm:col-span-2">
              <Campo etiqueta="URL del archivo">
                <Entrada
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://…"
                  required
                />
              </Campo>
            </div>
            <Campo etiqueta="Tipo">
              <Selector
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoArchivo }))}
              >
                {TIPOS_ARCHIVO.map((t) => (
                  <option key={t} value={t}>
                    {ETIQUETA_TIPO_ARCHIVO[t].texto}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Publicación (opcional)">
              <Selector
                value={form.publicacionId}
                onChange={(e) => setForm((f) => ({ ...f, publicacionId: e.target.value }))}
                disabled={!form.clienteId}
              >
                <option value="">Sin asociar</option>
                {publicacionesDelCliente.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </Selector>
            </Campo>
            <div className="sm:col-span-2">
              <Boton type="submit" disabled={crear.isPending}>
                {crear.isPending ? 'Guardando…' : 'Registrar'}
              </Boton>
              {crear.isError && (
                <p className="mt-2 text-sm text-red-600">No se pudo registrar el archivo.</p>
              )}
            </div>
          </form>
        </Tarjeta>
      )}

      <div className="flex flex-wrap items-end gap-3">
        {!clienteActivoId && (
          <Campo etiqueta="Filtrar por cliente">
            <Selector
              className="w-72"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Selector>
          </Campo>
        )}
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando archivos…</p>
      ) : archivos.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          Todavía no hay archivos. Registrá el primero con el botón de arriba.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archivos.map((archivo) => {
            const tamano = formatearTamano(archivo.tamanoBytes);
            return (
              <Tarjeta key={archivo.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-900" title={archivo.nombre}>
                    {archivo.nombre}
                  </p>
                  {gestiona && (
                    <button
                      type="button"
                      onClick={() => eliminar.mutate(archivo.id)}
                      disabled={eliminar.isPending}
                      className="text-slate-400 transition-colors hover:text-red-600 disabled:opacity-50"
                      aria-label="Eliminar archivo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded px-1.5 py-0.5 font-medium ${ETIQUETA_TIPO_ARCHIVO[archivo.tipo].clase}`}
                  >
                    {ETIQUETA_TIPO_ARCHIVO[archivo.tipo].texto}
                  </span>
                  {tamano && <span className="text-slate-400">{tamano}</span>}
                </div>
                <a
                  href={archivo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-marca hover:underline"
                >
                  <ExternalLink className="h-4 w-4" /> Abrir
                </a>
              </Tarjeta>
            );
          })}
        </div>
      )}
    </div>
  );
}
