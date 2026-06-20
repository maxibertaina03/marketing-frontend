import { useState, useMemo } from 'react';
import { CalendarDays, LayoutGrid, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';
import { CalendarioMensual } from './CalendarioMensual';
import { CalendarioSemanal } from './CalendarioSemanal';
import { FormularioPublicacion } from './FormularioPublicacion';
import {
  usePublicaciones,
  useCrearPublicacion,
  useActualizarPublicacion,
  useEliminarPublicacion,
  useCambiarEstado,
  type Publicacion,
  type EstadoContenido,
  type CrearPublicacionPayload,
} from './hooks';

type VistaCalendario = 'mensual' | 'semanal';

const ETIQUETAS_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'Borrador',
  EN_REVISION: 'En revisión',
  APROBADO: 'Aprobado',
  PROGRAMADO: 'Programado',
  PUBLICADO: 'Publicado',
  RECHAZADO: 'Rechazado',
};

const COLORES_ESTADO: Record<EstadoContenido, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  EN_REVISION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-blue-100 text-blue-800',
  PROGRAMADO: 'bg-purple-100 text-purple-800',
  PUBLICADO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-700',
};

const ESTADOS_FLUJO: EstadoContenido[] = ['BORRADOR', 'EN_REVISION', 'APROBADO', 'PROGRAMADO', 'PUBLICADO', 'RECHAZADO'];

// ID de estrategia temporal hasta que el selector de estrategias esté integrado
const ESTRATEGIA_ID_PLACEHOLDER = '';

