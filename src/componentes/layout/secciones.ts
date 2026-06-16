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
  UserCog,
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
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users, disponible: false },
  { ruta: '/estrategia', etiqueta: 'Estrategia de marca', icono: Target, disponible: false },
  { ruta: '/calendario', etiqueta: 'Calendario', icono: CalendarDays, disponible: false },
  { ruta: '/ia', etiqueta: 'Centro de IA', icono: Sparkles, disponible: false },
  { ruta: '/ideas', etiqueta: 'Banco de ideas', icono: Lightbulb, disponible: false },
  { ruta: '/biblioteca-copys', etiqueta: 'Biblioteca de copys', icono: FileText, disponible: false },
  { ruta: '/campanias', etiqueta: 'Campañas', icono: Megaphone, disponible: false },
  { ruta: '/aprobaciones', etiqueta: 'Aprobaciones', icono: CheckCircle2, disponible: false },
  { ruta: '/archivos', etiqueta: 'Archivos', icono: FolderOpen, disponible: false },
  { ruta: '/metricas', etiqueta: 'Métricas', icono: BarChart3, disponible: false },
  { ruta: '/equipo', etiqueta: 'Equipo', icono: UserCog, disponible: false },
];
