import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SelectorCliente } from '@/funcionalidades/clientes/SelectorCliente';
import { Boton } from '@/componentes/ui/boton';
import { useEstrategias } from '@/funcionalidades/estrategia-marca/hooks';

export interface SeleccionPublicacion {
  clienteId: string;
  clienteNombre: string;
  estrategiaId?: string;
  estrategiaNombre?: string;
}

interface Props {
  onSeleccionar: (seleccion: SeleccionPublicacion) => void;
}

/**
 * Cascada para ubicar una publicación: primero el CLIENTE (obligatorio, con
 * buscador) y después, opcionalmente, una de SUS estrategias. Se puede continuar
 * sin estrategia (contenido suelto del cliente).
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

  return <PasoEstrategia cliente={cliente} onVolver={() => setCliente(null)} onSeleccionar={onSeleccionar} />;
}

function PasoEstrategia({
  cliente,
  onVolver,
  onSeleccionar,
}: {
  cliente: { id: string; nombre: string };
  onVolver: () => void;
  onSeleccionar: (seleccion: SeleccionPublicacion) => void;
}) {
  const { data: estrategias = [], isLoading } = useEstrategias(cliente.id);

  function continuar(estrategia?: { id: string; nombre: string }) {
    onSeleccionar({
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      estrategiaId: estrategia?.id,
      estrategiaNombre: estrategia?.nombre,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">2. Estrategia (opcional)</p>
        <button type="button" className="text-xs text-marca hover:underline" onClick={onVolver}>
          ← cambiar cliente
        </button>
      </div>
      <p className="text-xs text-slate-400">Cliente: {cliente.nombre}</p>

      <Boton variante="secundario" className="w-full" onClick={() => continuar()}>
        Continuar sin estrategia
      </Boton>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando estrategias…</p>
      ) : estrategias.length === 0 ? (
        <p className="text-xs text-slate-400">
          Este cliente no tiene estrategias.{' '}
          <Link to="/estrategia" className="text-marca hover:underline">
            Crear una
          </Link>{' '}
          (opcional).
        </p>
      ) : (
        <div className="space-y-1">
          <p className="text-xs text-slate-400">o asociala a una estrategia:</p>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200">
            {estrategias.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => continuar({ id: e.id, nombre: e.nombre })}
                className="block w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{e.nombre}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
