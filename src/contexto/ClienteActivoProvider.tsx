import { useEffect, useState, type ReactNode } from 'react';
import { CLAVE_CLIENTE, ContextoClienteActivo } from './contexto-cliente-activo';
import { useOrganizacion } from './contexto-organizacion';

export function ClienteActivoProvider({ children }: { children: ReactNode }) {
  const { organizacionId } = useOrganizacion();
  const [clienteActivoId, setClienteActivoIdState] = useState<string>(() =>
    localStorage.getItem(CLAVE_CLIENTE) ?? '',
  );

  useEffect(() => {
    setClienteActivoIdState('');
    localStorage.removeItem(CLAVE_CLIENTE);
  }, [organizacionId]);

  function setClienteActivoId(id: string) {
    if (id) {
      localStorage.setItem(CLAVE_CLIENTE, id);
    } else {
      localStorage.removeItem(CLAVE_CLIENTE);
    }
    setClienteActivoIdState(id);
  }

  return (
    <ContextoClienteActivo.Provider value={{ clienteActivoId, setClienteActivoId }}>
      {children}
    </ContextoClienteActivo.Provider>
  );
}
