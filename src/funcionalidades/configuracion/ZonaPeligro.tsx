import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta';
import { useOrganizacion } from '@/contexto/contexto-organizacion';
import { useRolActual } from '@/permisos/usePermisos';
import { useSalirOrganizacion } from '@/funcionalidades/panel/hooks';

/**
 * Permite sacarse de encima una agencia **vacía** (sin marcas) desde la app —el
 * caso de la agencia paralela creada por error, que antes había que borrar a mano
 * en la base—. Si sos el único miembro se elimina; si quedan otros, la abandonás.
 *
 * Solo aparece para el ADMIN de una agencia vacía: con marcas cargadas no se
 * muestra, para no invitar a borrar trabajo real de un clic.
 */
export function ZonaPeligro() {
  const rol = useRolActual();
  const { organizaciones, organizacionId } = useOrganizacion();
  const salir = useSalirOrganizacion();
  const [confirmando, setConfirmando] = useState(false);

  const activa = organizaciones.find((o) => o.organizacionId === organizacionId);
  if (!activa || rol !== 'ADMIN' || !activa.vacia) return null;

  const eliminar = activa.soyUnicoMiembro;
  const accion = eliminar ? 'Eliminar' : 'Abandonar';

  return (
    <Tarjeta className="border-red-200 p-6">
      <TarjetaContenido className="p-0">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900">{accion} esta agencia</h3>
              <p className="text-sm text-slate-600">
                {eliminar
                  ? 'Esta agencia no tiene marcas y sos su único miembro. Podés eliminarla; es una acción definitiva.'
                  : 'Esta agencia no tiene marcas. Podés abandonarla y dejar de verla.'}
              </p>
            </div>

            {!confirmando ? (
              <Boton variante="secundario" onClick={() => setConfirmando(true)}>
                {accion} agencia
              </Boton>
            ) : (
              <div className="space-y-2 rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">
                  ¿Seguro? {eliminar ? 'La agencia se elimina para siempre.' : 'Vas a dejar de verla.'}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => activa && salir.mutate(activa.organizacionId)}
                    disabled={salir.isPending}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {salir.isPending ? 'Procesando…' : `Sí, ${accion.toLowerCase()}`}
                  </button>
                  <Boton
                    variante="secundario"
                    tamano="sm"
                    onClick={() => setConfirmando(false)}
                    disabled={salir.isPending}
                  >
                    Cancelar
                  </Boton>
                </div>
                {salir.isError && (
                  <p className="text-sm text-red-600">
                    No se pudo completar. Puede que la agencia ya no esté vacía.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </TarjetaContenido>
    </Tarjeta>
  );
}
