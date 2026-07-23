import { useOrganizacion } from '@/contexto/contexto-organizacion';
import { planIncluye, type FuncionalidadPlan, type Plan } from './planes';

/** Plan de la organización activa (undefined si aún no cargó / sin organización). */
export function usePlanActual(): Plan | undefined {
  const { organizaciones, organizacionId } = useOrganizacion();
  return organizaciones.find((o) => o.organizacionId === organizacionId)?.plan;
}

/**
 * Plan de la organización activa y si incluye una funcionalidad.
 *
 * Se lee del contexto que ya trae `GET /organizaciones/mias`: no agrega ninguna
 * petición. Mismo patrón que `usePermisos()`.
 *
 * ```tsx
 * const { incluye } = usePlan();
 * if (!incluye('campanias')) return <AvisoPlan funcionalidad="campanias" />;
 * ```
 */
export function usePlan() {
  const plan = usePlanActual();
  const { organizaciones, organizacionId } = useOrganizacion();
  const activa = organizaciones.find((o) => o.organizacionId === organizacionId);

  return {
    plan,
    planExpiraEn: activa?.planExpiraEn ?? null,
    incluye: (funcionalidad: FuncionalidadPlan) => planIncluye(plan, funcionalidad),
  };
}
