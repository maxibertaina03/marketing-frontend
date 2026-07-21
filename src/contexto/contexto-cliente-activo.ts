import { createContext, useContext } from 'react';

export const CLAVE_CLIENTE = 'contentos.clienteActivoId';

export interface ValorContextoClienteActivo {
  clienteActivoId: string;
  setClienteActivoId: (id: string) => void;
}

export const ContextoClienteActivo = createContext<ValorContextoClienteActivo | null>(null);

export function useClienteActivo(): ValorContextoClienteActivo {
  const ctx = useContext(ContextoClienteActivo);
  if (!ctx) throw new Error('useClienteActivo debe usarse dentro de <ClienteActivoProvider>.');
  return ctx;
}
