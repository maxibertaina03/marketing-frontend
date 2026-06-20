/** Estados comerciales de un cliente (debe coincidir con el enum del backend). */
export const ESTADOS_CLIENTE = ['POTENCIAL', 'ACTIVO', 'PAUSADO', 'ARCHIVADO'] as const;
export type EstadoCliente = (typeof ESTADOS_CLIENTE)[number];

/** Etiquetas legibles y color del badge por estado. */
export const ETIQUETA_ESTADO: Record<EstadoCliente, { texto: string; clase: string }> = {
  POTENCIAL: { texto: 'Potencial', clase: 'bg-amber-100 text-amber-700' },
  ACTIVO: { texto: 'Activo', clase: 'bg-green-100 text-green-700' },
  PAUSADO: { texto: 'Pausado', clase: 'bg-slate-200 text-slate-600' },
  ARCHIVADO: { texto: 'Archivado', clase: 'bg-slate-100 text-slate-400' },
};

/** Cliente (la marca) tal como lo devuelve el backend. */
export interface Cliente {
  id: string;
  nombre: string;
  rubro: string | null;
  ubicacion: string | null;
  sitioWeb: string | null;
  contactoNombre: string | null;
  contactoEmail: string | null;
  contactoTelefono: string | null;
  redes: Record<string, string> | null;
  logoUrl: string | null;
  paletaColores: string[];
  tono: string | null;
  publicoObjetivo: string | null;
  productosServicios: string | null;
  objetivos: string | null;
  competencia: string | null;
  promociones: string | null;
  estado: EstadoCliente;
  creadoEn: string;
  actualizadoEn: string;
}

/** Datos que se envían al crear/actualizar un cliente. */
export type DatosCliente = Partial<Omit<Cliente, 'id' | 'creadoEn' | 'actualizadoEn'>> & {
  nombre: string;
};
