import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import { Boton } from '@/componentes/ui/boton';
import { Entrada, Selector } from '@/componentes/ui/campo';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { usePermisos } from '@/permisos/usePermisos';
import { FormularioCliente } from './FormularioCliente';
import { ESTADOS_CLIENTE, ETIQUETA_ESTADO, type Cliente, type DatosCliente } from './tipos';

/** Listado de clientes de la organización, con filtros y alta. */
export function PaginaClientes() {
  const api = useApi();
  const cliente = useQueryClient();
  const { puedeEditar } = usePermisos();
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [creando, setCreando] = useState(false);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes', { estado, busqueda }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (estado) params.set('estado', estado);
      if (busqueda) params.set('busqueda', busqueda);
      const qs = params.toString();
      return api.get<Cliente[]>(`/clientes${qs ? `?${qs}` : ''}`);
    },
  });

  const alta = useMutation({
    mutationFn: (datos: DatosCliente) => api.post<Cliente>('/clientes', datos),
    onSuccess: async () => {
      await cliente.invalidateQueries({ queryKey: ['clientes'] });
      setCreando(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-slate-500">Las marcas que gestiona tu agencia.</p>
        </div>
        {puedeEditar('clientes') && (
          <Boton onClick={() => setCreando((v) => !v)} variante={creando ? 'secundario' : 'primario'}>
            {creando ? 'Cancelar' : 'Nuevo cliente'}
          </Boton>
        )}
      </div>

      {creando && puedeEditar('clientes') && (
        <Tarjeta className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Nuevo cliente</h2>
          <FormularioCliente
            guardando={alta.isPending}
            textoBoton="Crear cliente"
            onGuardar={(datos) => alta.mutate(datos)}
          />
          {alta.isError && (
            <p className="mt-3 text-sm text-red-600">No se pudo crear el cliente.</p>
          )}
        </Tarjeta>
      )}

      <div className="flex flex-wrap gap-3">
        <Entrada
          className="max-w-xs"
          placeholder="Buscar por nombre o rubro…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Selector
          className="max-w-[12rem]"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_CLIENTE.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e].texto}
            </option>
          ))}
        </Selector>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : clientes.length === 0 ? (
        <Tarjeta className="grid place-items-center py-16 text-center text-slate-500">
          <p>No hay clientes todavía. Creá el primero con “Nuevo cliente”.</p>
        </Tarjeta>
      ) : (
        <Tarjeta className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Rubro</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{c.rubro ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${ETIQUETA_ESTADO[c.estado].clase}`}
                    >
                      {ETIQUETA_ESTADO[c.estado].texto}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/clientes/${c.id}`} className="text-marca hover:underline">
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      )}
    </div>
  );
}
