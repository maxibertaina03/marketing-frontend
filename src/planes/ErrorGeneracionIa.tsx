import { useNavigate } from 'react-router-dom';
import { Boton } from '@/componentes/ui/boton';
import { useRolActual } from '@/permisos/usePermisos';
import { ErrorApi } from '@/lib/clienteApi';

interface Props {
  error: unknown;
  /** Mensaje para cualquier otro error que no sea la cuota agotada. */
  fallback?: string;
}

/**
 * Muestra el error de un botón de IA. Distingue el caso "se agotó la cuota"
 * (403 con código de cuota) del resto, porque ese tiene una salida —mejorar el
 * plan— y el genérico ("revisá la estrategia") lo escondería.
 */
export function ErrorGeneracionIa({ error, fallback }: Props) {
  const navegar = useNavigate();
  const rol = useRolActual();

  const esCuota =
    error instanceof ErrorApi &&
    error.estado === 403 &&
    /cuota|límite|limite/i.test(error.message);

  if (!esCuota) {
    return (
      <p className="mt-2 text-sm text-red-600">
        {fallback ?? 'No se pudo generar. Probá de nuevo en un momento.'}
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
      <p className="text-sm text-amber-800">
        {error instanceof ErrorApi ? error.message : 'Se agotó la cuota de IA del mes.'}
      </p>
      {rol === 'ADMIN' && (
        <Boton tamano="sm" onClick={() => navegar('/planes')}>
          Mejorar mi plan
        </Boton>
      )}
    </div>
  );
}
