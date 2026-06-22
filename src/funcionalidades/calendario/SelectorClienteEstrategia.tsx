import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SelectorCliente } from '@/funcionalidades/clientes/SelectorCliente';
import { useEstrategias } from '@/funcionalidades/estrategia-marca/hooks';

export interface EstrategiaElegida {
  id: string;
  nombre: string;
  clienteNombre: string;
}

interface Props {
  onSeleccionar: (estrategia: EstrategiaElegida) => void;
}

/**
 * Cascada para elegir dónde marcar una publicación: primero el cliente (con
 * buscador), después una de SUS estrategias. Una publicación siempre cuelga de
 * una estrategia, así que esto reemplaza el viejo "ID de estrategia" a mano.
 */
export function SelectorClienteEstrategia({ onSeleccionar }: Props) {
  const [cliente, setCliente] = useState<{ id: string; nombre: string } | null>(null);

  if (!cliente) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">1. Elegí el cliente</p>
        <SelectorCliente onSeleccionar={setCliente} />
      </div>
    );
  }

  return (
    <ListaEstrategias cliente={cliente} onVolver={() => setCliente(null)} onSeleccionar={onSeleccionar} />
  );
}

function ListaEstrategias({
  cliente,
  onVolver,
  onSeleccionar,
}: {
  cliente: { id: string; nombre: string };
  onVolver: () => void;
  onSeleccionar: (estrategia: EstrategiaElegida) => void;
}) {
  const { data: estrategias = [], isLoading } = useEstrategias(cliente.id);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">2. Elegí la estrategia</p>
        <button type="button" className="text-xs text-marca hover:underline" onClick={onVolver}>
          ← cambiar cliente
        </button>
      </div>
      <p className="text-xs text-slate-400">Cliente: {cliente.nombre}</p>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando estrategias…</p>
      ) : estrategias.length === 0 ? (
        <p className="text-sm text-slate-500">
          Este cliente todavía no tiene estrategias. Creá una en{' '}
          <Link to="/estrategia" className="text-marca hover:underline">
            Estrategia de marca
          </Link>{' '}
          y volvé.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200">
          {estrategias.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onSeleccionar({ id: e.id, nombre: e.nombre, clienteNombre: cliente.nombre })}
              className="block w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{e.nombre}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
