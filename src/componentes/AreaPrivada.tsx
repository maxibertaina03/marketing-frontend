import { RutaProtegida } from '@/componentes/RutaProtegida';
import { OrganizacionProvider } from '@/contexto/OrganizacionContext';
import { Layout } from '@/componentes/layout/Layout';

/**
 * Envuelve el área autenticada: exige sesión (RutaProtegida) y provee el
 * contexto de organización + cliente de API a todo lo que cuelga del Layout.
 */
export function AreaPrivada() {
  return (
    <RutaProtegida>
      <OrganizacionProvider>
        <Layout />
      </OrganizacionProvider>
    </RutaProtegida>
  );
}
