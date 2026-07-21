import { RutaProtegida } from '@/componentes/RutaProtegida';
import { OrganizacionProvider } from '@/contexto/OrganizacionContext';
import { ClienteActivoProvider } from '@/contexto/ClienteActivoProvider';
import { Layout } from '@/componentes/layout/Layout';

export function AreaPrivada() {
  return (
    <RutaProtegida>
      <OrganizacionProvider>
        <ClienteActivoProvider>
          <Layout />
        </ClienteActivoProvider>
      </OrganizacionProvider>
    </RutaProtegida>
  );
}
