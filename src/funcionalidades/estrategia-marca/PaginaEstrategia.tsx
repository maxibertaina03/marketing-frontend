import { useState } from 'react';
import { Target, Plus, ChevronRight, Trash2, Pencil } from 'lucide-react';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaDescripcion,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { Selector } from '@/componentes/ui/campo';
import { usePermisos } from '@/permisos/usePermisos';
import { FormularioEstrategia } from './FormularioEstrategia';
import { SelectorCliente } from '@/funcionalidades/clientes/SelectorCliente';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import {
  useEstrategias,
  useCrearEstrategia,
  useActualizarEstrategia,
  useEliminarEstrategia,
  type EstrategiaDeMarca,
  type CrearEstrategiaPayload,
} from './hooks';

const ETIQUETAS_TONO: Record<string, string> = {
  FORMAL: 'Formal',
  INFORMAL: 'Informal',
  CASUAL: 'Casual',
  PROFESIONAL: 'Profesional',
  CERCANO: 'Cercano',
  INSPIRADOR: 'Inspirador',
  HUMORISTICO: 'Humorístico',
};

type Vista = 'lista' | 'nueva' | 'editar' | 'detalle';

export function PaginaEstrategia() {
  const { puedeEditar } = usePermisos();
  const [clienteIdFiltro, setClienteIdFiltro] = useState('');
  const { data: clientes = [] } = useClientes();
  const { data: estrategias, isLoading } = useEstrategias(clienteIdFiltro || undefined);
  const crearMutation = useCrearEstrategia();
  const eliminarMutation = useEliminarEstrategia();

  const [vista, setVista] = useState<Vista>('lista');
  const [seleccionada, setSeleccionada] = useState<EstrategiaDeMarca | null>(null);

  // Cliente elegido para la nueva estrategia (id para enviar, nombre para mostrar).
  const [clienteIdInput, setClienteIdInput] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteConfirmado, setClienteConfirmado] = useState(false);

  const actualizarMutation = useActualizarEstrategia(seleccionada?.id ?? '');

  function handleCrear(payload: CrearEstrategiaPayload) {
    crearMutation.mutate(payload, {
      onSuccess: () => {
        setVista('lista');
        setClienteConfirmado(false);
        setClienteIdInput('');
        setClienteNombre('');
      },
    });
  }

  function handleEditar(payload: Partial<Omit<CrearEstrategiaPayload, 'clienteId'>>) {
    actualizarMutation.mutate(payload, {
      onSuccess: () => setVista('lista'),
    });
  }

  function handleEliminar(id: string) {
    if (!confirm('¿Eliminar esta estrategia y todo su contenido asociado?')) return;
    eliminarMutation.mutate(id);
  }

  if (isLoading) return <p className="text-slate-500">Cargando estrategias…</p>;

  // Vista nueva (paso 1: elegir el cliente con buscador)
  if (vista === 'nueva' && !clienteConfirmado) {
    return (
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Nueva estrategia de marca</h1>
        <p className="text-slate-500 text-sm">
          Elegí el cliente al que pertenece esta estrategia.
        </p>
        <Tarjeta>
          <TarjetaContenido>
            <SelectorCliente
              onSeleccionar={(c) => {
                setClienteIdInput(c.id);
                setClienteNombre(c.nombre);
                setClienteConfirmado(true);
              }}
            />
          </TarjetaContenido>
        </Tarjeta>
        <Boton variante="contorno" onClick={() => setVista('lista')}>
          Volver
        </Boton>
      </div>
    );
  }

  // Vista nueva (paso 2: formulario)
  if (vista === 'nueva' && clienteConfirmado) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Nueva estrategia de marca</h1>
          <p className="text-slate-500">
            Cliente: <strong>{clienteNombre}</strong>{' '}
            <button
              type="button"
              className="text-marca hover:underline"
              onClick={() => setClienteConfirmado(false)}
            >
              (cambiar)
            </button>
          </p>
        </div>
        <Tarjeta>
          <TarjetaContenido>
            <FormularioEstrategia
              clienteId={clienteIdInput}
              onGuardar={handleCrear}
              onCancelar={() => { setVista('lista'); setClienteConfirmado(false); }}
              guardando={crearMutation.isPending}
            />
            {crearMutation.isError && (
              <p className="mt-3 text-sm text-red-600">
                {crearMutation.error?.message || 'No se pudo guardar la estrategia.'}
              </p>
            )}
          </TarjetaContenido>
        </Tarjeta>
      </div>
    );
  }

  // Vista editar
  if (vista === 'editar' && seleccionada) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Editar estrategia</h1>
          <p className="text-slate-500">{seleccionada.nombre}</p>
        </div>
        <Tarjeta>
          <TarjetaContenido>
            <FormularioEstrategia
              clienteId={seleccionada.clienteId}
              inicial={seleccionada}
              onGuardar={(p) => handleEditar(p)}
              onCancelar={() => setVista('lista')}
              guardando={actualizarMutation.isPending}
            />
            {actualizarMutation.isError && (
              <p className="mt-3 text-sm text-red-600">
                {actualizarMutation.error?.message || 'No se pudieron guardar los cambios.'}
              </p>
            )}
          </TarjetaContenido>
        </Tarjeta>
      </div>
    );
  }

  // Vista detalle
  if (vista === 'detalle' && seleccionada) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              className="text-sm text-slate-500 hover:text-slate-700 mb-1"
              onClick={() => setVista('lista')}
            >
              ← Volver a estrategias
            </button>
            <h1 className="text-2xl font-bold">{seleccionada.nombre}</h1>
            <p className="text-slate-500">Cliente: {seleccionada.cliente.nombre}</p>
          </div>
          {puedeEditar('estrategia') && (
            <Boton
              variante="contorno"
              onClick={() => setVista('editar')}
            >
              <Pencil className="size-4" /> Editar
            </Boton>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Tarjeta>
            <TarjetaCabecera>
              <TarjetaTitulo>Objetivo</TarjetaTitulo>
            </TarjetaCabecera>
            <TarjetaContenido>
              <p className="text-sm text-slate-700">{seleccionada.objetivo}</p>
            </TarjetaContenido>
          </Tarjeta>

          <Tarjeta>
            <TarjetaCabecera>
              <TarjetaTitulo>Público objetivo</TarjetaTitulo>
            </TarjetaCabecera>
            <TarjetaContenido>
              <p className="text-sm text-slate-700">{seleccionada.publicoObjetivo}</p>
            </TarjetaContenido>
          </Tarjeta>

          <Tarjeta>
            <TarjetaCabecera>
              <TarjetaTitulo>Tono de comunicación</TarjetaTitulo>
            </TarjetaCabecera>
            <TarjetaContenido>
              <span className="inline-block rounded-full bg-marca/10 px-3 py-1 text-sm font-medium text-marca">
                {ETIQUETAS_TONO[seleccionada.tono] ?? seleccionada.tono}
              </span>
            </TarjetaContenido>
          </Tarjeta>

          <Tarjeta>
            <TarjetaCabecera>
              <TarjetaTitulo>Pilares de marca</TarjetaTitulo>
            </TarjetaCabecera>
            <TarjetaContenido>
              <div className="flex flex-wrap gap-2">
                {seleccionada.pilares.map((p) => (
                  <span key={p} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {p}
                  </span>
                ))}
              </div>
            </TarjetaContenido>
          </Tarjeta>

          {seleccionada.restricciones && (
            <Tarjeta className="sm:col-span-2">
              <TarjetaCabecera>
                <TarjetaTitulo>Restricciones</TarjetaTitulo>
              </TarjetaCabecera>
              <TarjetaContenido>
                <p className="text-sm text-slate-700">{seleccionada.restricciones}</p>
              </TarjetaContenido>
            </Tarjeta>
          )}
        </div>
      </div>
    );
  }

  // Vista lista (default)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estrategia de marca</h1>
          <p className="text-slate-500">Definí el tono, objetivo y pilares de comunicación de cada cliente.</p>
        </div>
        {puedeEditar('estrategia') && (
          <Boton onClick={() => setVista('nueva')}>
            <Plus className="size-4" /> Nueva estrategia
          </Boton>
        )}
      </div>

      <Selector
        value={clienteIdFiltro}
        onChange={(e) => setClienteIdFiltro(e.target.value)}
        className="w-56"
      >
        <option value="">Todos los clientes</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </Selector>

      {!estrategias || estrategias.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 text-center">
          <Target className="size-10 text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">Sin estrategias todavía</p>
          <p className="text-sm text-slate-500 mt-1">
            Creá la primera estrategia de marca para empezar a planificar contenido.
          </p>
          {puedeEditar('estrategia') && (
            <Boton className="mt-4" onClick={() => setVista('nueva')}>
              <Plus className="size-4" /> Nueva estrategia
            </Boton>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {estrategias.map((e) => (
            <Tarjeta key={e.id} className="group hover:border-marca/50 transition-colors cursor-pointer">
              <TarjetaCabecera>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <TarjetaTitulo className="truncate">{e.nombre}</TarjetaTitulo>
                    <TarjetaDescripcion>{e.cliente.nombre}</TarjetaDescripcion>
                  </div>
                  <span className="ml-2 shrink-0 rounded-full bg-marca/10 px-2 py-0.5 text-xs font-medium text-marca">
                    {ETIQUETAS_TONO[e.tono] ?? e.tono}
                  </span>
                </div>
              </TarjetaCabecera>
              <TarjetaContenido>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{e.objetivo}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {e.pilares.slice(0, 3).map((p) => (
                    <span key={p} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {p}
                    </span>
                  ))}
                  {e.pilares.length > 3 && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      +{e.pilares.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Boton
                    variante="fantasma"
                    tamano="sm"
                    onClick={() => { setSeleccionada(e); setVista('detalle'); }}
                  >
                    Ver detalle <ChevronRight className="size-3" />
                  </Boton>
                  {puedeEditar('estrategia') && (
                    <div className="flex gap-1">
                      <Boton
                        variante="fantasma"
                        tamano="sm"
                        onClick={() => { setSeleccionada(e); setVista('editar'); }}
                      >
                        <Pencil className="size-3.5" />
                      </Boton>
                      <Boton
                        variante="fantasma"
                        tamano="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleEliminar(e.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Boton>
                    </div>
                  )}
                </div>
              </TarjetaContenido>
            </Tarjeta>
          ))}
        </div>
      )}
    </div>
  );
}
