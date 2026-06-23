import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { crearClienteApi } from '@/lib/clienteApi';
import {
  CLAVE_LOCAL,
  ContextoOrganizacion,
  type OrganizacionDelUsuario,
  type ValorContextoOrganizacion,
} from './contexto-organizacion';

/**
 * Provee el cliente de API (con token de Clerk + header de organización) y la
 * organización activa a toda la app. Resuelve el problema circular: el cliente
 * lee el id de organización desde un ref que este provider mantiene actualizado.
 */
export function OrganizacionProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [organizacionId, setOrganizacionId] = useState<string | null>(() =>
    localStorage.getItem(CLAVE_LOCAL),
  );
  const idRef = useRef(organizacionId);
  idRef.current = organizacionId;

  // El backend gratuito se duerme; mostramos un aviso mientras despierta.
  const [despertando, setDespertando] = useState(false);

  const api = useMemo(
    () =>
      crearClienteApi({
        obtenerToken: () => getToken(),
        obtenerOrganizacionId: () => idRef.current,
        onDespertando: setDespertando,
      }),
    [getToken],
  );

  const { data: organizaciones = [], isLoading } = useQuery({
    queryKey: ['organizaciones-mias'],
    queryFn: () => api.get<OrganizacionDelUsuario[]>('/organizaciones/mias'),
  });

  function seleccionar(id: string) {
    localStorage.setItem(CLAVE_LOCAL, id);
    setOrganizacionId(id);
  }

  // Si no hay organización elegida y el usuario tiene al menos una, elegir la primera.
  useEffect(() => {
    if (!organizacionId && organizaciones.length > 0) {
      seleccionar(organizaciones[0].organizacionId);
    }
  }, [organizaciones, organizacionId]);

  const valor: ValorContextoOrganizacion = {
    api,
    organizaciones,
    organizacionId,
    seleccionar,
    cargando: isLoading,
  };

  return (
    <ContextoOrganizacion.Provider value={valor}>
      {despertando && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white shadow">
          <span className="size-3 animate-ping rounded-full bg-white/80" />
          Despertando el servidor… puede tardar ~50&nbsp;s (el plan gratuito se suspende por
          inactividad).
        </div>
      )}
      {children}
    </ContextoOrganizacion.Provider>
  );
}
