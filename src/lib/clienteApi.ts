const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Error de API con el código de estado HTTP. */
export class ErrorApi extends Error {
  constructor(
    public readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}

/** Funciones que la capa de React inyecta para resolver el contexto de cada petición. */
export interface ConfiguracionApi {
  /** Devuelve el JWT de Clerk (o null si no hay sesión). */
  obtenerToken: () => Promise<string | null>;
  /** Devuelve la organización activa (o null si todavía no se eligió). */
  obtenerOrganizacionId: () => string | null;
}

type OpcionesPeticion = {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  cuerpo?: unknown;
};

/**
 * Crea un cliente HTTP que adjunta automáticamente:
 * - el Bearer token de Clerk
 * - el header `x-organizacion-id` con la organización activa
 */
export function crearClienteApi(config: ConfiguracionApi) {
  async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
    const token = await config.obtenerToken();
    const organizacionId = config.obtenerOrganizacionId();

    const cabeceras: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) cabeceras['Authorization'] = `Bearer ${token}`;
    if (organizacionId) cabeceras['x-organizacion-id'] = organizacionId;

    const respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: opciones.metodo ?? 'GET',
      headers: cabeceras,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.json().catch(() => ({}));
      const mensaje = (detalle?.message as string) ?? respuesta.statusText;
      throw new ErrorApi(respuesta.status, mensaje);
    }

    if (respuesta.status === 204) return undefined as T;
    return respuesta.json() as Promise<T>;
  }

  return {
    get: <T>(ruta: string) => peticion<T>(ruta),
    post: <T>(ruta: string, cuerpo?: unknown) => peticion<T>(ruta, { metodo: 'POST', cuerpo }),
    patch: <T>(ruta: string, cuerpo?: unknown) => peticion<T>(ruta, { metodo: 'PATCH', cuerpo }),
    put: <T>(ruta: string, cuerpo?: unknown) => peticion<T>(ruta, { metodo: 'PUT', cuerpo }),
    delete: <T>(ruta: string) => peticion<T>(ruta, { metodo: 'DELETE' }),
  };
}

export type ClienteApi = ReturnType<typeof crearClienteApi>;
