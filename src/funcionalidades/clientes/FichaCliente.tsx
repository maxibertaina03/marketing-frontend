import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import { Boton } from '@/componentes/ui/boton';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { FormularioCliente } from './FormularioCliente';
import { ConexionMeta } from './ConexionMeta';
import { ETIQUETA_ESTADO, type Cliente, type DatosCliente } from './tipos';

/** Ficha de un cliente: edición de todos sus datos y eliminación. */
export function FichaCliente() {
  const { id = '' } = useParams();
  const api = useApi();
  const cliente = useQueryClient();
  const navegar = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => api.get<Cliente>(`/clientes/${id}`),
  });

  const guardar = useMutation({
    mutationFn: (datos: DatosCliente) => api.patch<Cliente>(`/clientes/${id}`, datos),
    onSuccess: async () => {
      await cliente.invalidateQueries({ queryKey: ['cliente', id] });
      await cliente.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const eliminar = useMutation({
    mutationFn: () => api.delete(`/clientes/${id}`),
    onSuccess: async () => {
      await cliente.invalidateQueries({ queryKey: ['clientes'] });
      navegar('/clientes');
    },
  });

  if (isLoading) return <p className="text-slate-500">Cargando…</p>;
  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">No se encontró el cliente.</p>
        <Link to="/clientes" className="text-marca hover:underline">
          ← Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/clientes" className="text-sm text-slate-500 hover:underline">
            ← Clientes
          </Link>
          <h1 className="text-2xl font-bold">{data.nombre}</h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${ETIQUETA_ESTADO[data.estado].clase}`}
          >
            {ETIQUETA_ESTADO[data.estado].texto}
          </span>
        </div>
        <Boton
          variante="peligro"
          tamano="sm"
          disabled={eliminar.isPending}
          onClick={() => {
            if (confirm(`¿Eliminar a "${data.nombre}"? Esta acción no se puede deshacer.`)) {
              eliminar.mutate();
            }
          }}
        >
          Eliminar
        </Boton>
      </div>

      <Tarjeta className="p-6">
        <FormularioCliente
          inicial={data}
          guardando={guardar.isPending}
          textoBoton="Guardar cambios"
          onGuardar={(datos) => guardar.mutate(datos)}
        />
        {guardar.isSuccess && !guardar.isPending && (
          <p className="mt-3 text-sm text-green-600">Cambios guardados.</p>
        )}
        {guardar.isError && (
          <p className="mt-3 text-sm text-red-600">No se pudieron guardar los cambios.</p>
        )}
      </Tarjeta>

      <ConexionMeta clienteId={id} />
    </div>
  );
}
