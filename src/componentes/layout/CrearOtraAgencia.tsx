import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle } from 'lucide-react';
import { useApi, useOrganizacion } from '@/contexto/contexto-organizacion';
import { Boton } from '@/componentes/ui/boton';

/**
 * Botón "+" junto al selector para crear **otra** agencia, con el aviso que evita
 * hacerlo sin querer: se recuerda que ya pertenecés a una y que los datos no se
 * comparten. Es el caso legítimo de manejar dos agencias distintas —pero sabiendo
 * que son separadas—, no el de fragmentar un equipo por error.
 */
export function CrearOtraAgencia() {
  const api = useApi();
  const { organizaciones, seleccionar } = useOrganizacion();
  const cliente = useQueryClient();
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const contenedor = useRef<HTMLDivElement>(null);

  const mutacion = useMutation({
    mutationFn: () => api.post<{ id: string }>('/organizaciones', { nombre }),
    onSuccess: async (org) => {
      await cliente.invalidateQueries({ queryKey: ['organizaciones-mias'] });
      seleccionar(org.id);
      setAbierto(false);
      setNombre('');
    },
  });

  useEffect(() => {
    if (!abierto) return;
    function alClic(e: MouseEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener('mousedown', alClic);
    return () => document.removeEventListener('mousedown', alClic);
  }, [abierto]);

  const nombreActual = organizaciones[0]?.nombre;

  return (
    <div className="relative" ref={contenedor}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        aria-label="Crear otra agencia"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>

      {abierto && (
        <div className="absolute left-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-start gap-2 rounded-md bg-amber-50 p-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-xs text-amber-800">
              Ya pertenecés a{' '}
              <strong>{nombreActual ? `"${nombreActual}"` : 'una agencia'}</strong>. Esta va a ser
              una agencia <strong>separada</strong>: no comparte marcas, equipo ni datos. Si querés
              sumar a alguien a la que ya tenés, invitalo desde Equipo.
            </p>
          </div>
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (nombre.trim()) mutacion.mutate();
            }}
          >
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Nombre de la nueva agencia"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
            />
            <Boton type="submit" tamano="sm" disabled={mutacion.isPending || !nombre.trim()}>
              {mutacion.isPending ? 'Creando…' : 'Crear agencia separada'}
            </Boton>
            {mutacion.isError && (
              <p className="text-xs text-red-600">No se pudo crear. Intentá de nuevo.</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
