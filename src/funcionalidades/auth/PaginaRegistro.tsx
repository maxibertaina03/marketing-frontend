import { SignUp } from '@clerk/clerk-react';

/** Pantalla de registro (usa el componente de Clerk). */
export function PaginaRegistro() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-marca">ContentOS</h1>
        <SignUp signInUrl="/login" forceRedirectUrl="/panel" />
      </div>
    </div>
  );
}
