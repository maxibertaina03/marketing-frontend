import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { useOrganizacion } from '@/contexto/contexto-organizacion';
import { seccionesParaRol, rolPuedeVerRuta, rutaInicialPorRol } from './secciones';
import { SelectorOrganizacion } from './SelectorOrganizacion';
import { SelectorClienteActivo } from './SelectorClienteActivo';

/** Layout principal de la app autenticada: sidebar (filtrado por rol) + contenido. */
export function Layout() {
  const { organizaciones, organizacionId } = useOrganizacion();
  const location = useLocation();

  // Rol del usuario en la organización activa (undefined si todavía no cargó / sin organización).
  const rol = organizaciones.find((o) => o.organizacionId === organizacionId)?.rol;
  const secciones = seccionesParaRol(rol);

  // Si entra por URL a una ruta que su rol no puede ver, lo mandamos a su inicio.
  const bloqueado = !rolPuedeVerRuta(rol, location.pathname);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-4 text-xl font-bold text-marca">ContentOS</div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {secciones.map((seccion) => {
            const Icono = seccion.icono;
            return (
              <NavLink
                key={seccion.ruta}
                to={seccion.ruta}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-marca/10 text-marca'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                <Icono className="h-4 w-4" />
                {seccion.etiqueta}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <SelectorOrganizacion />
            <SelectorClienteActivo />
          </div>
          <UserButton />
        </header>
        <main className="flex-1 overflow-auto p-6">
          {bloqueado ? <Navigate to={rutaInicialPorRol(rol)} replace /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
