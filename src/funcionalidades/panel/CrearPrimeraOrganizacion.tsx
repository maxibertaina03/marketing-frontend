import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { Users, Building2, ArrowLeft } from 'lucide-react';
import { useApi, useOrganizacion } from '@/contexto/contexto-organizacion';
import { Boton } from '@/componentes/ui/boton';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaDescripcion,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';

/**
 * Pantalla de bienvenida para quien todavía no pertenece a ninguna agencia.
 *
 * Distingue los dos caminos a propósito. Si a alguien lo invitaron, el backend
 * ya lo une al entrar (ver `aplicarInvitacionesPendientes` en el guard), así que
 * quien llega acá **no tiene invitación pendiente**. Empujarlo directo a "crear"
 * —como se hacía antes— es lo que hacía que un integrante de un equipo que ya usa
 * ContentOS se armara una agencia paralela vacía en vez de pedir que lo inviten.
 */
export function CrearPrimeraOrganizacion() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const [modo, setModo] = useState<'elegir' | 'crear'>('elegir');

  if (modo === 'crear') {
    return <FormularioCrear onVolver={() => setModo('elegir')} />;
  }

  return (
    <div className="grid place-items-center py-16">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Te damos la bienvenida a ContentOS</h1>
          <p className="mt-1 text-slate-500">¿Cómo querés empezar?</p>
        </div>

        {/* Camino 1: unirme a un equipo que ya usa ContentOS */}
        <Tarjeta className="p-6">
          <TarjetaCabecera className="flex flex-row items-start gap-3 p-0">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca/10">
              <Users className="h-5 w-5 text-marca" aria-hidden="true" />
            </span>
            <div>
              <TarjetaTitulo>Mi equipo ya usa ContentOS</TarjetaTitulo>
              <TarjetaDescripcion>
                Pedile a quien administra la agencia que te invite. En cuanto te sume, entrás
                automáticamente —no tenés que crear nada—.
              </TarjetaDescripcion>
            </div>
          </TarjetaCabecera>
          {email && (
            <TarjetaContenido className="p-0 pt-4">
              <p className="text-sm text-slate-600">
                Que te invite con este correo:{' '}
                <strong className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-800">
                  {email}
                </strong>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Tiene que ser este mismo, o la invitación no te va a llegar.
              </p>
            </TarjetaContenido>
          )}
        </Tarjeta>

        {/* Camino 2: soy quien arranca la agencia */}
        <Tarjeta className="p-6">
          <TarjetaCabecera className="flex flex-row items-start gap-3 p-0">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Building2 className="h-5 w-5 text-slate-600" aria-hidden="true" />
            </span>
            <div>
              <TarjetaTitulo>Soy quien arranca la agencia</TarjetaTitulo>
              <TarjetaDescripcion>
                Creá tu agencia y después invitá a tu equipo y a tus clientes.
              </TarjetaDescripcion>
            </div>
          </TarjetaCabecera>
          <TarjetaContenido className="p-0 pt-4">
            <Boton onClick={() => setModo('crear')}>Crear mi agencia</Boton>
          </TarjetaContenido>
        </Tarjeta>
      </div>
    </div>
  );
}

/** Paso de creación, una vez que la persona confirmó que es quien arranca. */
function FormularioCrear({ onVolver }: { onVolver: () => void }) {
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
          <button
            type="button"
            onClick={onVolver}
            className="mb-2 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </button>
          <TarjetaTitulo>Creá tu agencia</TarjetaTitulo>
          <TarjetaDescripcion>
            Vas a ser el administrador. Después sumás a tu equipo desde Equipo.
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
              {mutacion.isPending ? 'Creando…' : 'Crear agencia'}
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
