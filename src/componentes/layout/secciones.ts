import {
  LayoutDashboard,
  Users,
  Target,
  CalendarDays,
  Sparkles,
  Lightbulb,
  FileText,
  Megaphone,
  BarChart3,
  CheckCircle2,
  FolderOpen,
  ClipboardList,
  UserCog,
  Store,
  BrainCircuit,
  Settings,
  PenLine,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

/** Roles posibles (debe coincidir con el enum Rol del backend). */
export type Rol =
  | 'ADMIN'
  | 'COMMUNITY_MANAGER'
  | 'DISENADOR'
  | 'COPYWRITER'
  | 'ANALISTA'
  | 'CLIENTE';

/** Todos los roles internos de la agencia (todos menos el cliente final). */
const INTERNOS: Rol[] = ['ADMIN', 'COMMUNITY_MANAGER', 'DISENADOR', 'COPYWRITER', 'ANALISTA'];
const GESTORES: Rol[] = ['ADMIN', 'COMMUNITY_MANAGER'];
const ANALITICA: Rol[] = ['ADMIN', 'COMMUNITY_MANAGER', 'ANALISTA'];

export interface SeccionMenu {
  ruta: string;
  etiqueta: string;
  icono: LucideIcon;
  disponible: boolean;
  /** Roles que pueden ver/usar esta sección. */
  roles: Rol[];
}

/**
 * Secciones del producto. Cada una declara qué roles la ven: el sidebar se filtra
 * por el rol del usuario en la organización activa, y las rutas se protegen igual.
 * El CLIENTE solo ve su portal; los roles internos ven lo que les corresponde.
 */
export const SECCIONES: SeccionMenu[] = [
  { ruta: '/panel', etiqueta: 'Panel', icono: LayoutDashboard, disponible: true, roles: INTERNOS },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users, disponible: true, roles: INTERNOS },
  { ruta: '/estrategia', etiqueta: 'Estrategia de marca', icono: Target, disponible: true, roles: INTERNOS },
  { ruta: '/calendario', etiqueta: 'Calendario', icono: CalendarDays, disponible: true, roles: INTERNOS },
  { ruta: '/ia', etiqueta: 'IA Estratégica', icono: Sparkles, disponible: true, roles: GESTORES },
  {
    ruta: '/ia-contenido',
    etiqueta: 'IA de Contenido',
    icono: PenLine,
    disponible: true,
    roles: ['ADMIN', 'COMMUNITY_MANAGER', 'COPYWRITER'],
  },
  { ruta: '/ideas', etiqueta: 'Banco de ideas', icono: Lightbulb, disponible: true, roles: INTERNOS },
  { ruta: '/biblioteca-copys', etiqueta: 'Biblioteca de copys', icono: FileText, disponible: true, roles: INTERNOS },
  { ruta: '/campanias', etiqueta: 'Campañas', icono: Megaphone, disponible: true, roles: GESTORES },
  { ruta: '/produccion', etiqueta: 'Producción', icono: ClipboardList, disponible: true, roles: ['ADMIN', 'COMMUNITY_MANAGER', 'DISENADOR', 'COPYWRITER'] },
  { ruta: '/aprobaciones', etiqueta: 'Aprobaciones', icono: CheckCircle2, disponible: true, roles: GESTORES },
  { ruta: '/archivos', etiqueta: 'Archivos', icono: FolderOpen, disponible: true, roles: ['ADMIN', 'COMMUNITY_MANAGER', 'DISENADOR'] },
  { ruta: '/portal-cliente', etiqueta: 'Portal del cliente', icono: Store, disponible: true, roles: ['CLIENTE'] },
  { ruta: '/metricas', etiqueta: 'Métricas', icono: BarChart3, disponible: true, roles: ANALITICA },
  { ruta: '/ia-metricas', etiqueta: 'IA de Métricas', icono: BrainCircuit, disponible: true, roles: ANALITICA },
  { ruta: '/informes', etiqueta: 'Informes', icono: FileText, disponible: true, roles: ANALITICA },
  { ruta: '/equipo', etiqueta: 'Equipo', icono: UserCog, disponible: true, roles: INTERNOS },
  { ruta: '/configuracion', etiqueta: 'Configuración', icono: Settings, disponible: true, roles: GESTORES },
  { ruta: '/planes', etiqueta: 'Planes', icono: CreditCard, disponible: true, roles: ['ADMIN'] },
];

/** Secciones visibles para un rol (vacío si el rol es desconocido). */
export function seccionesParaRol(rol?: string): SeccionMenu[] {
  if (!rol) return [];
  return SECCIONES.filter((s) => s.roles.includes(rol as Rol));
}

/** Ruta de inicio según el rol: el cliente arranca en su portal, el resto en el panel. */
export function rutaInicialPorRol(rol?: string): string {
  return rol === 'CLIENTE' ? '/portal-cliente' : '/panel';
}

/** Indica si un rol puede ver una ruta (para proteger la navegación directa por URL). */
export function rolPuedeVerRuta(rol: string | undefined, pathname: string): boolean {
  if (!rol) return true; // sin rol resuelto todavía (cargando / sin organización) → no bloquear
  const seccion = SECCIONES.find((s) => pathname === s.ruta || pathname.startsWith(`${s.ruta}/`));
  if (!seccion) return true; // rutas sin sección (ej. "/") → no bloquear
  return seccion.roles.includes(rol as Rol);
}
