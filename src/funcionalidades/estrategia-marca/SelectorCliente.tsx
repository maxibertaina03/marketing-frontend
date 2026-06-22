import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { Entrada } from '@/componentes/ui/campo';

interface Props {
  onSeleccionar: (cliente: { id: string; nombre: string }) => void;
}

/**
 * Selector de cliente con búsqueda por nombre. Reemplaza el viejo input de id.
 * Filtra en memoria (alcanza para muchos clientes); si no hay ninguno, guía a crearlos.
 */
export function SelectorCliente({ onSeleccionar }: Props) {
  const { data: clientes = [], isLoading } = useClientes();
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) || (c.rubro ?? '').toLowerCase().includes(q),
    );
  }, [clientes, busqueda]);

  if (isLoading) return <p className="text-sm text-slate-500">Cargando clientes…</p>;

  if (clientes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Todavía no tenés clientes. Creá uno en la sección{' '}
        <Link to="/clientes" className="text-marca hover:underline">
          Clientes
        </Link>{' '}
        y volvé.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Entrada
          className="pl-9"
          placeholder="Buscar cliente por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoFocus
        />
      </div>
      <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
        {filtrados.length === 0 ? (
          <p className="px-3 py-3 text-sm text-slate-500">Sin resultados para “{busqueda}”.</p>
        ) : (
          filtrados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSeleccionar({ id: c.id, nombre: c.nombre })}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{c.nombre}</span>
              {c.rubro && <span className="text-xs text-slate-400">{c.rubro}</span>}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
