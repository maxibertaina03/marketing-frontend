import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import type { Archivo, CrearArchivoPayload, TipoArchivo } from './tipos';

/** Publicación mínima para asociar archivos (incluye clienteId para filtrar). */
export interface PublicacionParaArchivo {
  id: string;
  titulo: string;
  clienteId: string;
}

export interface FiltrosArchivos {
  clienteId?: string;
  publicacionId?: string;
  tipo?: TipoArchivo;
}

/** Lista los archivos de la organización con filtros opcionales. */
export function useArchivos(filtros: FiltrosArchivos) {
  const api = useApi();
  return useQuery({
    queryKey: ['archivos', filtros],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filtros.clienteId) params.set('clienteId', filtros.clienteId);
      if (filtros.publicacionId) params.set('publicacionId', filtros.publicacionId);
      if (filtros.tipo) params.set('tipo', filtros.tipo);
      const qs = params.toString();
      return api.get<Archivo[]>(`/archivos${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useCrearArchivo() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearArchivoPayload) => api.post<Archivo>('/archivos', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['archivos'] }),
  });
}

export function useEliminarArchivo() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/archivos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['archivos'] }),
  });
}

/** Publicaciones (con clienteId) para asociar un archivo opcionalmente. */
export function usePublicacionesParaArchivos() {
  const api = useApi();
  return useQuery({
    queryKey: ['publicaciones-resumen'],
    queryFn: () => api.get<PublicacionParaArchivo[]>('/contenido'),
  });
}

/** Datos que devuelve el backend para subir directo a Cloudinary. */
export interface FirmaSubida {
  url: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/** Pide al backend la firma para subir un archivo de esa marca. */
export function useFirmarSubida() {
  const api = useApi();
  return useMutation({
    mutationFn: (clienteId: string) => api.post<FirmaSubida>('/archivos/firma', { clienteId }),
  });
}

export interface ArchivoSubido {
  url: string;
  bytes: number;
  recurso: string;
}

/**
 * Sube el archivo directo a Cloudinary con la firma del backend (el binario no
 * pasa por nuestro servidor).
 */
export async function subirACloudinary(archivo: File, firma: FirmaSubida): Promise<ArchivoSubido> {
  const datos = new FormData();
  datos.append('file', archivo);
  datos.append('api_key', firma.apiKey);
  datos.append('timestamp', String(firma.timestamp));
  datos.append('folder', firma.folder);
  datos.append('signature', firma.signature);

  const respuesta = await fetch(firma.url, { method: 'POST', body: datos });
  const json = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(json?.error?.message ?? 'No se pudo subir el archivo a Cloudinary.');
  }
  return { url: json.secure_url, bytes: json.bytes ?? 0, recurso: json.resource_type ?? 'raw' };
}
