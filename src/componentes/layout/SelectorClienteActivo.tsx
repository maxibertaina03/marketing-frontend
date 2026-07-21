import { Building2 } from 'lucide-react';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { useClienteActivo } from '@/contexto/contexto-cliente-activo';

export function SelectorClienteActivo() {
  const { data: clientes = [] } = useClientes();
  const { clienteActivoId, setClienteActivoId } = useClienteActivo();

  if (clientes.length === 0) return null;

  return (
    <div className="border-t border-slate-200 px-3 py-3">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        Marca activa
      </p>
      <div className="relative">
        <Building2 className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <select
          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-marca/40"
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
    </div>
  );
}
