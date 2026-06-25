/** Tipos de tarea de producción (debe coincidir con el enum del backend). */
export const TIPOS_TAREA = [
  'REDACCION',
  'DISENO',
  'EDICION',
  'PROGRAMACION',
  'REVISION',
  'OTRO',
] as const;
export type TipoTarea = (typeof TIPOS_TAREA)[number];

export const ETIQUETA_TIPO_TAREA: Record<TipoTarea, string> = {
  REDACCION: 'Redacción',
  DISENO: 'Diseño',
  EDICION: 'Edición',
  PROGRAMACION: 'Programación',
  REVISION: 'Revisión',
  OTRO: 'Otro',
};

/** Estados de una tarea (columnas del tablero). El orden define el del tablero. */
export const ESTADOS_TAREA = ['PENDIENTE', 'EN_CURSO', 'BLOQUEADA', 'HECHA'] as const;
export type EstadoTarea = (typeof ESTADOS_TAREA)[number];

export const ETIQUETA_ESTADO_TAREA: Record<EstadoTarea, { texto: string; clase: string }> = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-slate-200 text-slate-700' },
  EN_CURSO: { texto: 'En curso', clase: 'bg-blue-100 text-blue-700' },
  BLOQUEADA: { texto: 'Bloqueada', clase: 'bg-red-100 text-red-700' },
  HECHA: { texto: 'Hecha', clase: 'bg-green-100 text-green-700' },
};

export interface AsignadoResumen {
  id: string;
  rol: string;
  usuario: { id: string; nombre: string | null; email: string };
}

export interface PublicacionResumen {
  id: string;
  titulo: string;
  estado: string;
}

/** Tarea tal como la devuelve el backend (con responsable y publicación incluidos). */
export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoTarea;
  estado: EstadoTarea;
  fechaLimite: string | null;
  publicacionId: string;
  publicacion: PublicacionResumen;
  asignadoId: string | null;
  asignado: AsignadoResumen | null;
  organizacionId: string;
  creadoEn: string;
  actualizadoEn: string;
}

/** Tablero: tareas agrupadas por estado (todas las columnas presentes). */
export type Tablero = Record<EstadoTarea, Tarea[]>;

export interface CrearTareaPayload {
  titulo: string;
  publicacionId: string;
  descripcion?: string;
  tipo?: TipoTarea;
  estado?: EstadoTarea;
  asignadoId?: string;
  fechaLimite?: string;
}

export type ActualizarTareaPayload = Partial<{
  titulo: string;
  descripcion: string;
  tipo: TipoTarea;
  estado: EstadoTarea;
  asignadoId: string | null;
  fechaLimite: string;
}>;
