/** Planes comerciales (debe coincidir con el enum PlanSuscripcion del backend). */
export type Plan = 'PRUEBA' | 'STARTER' | 'AGENCY' | 'AGENCY_PRO' | 'ENTERPRISE';

/**
 * Funcionalidades que **no** están en todos los planes. Lo que no figura acá
 * (calendario, clientes, IA de contenido, banco de ideas, aprobaciones, métricas)
 * viene en todos, incluido Starter.
 */
export type FuncionalidadPlan =
  | 'ia-estrategica'
  | 'campanias'
  | 'informes'
  | 'produccion'
  | 'roles'
  | 'automatizaciones';

/** La prueba gratuita es Agency completo, así que se comporta como Agency. */
const DESDE_AGENCY: Plan[] = ['PRUEBA', 'AGENCY', 'AGENCY_PRO', 'ENTERPRISE'];

/**
 * Qué planes incluyen cada funcionalidad. Es el espejo de `permisos.ts`: el rol
 * dice *quién* puede, el plan dice *qué contrató la agencia*. Las dos condiciones
 * se cumplen por separado.
 */
export const INCLUYE: Record<FuncionalidadPlan, Plan[]> = {
  'ia-estrategica': DESDE_AGENCY,
  campanias: DESDE_AGENCY,
  informes: DESDE_AGENCY,
  produccion: DESDE_AGENCY,
  roles: DESDE_AGENCY,
  automatizaciones: DESDE_AGENCY,
};

/** Datos de cada plan, para los mensajes de "mejorá tu plan" y la página de planes. */
export const PLANES: Record<Plan, { nombre: string; precio: string }> = {
  PRUEBA: { nombre: 'Prueba gratuita', precio: '14 días' },
  STARTER: { nombre: 'Starter', precio: 'US$29/mes' },
  AGENCY: { nombre: 'Agency', precio: 'US$79/mes' },
  AGENCY_PRO: { nombre: 'Agency Pro', precio: 'US$149/mes' },
  ENTERPRISE: { nombre: 'Enterprise', precio: 'a medida' },
};

/** Nombre que se le muestra a la persona para cada funcionalidad bloqueada. */
export const NOMBRE_FUNCIONALIDAD: Record<FuncionalidadPlan, string> = {
  'ia-estrategica': 'IA Estratégica',
  campanias: 'Campañas',
  informes: 'Informes mensuales',
  produccion: 'Producción y tareas',
  roles: 'Roles y permisos',
  automatizaciones: 'Automatizaciones',
};

/** Plan más barato que incluye la funcionalidad (para decir "disponible desde…"). */
export function planMinimo(funcionalidad: FuncionalidadPlan): Plan {
  // El orden importa: se recorre de menor a mayor y se devuelve el primero que la trae.
  const ORDEN: Plan[] = ['STARTER', 'AGENCY', 'AGENCY_PRO', 'ENTERPRISE'];
  return ORDEN.find((p) => INCLUYE[funcionalidad].includes(p)) ?? 'AGENCY';
}

/** Indica si el plan de la organización incluye una funcionalidad. */
export function planIncluye(plan: Plan | undefined, funcionalidad: FuncionalidadPlan): boolean {
  // Sin plan resuelto todavía (cargando) no se bloquea: evita el parpadeo del
  // cartel de "mejorá tu plan" en cada carga.
  if (!plan) return true;
  return INCLUYE[funcionalidad].includes(plan);
}
