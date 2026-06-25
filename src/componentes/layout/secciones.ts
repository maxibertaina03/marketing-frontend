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
  type LucideIcon,
} from 'lucide-react';

export interface SeccionMenu {
  ruta: string;
  etiqueta: string;
  icono: LucideIcon;
  /** Si todavía no está implementada, se muestra como "próximamente". */
  disponible: boolean;
}

/**
 * Secciones del producto (mapa del PDF). En Fase 0 solo "Panel" está disponible;
 * el resto se irá habilitando por fase. El sidebar las muestra todas para dar
 * contexto del alcance del producto.
 */
export const SECCIONES: SeccionMenu[] = [
  { ruta: '/panel', etiqueta: 'Panel', icono: LayoutDashboard, disponible: true },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users, disponible: true },
  { ruta: '/estrategia', etiqueta: 'Estrategia de marca', icono: Target, disponible: true },
  { ruta: '/calendario', etiqueta: 'Calendario', icono: CalendarDays, disponible: true },
  { ruta: '/ia', etiqueta: 'Centro de IA', icono: Sparkles, disponible: true },
  { ruta: '/ideas', etiqueta: 'Banco de ideas', icono: Lightbulb, disponible: true },
  { ruta: '/biblioteca-copys', etiqueta: 'Biblioteca de copys', icono: FileText, disponible: false },
  { ruta: '/campanias', etiqueta: 'Campañas', icono: Megaphone, disponible: true },
  { ruta: '/produccion', etiqueta: 'Producción', icono: ClipboardList, disponible: true },
  { ruta: '/aprobaciones', etiqueta: 'Aprobaciones', icono: CheckCircle2, disponible: true },
  { ruta: '/archivos', etiqueta: 'Archivos', icono: FolderOpen, disponible: true },
  { ruta: '/portal-cliente', etiqueta: 'Portal del cliente', icono: Store, disponible: true },
  { ruta: '/metricas', etiqueta: 'Métricas', icono: BarChart3, disponible: true },
  { ruta: '/ia-metricas', etiqueta: 'IA de Métricas', icono: BrainCircuit, disponible: true },
  { ruta: '/informes', etiqueta: 'Informes', icono: FileText, disponible: true },
  { ruta: '/equipo', etiqueta: 'Equipo', icono: UserCog, disponible: true },
];
