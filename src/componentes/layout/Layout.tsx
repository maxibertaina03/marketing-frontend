import { NavLink, Outlet } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { SECCIONES } from './secciones';
import { SelectorOrganizacion } from './SelectorOrganizacion';

/** Layout principal de la app autenticada: sidebar + barra superior + contenido. */
export function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="px-5 py-4 text-xl font-bold text-marca">ContentOS</div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {SECCIONES.map((seccion) => {
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
                    !seccion.disponible && 'opacity-50',
                  )
                }
              >
                <Icono className="h-4 w-4" />
                {seccion.etiqueta}
                {!seccion.disponible && (
                  <span className="ml-auto text-[10px] uppercase text-slate-400">pronto</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <SelectorOrganizacion />
          <UserButton />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
