import { useState, type FormEvent } from 'react';
import { Info } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Entrada, AreaTexto, Selector } from '@/componentes/ui/campo';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { useClienteActivo } from '@/contexto/contexto-cliente-activo';
import { usePermisos } from '@/permisos/usePermisos';
import { TarjetaTarea } from './TarjetaTarea';
import {
  useTablero,
  useCrearTarea,
  useActualizarTarea,
  useEliminarTarea,
  usePublicacionesParaTareas,
  useMiembros,
} from './hooks';
import {
  ESTADOS_TAREA,
  ETIQUETA_ESTADO_TAREA,
  ETIQUETA_TIPO_TAREA,
  TIPOS_TAREA,
  type CrearTareaPayload,
  type EstadoTarea,
  type TipoTarea,
} from './tipos';

const FORM_INICIAL = {
  publicacionId: '',
  titulo: '',
  descripcion: '',
  tipo: 'OTRO' as TipoTarea,
  asignadoId: '',
  fechaLimite: '',
};

/** Tablero de producción: tareas del equipo agrupadas por estado. */
export function PaginaProduccion() {
  const { puedeEditar } = usePermisos();
  const gestiona = puedeEditar('produccion');
  const { clienteActivoId } = useClienteActivo();
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [publicacionFiltro, setPublicacionFiltro] = useState('');
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  // La marca activa manda: si hay una elegida, se filtra por ella y se oculta el
  // filtro local de cliente (para no duplicar el control).
  const clienteEfectivo = clienteActivoId || clienteFiltro;

  const { data: tablero, isLoading } = useTablero({
    ...(clienteEfectivo ? { clienteId: clienteEfectivo } : {}),
    ...(publicacionFiltro ? { publicacionId: publicacionFiltro } : {}),
  });
  const { data: clientes = [] } = useClientes();
  const { data: publicaciones = [] } = usePublicacionesParaTareas();
  const { data: miembros = [] } = useMiembros();

  // Al filtrar por cliente, las publicaciones (del filtro y del alta) se acotan a esa marca.
  const publicacionesVisibles = clienteEfectivo
    ? publicaciones.filter((p) => p.clienteId === clienteEfectivo)
    : publicaciones;

  function cambiarClienteFiltro(id: string) {
    setClienteFiltro(id);
    setPublicacionFiltro('');
  }

  const crear = useCrearTarea();
  const actualizar = useActualizarTarea();
  const eliminar = useEliminarTarea();

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!form.publicacionId || !form.titulo.trim()) return;
    const payload: CrearTareaPayload = {
      publicacionId: form.publicacionId,
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      ...(form.descripcion.trim() ? { descripcion: form.descripcion.trim() } : {}),
      ...(form.asignadoId ? { asignadoId: form.asignadoId } : {}),
      ...(form.fechaLimite ? { fechaLimite: new Date(form.fechaLimite).toISOString() } : {}),
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
          <h1 className="text-2xl font-bold">Producción</h1>
          <p className="text-slate-500">Las tareas del equipo sobre cada publicación.</p>
        </div>
        {gestiona && (
          <Boton
            onClick={() => setCreando((v) => !v)}
            variante={creando ? 'secundario' : 'primario'}
          >
            {creando ? 'Cancelar' : 'Nueva tarea'}
          </Boton>
        )}
      </div>

      <div className="flex gap-3 rounded-md border border-marca/20 bg-marca/5 p-4 text-sm text-slate-600">
        <Info className="mt-0.5 size-5 shrink-0 text-marca" />
        <div className="space-y-1">
          <p>
            Acá el equipo lleva el <strong>trabajo</strong> de cada publicación (diseñar, redactar,
            editar…). Cada <strong>tarea</strong> se crea sobre una <strong>publicación</strong> del
            calendario con el botón <strong>“Nueva tarea”</strong>.
          </p>
          <p className="text-slate-500">
            El estado de la tarea (Pendiente → En curso → Bloqueada → Hecha) es el avance del
            trabajo, y es <strong>distinto</strong> del estado editorial de la publicación
            (Borrador, Aprobado, Publicado…), que se maneja en <strong>Calendario</strong> y{' '}
            <strong>Aprobaciones</strong>.
          </p>
        </div>
      </div>

      {creando && gestiona && (
        <Tarjeta className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Nueva tarea</h2>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={enviar}>
            <Campo etiqueta="Publicación">
              <Selector
                value={form.publicacionId}
                onChange={(e) => setForm((f) => ({ ...f, publicacionId: e.target.value }))}
                required
              >
                <option value="">Elegí una publicación…</option>
                {publicacionesVisibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Título">
              <Entrada
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Ej: Diseñar el carrusel"
                required
              />
            </Campo>
            <Campo etiqueta="Tipo">
              <Selector
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoTarea }))}
              >
                {TIPOS_TAREA.map((t) => (
                  <option key={t} value={t}>
                    {ETIQUETA_TIPO_TAREA[t]}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Responsable">
              <Selector
                value={form.asignadoId}
                onChange={(e) => setForm((f) => ({ ...f, asignadoId: e.target.value }))}
              >
                <option value="">Sin asignar</option>
                {miembros.map((m) => (
                  <option key={m.membresiaId} value={m.membresiaId}>
                    {m.nombre ?? m.email}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Fecha límite">
              <Entrada
                type="date"
                value={form.fechaLimite}
                onChange={(e) => setForm((f) => ({ ...f, fechaLimite: e.target.value }))}
              />
            </Campo>
            <div className="sm:col-span-2">
              <Campo etiqueta="Descripción (opcional)">
                <AreaTexto
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Detalles de la tarea…"
                />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <Boton type="submit" disabled={crear.isPending}>
                {crear.isPending ? 'Creando…' : 'Crear tarea'}
              </Boton>
              {crear.isError && (
                <p className="mt-2 text-sm text-red-600">No se pudo crear la tarea.</p>
              )}
            </div>
          </form>
        </Tarjeta>
      )}

      <div className="flex flex-wrap items-end gap-3">
        {!clienteActivoId && (
          <Campo etiqueta="Filtrar por cliente">
            <Selector
              className="w-64"
              value={clienteFiltro}
              onChange={(e) => cambiarClienteFiltro(e.target.value)}
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
        <Campo etiqueta="Filtrar por publicación">
          <Selector
            className="w-72"
            value={publicacionFiltro}
            onChange={(e) => setPublicacionFiltro(e.target.value)}
          >
            <option value="">Todas las publicaciones</option>
            {publicaciones.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            ))}
          </Selector>
        </Campo>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando tablero…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ESTADOS_TAREA.map((estado) => {
            const tareas = tablero?.[estado] ?? [];
            return (
              <div key={estado} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-2 py-0.5 text-sm font-semibold ${ETIQUETA_ESTADO_TAREA[estado].clase}`}
                  >
                    {ETIQUETA_ESTADO_TAREA[estado].texto}
                  </span>
                  <span className="text-xs text-slate-400">{tareas.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {tareas.map((tarea) => (
                    <TarjetaTarea
                      key={tarea.id}
                      tarea={tarea}
                      ocupado={actualizar.isPending || eliminar.isPending}
                      onCambiarEstado={(nuevo: EstadoTarea) =>
                        actualizar.mutate({ id: tarea.id, cambios: { estado: nuevo } })
                      }
                      onEliminar={() => eliminar.mutate(tarea.id)}
                    />
                  ))}
                  {tareas.length === 0 && (
                    <p className="rounded-md border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                      Sin tareas
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