export function PaginaCalendario() {
  const hoy = new Date();
  const [vistaCalendario, setVistaCalendario] = useState<VistaCalendario>('mensual');
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [semanaBase, setSemanaBase] = useState(hoy);

  // Panel lateral
  const [modalAbierto, setModalAbierto] = useState(false);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [fechaClickeada, setFechaClickeada] = useState<string | undefined>();
  const [estrategiaIdInput, setEstrategiaIdInput] = useState(ESTRATEGIA_ID_PLACEHOLDER);

  // Rango de fechas para el query
  const { desde, hasta } = useMemo(() => {
    if (vistaCalendario === 'mensual') {
      return {
        desde: new Date(anio, mes, 1).toISOString(),
        hasta: new Date(anio, mes + 1, 0, 23, 59, 59).toISOString(),
      };
    }
    const inicio = new Date(semanaBase);
    inicio.setDate(inicio.getDate() - inicio.getDay());
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
    return { desde: inicio.toISOString(), hasta: fin.toISOString() };
  }, [vistaCalendario, anio, mes, semanaBase]);

  const { data: publicaciones = [], isLoading } = usePublicaciones({ desde, hasta });
  const crearMutation = useCrearPublicacion();
  const actualizarMutation = useActualizarPublicacion(publicacionSeleccionada?.id ?? '');
  const eliminarMutation = useEliminarPublicacion();
  const cambiarEstadoMutation = useCambiarEstado();

  function avanzarMes() {
    if (mes === 11) { setMes(0); setAnio(a => a + 1); }
    else setMes(m => m + 1);
  }
  function retrocederMes() {
    if (mes === 0) { setMes(11); setAnio(a => a - 1); }
    else setMes(m => m - 1);
  }

  function handleClickDia(fecha: string) {
    setFechaClickeada(fecha);
    setPublicacionSeleccionada(null);
    setModoEdicion(false);
    setModalAbierto(true);
  }

  function handleClickPublicacion(p: Publicacion) {
    setPublicacionSeleccionada(p);
    setModoEdicion(false);
    setModalAbierto(true);
  }

  function handleCrear(payload: CrearPublicacionPayload) {
    crearMutation.mutate(payload, {
      onSuccess: () => { setModalAbierto(false); setFechaClickeada(undefined); },
    });
  }

  function handleActualizar(payload: Partial<Omit<CrearPublicacionPayload, 'estrategiaId'>>) {
    actualizarMutation.mutate(payload, {
      onSuccess: () => setModoEdicion(false),
    });
  }

  function handleEliminar(id: string) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    eliminarMutation.mutate(id, {
      onSuccess: () => setModalAbierto(false),
    });
  }

  function handleCambiarEstado(estado: EstadoContenido) {
    if (!publicacionSeleccionada) return;
    cambiarEstadoMutation.mutate({ id: publicacionSeleccionada.id, estado });
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Panel principal */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendario</h1>
            <p className="text-slate-500">Planificá y seguí el contenido de tus clientes.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-slate-200 overflow-hidden">
              <button
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${
                  vistaCalendario === 'mensual' ? 'bg-marca text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setVistaCalendario('mensual')}
              >
                <LayoutGrid className="size-4" /> Mes
              </button>
              <button
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 border-l border-slate-200 ${
                  vistaCalendario === 'semanal' ? 'bg-marca text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setVistaCalendario('semanal')}
              >
                <CalendarDays className="size-4" /> Semana
              </button>
            </div>
            <Boton
              tamano="md"
              onClick={() => { setPublicacionSeleccionada(null); setFechaClickeada(undefined); setModoEdicion(false); setModalAbierto(true); }}
            >
              <Plus className="size-4" /> Nueva publicación
            </Boton>
          </div>
        </div>

        {isLoading ? (
          <p className="text-slate-500">Cargando…</p>
        ) : vistaCalendario === 'mensual' ? (
          <CalendarioMensual
            anio={anio}
            mes={mes}
            publicaciones={publicaciones}
            onMesAnterior={retrocederMes}
            onMesSiguiente={avanzarMes}
            onClickDia={handleClickDia}
            onClickPublicacion={handleClickPublicacion}
          />
        ) : (
          <CalendarioSemanal
            semanaBase={semanaBase}
            publicaciones={publicaciones}
            onSemanaAnterior={() => { const d = new Date(semanaBase); d.setDate(d.getDate() - 7); setSemanaBase(d); }}
            onSemanaSiguiente={() => { const d = new Date(semanaBase); d.setDate(d.getDate() + 7); setSemanaBase(d); }}
            onClickPublicacion={handleClickPublicacion}
          />
        )}
      </div>

      {/* Panel lateral — detalle / formulario */}
      {modalAbierto && (
        <div className="w-96 shrink-0">
          <Tarjeta className="sticky top-0">
            <TarjetaCabecera>
              <div className="flex items-center justify-between">
                <TarjetaTitulo>
                  {publicacionSeleccionada
                    ? modoEdicion ? 'Editar publicación' : 'Publicación'
                    : 'Nueva publicación'}
                </TarjetaTitulo>
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => { setModalAbierto(false); setModoEdicion(false); }}
                >
                  <X className="size-5" />
                </button>
              </div>
            </TarjetaCabecera>
            <TarjetaContenido>
              {/* Formulario nueva o editar */}
              {(!publicacionSeleccionada || modoEdicion) && (
                <>
                  {!publicacionSeleccionada && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        ID de estrategia de marca
                      </label>
                      <input
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
                        value={estrategiaIdInput}
                        onChange={(e) => setEstrategiaIdInput(e.target.value)}
                        placeholder="ID de estrategia"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Cuando masita entregue el módulo de estrategias, esto será un selector.
                      </p>
                    </div>
                  )}
                  {(publicacionSeleccionada || estrategiaIdInput) && (
                    <FormularioPublicacion
                      estrategiaId={publicacionSeleccionada?.estrategiaId ?? estrategiaIdInput}
                      fechaInicial={fechaClickeada}
                      inicial={publicacionSeleccionada ?? undefined}
                      onGuardar={publicacionSeleccionada ? handleActualizar : handleCrear}
                      onCancelar={() => {
                        if (publicacionSeleccionada) setModoEdicion(false);
                        else setModalAbierto(false);
                      }}
                      guardando={crearMutation.isPending || actualizarMutation.isPending}
                    />
                  )}
                </>
              )}

              {/* Vista detalle */}
              {publicacionSeleccionada && !modoEdicion && (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold">{publicacionSeleccionada.titulo}</p>
                    <p className="text-sm text-slate-500">{publicacionSeleccionada.canal}</p>
                    {publicacionSeleccionada.fechaProgramada && (
                      <p className="text-sm text-slate-500">
                        {new Date(publicacionSeleccionada.fechaProgramada).toLocaleString('es-AR', {
                          day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Estado</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ESTADOS_FLUJO.map((e) => (
                        <button
                          key={e}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-opacity ${
                            publicacionSeleccionada.estado === e
                              ? COLORES_ESTADO[e] + ' ring-2 ring-offset-1 ring-current'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          onClick={() => handleCambiarEstado(e)}
                          disabled={cambiarEstadoMutation.isPending}
                        >
                          {ETIQUETAS_ESTADO[e]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Contenido</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{publicacionSeleccionada.contenido}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Estrategia</p>
                    <p className="text-sm text-slate-700">{publicacionSeleccionada.estrategia.nombre}</p>
                    <p className="text-xs text-slate-400">{publicacionSeleccionada.estrategia.cliente.nombre}</p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Boton variante="contorno" tamano="sm" onClick={() => setModoEdicion(true)}>
                      <Pencil className="size-3.5" /> Editar
                    </Boton>
                    <Boton
                      variante="peligro"
                      tamano="sm"
                      onClick={() => handleEliminar(publicacionSeleccionada.id)}
                      disabled={eliminarMutation.isPending}
                    >
                      <Trash2 className="size-3.5" /> Eliminar
                    </Boton>
                  </div>
                </div>
              )}
            </TarjetaContenido>
          </Tarjeta>
        </div>
      )}
    </div>
  );
}
