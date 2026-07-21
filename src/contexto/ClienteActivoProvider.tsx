import { useEffect, useState, type ReactNode } from 'react';
import { useClientes } from '@/funcionalidades/clientes/hooks';
import { CLAVE_CLIENTE, ContextoClienteActivo } from './contexto-cliente-activo';

/**
 * Provee la marca (cliente) activa a toda la app, persistida en localStorage.
 *
 * El reseteo al cambiar de organización se resuelve validando que la marca
 * guardada exista en la lista de clientes de la organización actual: si no está
 * (cambiaste de org o la borraron), vuelve a "Todas las marcas". Hacerlo con un
 * efecto sobre `organizacionId` rompía la persistencia, porque ese efecto también
 * corre en el montaje y borraba lo guardado en cada carga de página.
 */
export function ClienteActivoProvider({ children }: { children: ReactNode }) {
  const { data: clientes = [], isLoading } = useClientes();
  const [clienteActivoId, setClienteActivoIdState] = useState<string>(
    () => localStorage.getItem(CLAVE_CLIENTE) ?? '',
  );

  useEffect(() => {
    if (isLoading || !clienteActivoId) return;
    if (!clientes.some((c) => c.id === clienteActivoId)) {
      localStorage.removeItem(CLAVE_CLIENTE);
      setClienteActivoIdState('');
    }
  }, [clientes, clienteActivoId, isLoading]);

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
