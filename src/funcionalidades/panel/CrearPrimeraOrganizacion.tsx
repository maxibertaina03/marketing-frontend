import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi, useOrganizacion } from '@/contexto/contexto-organizacion';
import { Boton } from '@/componentes/ui/boton';
import { Tarjeta, TarjetaCabecera, TarjetaTitulo, TarjetaDescripcion, TarjetaContenido } from '@/componentes/ui/tarjeta';

/** Formulario para crear la primera organización cuando el usuario no tiene ninguna. */
export function CrearPrimeraOrganizacion() {
  const api = useApi();
  const { seleccionar } = useOrganizacion();
  const cliente = useQueryClient();
  const [nombre, setNombre] = useState('');

  const mutacion = useMutation({
    mutationFn: () => api.post<{ id: string }>('/organizaciones', { nombre }),
    onSuccess: async (org) => {
      await cliente.invalidateQueries({ queryKey: ['organizaciones-mias'] });
      seleccionar(org.id);
    },
  });

  return (
    <div className="grid place-items-center py-16">
      <Tarjeta className="w-full max-w-md">
        <TarjetaCabecera>
          <TarjetaTitulo>Creá tu agencia</TarjetaTitulo>
          <TarjetaDescripcion>
            Todavía no pertenecés a ninguna organización. Creá una para empezar.
          </TarjetaDescripcion>
        </TarjetaCabecera>
        <TarjetaContenido>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (nombre.trim()) mutacion.mutate();
            }}
          >
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Nombre de la agencia"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <Boton type="submit" disabled={mutacion.isPending}>
              {mutacion.isPending ? 'Creando…' : 'Crear organización'}
            </Boton>
            {mutacion.isError && (
              <p className="text-sm text-red-600">No se pudo crear. Intentá de nuevo.</p>
            )}
          </form>
        </TarjetaContenido>
      </Tarjeta>
    </div>
  );
}
