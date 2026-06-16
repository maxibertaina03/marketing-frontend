import type { ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

/**
 * Protege rutas: si no hay sesión de Clerk, redirige a /login.
 * Mientras Clerk carga, muestra un estado neutro.
 */
export function RutaProtegida({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Cargando…</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
