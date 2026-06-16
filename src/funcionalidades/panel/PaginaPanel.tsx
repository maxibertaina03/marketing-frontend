import { useQuery } from '@tanstack/react-query';
import { useApi, useOrganizacion } from '@/contexto/contexto-organizacion';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaDescripcion,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';
import { CrearPrimeraOrganizacion } from './CrearPrimeraOrganizacion';

interface RespuestaSalud {
  estado: string;
  baseDeDatos: string;
}

interface Miembro {
  membresiaId: string;
  email: string;
  nombre: string | null;
  rol: string;
}

/** Panel general (dashboard). En Fase 0 muestra estado del sistema y datos de la organización. */
export function PaginaPanel() {
  const api = useApi();
  const { organizaciones, organizacionId, cargando } = useOrganizacion();

  const { data: salud } = useQuery({
    queryKey: ['salud'],
    queryFn: () => api.get<RespuestaSalud>('/salud'),
  });

  const { data: miembros } = useQuery({
    queryKey: ['membresias', organizacionId],
    queryFn: () => api.get<Miembro[]>('/membresias'),
    enabled: !!organizacionId,
  });

  if (cargando) {
    return <p className="text-slate-500">Cargando…</p>;
  }

  if (organizaciones.length === 0) {
    return <CrearPrimeraOrganizacion />;
  }

  const orgActual = organizaciones.find((o) => o.organizacionId === organizacionId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel</h1>
        <p className="text-slate-500">Resumen general de tu organización.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tarjeta>
          <TarjetaCabecera>
            <TarjetaTitulo>Organización</TarjetaTitulo>
            <TarjetaDescripcion>Tu agencia activa</TarjetaDescripcion>
          </TarjetaCabecera>
          <TarjetaContenido>
            <p className="text-lg font-semibold">{orgActual?.nombre ?? '—'}</p>
            <p className="text-sm text-slate-500">Tu rol: {orgActual?.rol ?? '—'}</p>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaCabecera>
            <TarjetaTitulo>Equipo</TarjetaTitulo>
            <TarjetaDescripcion>Miembros de la organización</TarjetaDescripcion>
          </TarjetaCabecera>
          <TarjetaContenido>
            <p className="text-3xl font-bold">{miembros?.length ?? '—'}</p>
          </TarjetaContenido>
        </Tarjeta>

        <Tarjeta>
          <TarjetaCabecera>
            <TarjetaTitulo>Estado del sistema</TarjetaTitulo>
            <TarjetaDescripcion>Backend y base de datos</TarjetaDescripcion>
          </TarjetaCabecera>
          <TarjetaContenido>
            <p className="text-sm">
              API:{' '}
              <span className={salud?.estado === 'ok' ? 'text-green-600' : 'text-red-600'}>
                {salud?.estado ?? '—'}
              </span>
            </p>
            <p className="text-sm">
              Base de datos:{' '}
              <span className={salud?.baseDeDatos === 'ok' ? 'text-green-600' : 'text-red-600'}>
                {salud?.baseDeDatos ?? '—'}
              </span>
            </p>
          </TarjetaContenido>
        </Tarjeta>
      </div>
    </div>
  );
}
