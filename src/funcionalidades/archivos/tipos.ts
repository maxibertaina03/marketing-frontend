/** Tipos de archivo (debe coincidir con el enum del backend). */
export const TIPOS_ARCHIVO = ['IMAGEN', 'VIDEO', 'DOCUMENTO', 'AUDIO', 'OTRO'] as const;
export type TipoArchivo = (typeof TIPOS_ARCHIVO)[number];

export const ETIQUETA_TIPO_ARCHIVO: Record<TipoArchivo, { texto: string; clase: string }> = {
  IMAGEN: { texto: 'Imagen', clase: 'bg-purple-100 text-purple-700' },
  VIDEO: { texto: 'Video', clase: 'bg-blue-100 text-blue-700' },
  DOCUMENTO: { texto: 'Documento', clase: 'bg-amber-100 text-amber-700' },
  AUDIO: { texto: 'Audio', clase: 'bg-green-100 text-green-700' },
  OTRO: { texto: 'Otro', clase: 'bg-slate-200 text-slate-600' },
};

/** Archivo gestionado (metadata + URL), tal como lo devuelve el backend. */
export interface Archivo {
  id: string;
  nombre: string;
  url: string;
  tipo: TipoArchivo;
  tamanoBytes: number | null;
  clienteId: string;
  publicacionId: string | null;
  organizacionId: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearArchivoPayload {
  nombre: string;
  url: string;
  clienteId: string;
  tipo?: TipoArchivo;
  publicacionId?: string;
  tamanoBytes?: number;
}
