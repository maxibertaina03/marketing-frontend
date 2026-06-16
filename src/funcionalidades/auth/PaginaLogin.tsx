import { SignIn } from '@clerk/clerk-react';

/** Pantalla de inicio de sesión (usa el componente de Clerk). */
export function PaginaLogin() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-marca">ContentOS</h1>
        <SignIn signUpUrl="/registro" forceRedirectUrl="/panel" />
      </div>
    </div>
  );
}
