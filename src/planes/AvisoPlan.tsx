import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { Boton } from '@/componentes/ui/boton';
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta';
import { useRolActual } from '@/permisos/usePermisos';
import { usePlanActual } from './usePlan';
import { NOMBRE_FUNCIONALIDAD, PLANES, planMinimo, type FuncionalidadPlan } from './planes';

interface Props {
  funcionalidad: FuncionalidadPlan;
  /** Una línea sobre qué se pierde por no tenerla. Ayuda a que el aviso venda. */
  detalle?: string;
}

/**
 * Cartel que reemplaza a una pantalla cuando el plan de la agencia no la incluye.
 *
 * Va en lugar del contenido, no encima: mostrar la pantalla vacía o a medias
 * confunde más que bloquearla, y deja la sensación de que algo está roto.
 *
 * ```tsx
 * const { incluye } = usePlan();
 * if (!incluye('campanias')) {
 *   return <AvisoPlan funcionalidad="campanias" detalle="Planificá campañas completas con IA." />;
 * }
 * ```
 */
export function AvisoPlan({ funcionalidad, detalle }: Props) {
  const planActual = usePlanActual();
  const necesario = planMinimo(funcionalidad);
  const navegar = useNavigate();
  const rol = useRolActual();

  return (
    <Tarjeta className="mx-auto max-w-xl">
      <TarjetaContenido className="flex flex-col items-center gap-4 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marca/10">
          <Lock className="h-6 w-6 text-marca" aria-hidden="true" />
        </span>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">
            {NOMBRE_FUNCIONALIDAD[funcionalidad]} no está en tu plan
          </h2>
          <p className="text-sm text-slate-600">
            {detalle ?? 'Esta sección forma parte de los planes superiores.'}
          </p>
        </div>

        <p className="text-sm text-slate-500">
          {planActual && (
            <>
              Tu plan es <strong className="text-slate-700">{PLANES[planActual].nombre}</strong>.{' '}
            </>
          )}
          Disponible desde <strong className="text-slate-700">{PLANES[necesario].nombre}</strong> (
          {PLANES[necesario].precio}).
        </p>

        {/* Solo el ADMIN puede cambiar de plan: al resto se le dice a quién pedírselo
            en vez de darle un botón que lo rebota. */}
        {rol === 'ADMIN' ? (
          <Boton onClick={() => navegar('/planes')}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Mejorar mi plan
          </Boton>
        ) : (
          <p className="text-sm text-slate-500">
            Pedile a quien administra la agencia que mejore el plan.
          </p>
        )}
      </TarjetaContenido>
    </Tarjeta>
  );
}
