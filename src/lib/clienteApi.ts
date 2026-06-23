const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// El backend gratuito (Render free) se "duerme" por inactividad y tarda ~50s en
// despertar; mientras tanto fetch falla por red/CORS. Reintentamos con backoff
// (hasta ~90s) para aguantar ese cold-start sin mostrarle un error al usuario.
const MAX_REINTENTOS = 12;
const ESPERA_BASE_MS = 2000;
const ESPERA_MAX_MS = 8000;

const dormir = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

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
  /**
   * Se invoca con `true` cuando el backend no responde y se está reintentando
   * (cold-start del plan gratuito), y con `false` al recuperarse o al rendirse.
   * La UI lo usa para mostrar "Despertando el servidor…".
   */
  onDespertando?: (despertando: boolean) => void;
}

type OpcionesPeticion = {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  cuerpo?: unknown;
};

/**
 * Crea un cliente HTTP que adjunta automáticamente:
 * - el Bearer token de Clerk
 * - el header `x-organizacion-id` con la organización activa
 * y reintenta si el backend está dormido (cold-start).
 */
export function crearClienteApi(config: ConfiguracionApi) {
  async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
    const token = await config.obtenerToken();
    const organizacionId = config.obtenerOrganizacionId();

    const cabeceras: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) cabeceras['Authorization'] = `Bearer ${token}`;
    if (organizacionId) cabeceras['x-organizacion-id'] = organizacionId;

    const init: RequestInit = {
      method: opciones.metodo ?? 'GET',
      headers: cabeceras,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
    };

    for (let intento = 0; intento <= MAX_REINTENTOS; intento++) {
      let respuesta: Response;
      try {
        respuesta = await fetch(`${URL_BASE}${ruta}`, init);
      } catch {
        // Error de red/CORS: el backend probablemente está dormido. Reintentamos.
        if (intento === MAX_REINTENTOS) {
          config.onDespertando?.(false);
          throw new ErrorApi(0, 'No se pudo conectar con el servidor. Reintentá en un momento.');
        }
        config.onDespertando?.(true);
        await dormir(Math.min(ESPERA_BASE_MS * (intento + 1), ESPERA_MAX_MS));
        continue;
      }

      // El servidor respondió → ya está despierto.
      config.onDespertando?.(false);

      if (!respuesta.ok) {
        const detalle = await respuesta.json().catch(() => ({}));
        const mensaje = (detalle?.message as string) ?? respuesta.statusText;
        throw new ErrorApi(respuesta.status, mensaje);
      }
      if (respuesta.status === 204) return undefined as T;
      return (await respuesta.json()) as T;
    }

    // Inalcanzable (el bucle retorna o lanza antes), pero el tipo lo necesita.
    throw new ErrorApi(0, 'No se pudo conectar con el servidor.');
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
