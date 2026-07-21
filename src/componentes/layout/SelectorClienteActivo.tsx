import { Building2 } from 'lucide-react';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { useClienteActivo } from '@/contexto/contexto-cliente-activo';

/**
 * Selector de la marca activa, en la barra superior (junto al de organización).
 * Con una marca elegida, todas las secciones filtran por ella; "Todas las marcas"
 * deja ver todo.
 */
export function SelectorClienteActivo() {
  const { data: clientes = [] } = useClientes();
  const { clienteActivoId, setClienteActivoId } = useClienteActivo();

  if (clientes.length === 0) return null;

  return (
    <div className="relative">
      <Building2 className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <select
        aria-label="Marca activa"
        className="rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-marca/40"
        value={clienteActivoId}
        onChange={(e) => setClienteActivoId(e.target.value)}
      >
        <option value="">Todas las marcas</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
