import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/contexto/contexto-organizacion';
import { Boton } from '@/componentes/ui/boton';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaDescripcion,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';

interface EstadoMeta {
  conectado: boolean;
  igUsername?: string | null;
  pageNombre?: string | null;
  ultimaSync?: string | null;
}

/** Mensajes que devuelve el callback de Meta (vienen en el query param `?meta=`). */
const AVISOS: Record<string, { texto: string; clase: string }> = {
  conectado: { texto: 'Instagram conectado correctamente.', clase: 'bg-green-50 text-green-700' },
  sin_instagram: {
    texto:
      'Conectaste Facebook, pero no encontramos una cuenta de Instagram Business vinculada a tus Páginas. Vinculá la cuenta de IG (Business) a una Página de Facebook y reintentá.',
    clase: 'bg-amber-50 text-amber-700',
  },
  error: {
    texto: 'No se pudo completar la conexión con Meta. Reintentá en un momento.',
    clase: 'bg-red-50 text-red-700',
  },
};

/** Conexión de la marca con Instagram/Facebook (Meta) para traer métricas reales. */
export function ConexionMeta({ clienteId }: { clienteId: string }) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [aviso, setAviso] = useState<string | null>(null);

  // El callback de Meta vuelve a esta ficha con ?meta=...; lo mostramos y limpiamos la URL.
  useEffect(() => {
    const resultado = params.get('meta');
    if (!resultado) return;
    setAviso(resultado);
    const limpio = new URLSearchParams(params);
    limpio.delete('meta');
    setParams(limpio, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: estado, isLoading } = useQuery({
    queryKey: ['meta-estado', clienteId],
    queryFn: () => api.get<EstadoMeta>(`/meta/estado?clienteId=${clienteId}`),
  });

  const conectar = useMutation({
    mutationFn: () => api.get<{ url: string }>(`/meta/conectar?clienteId=${clienteId}`),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const sincronizar = useMutation({
    mutationFn: () =>
      api.post<{ medios: number; sincronizadas: number }>('/meta/sincronizar', { clienteId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meta-estado', clienteId] });
    },
  });

  const desconectar = useMutation({
    mutationFn: () => api.delete(`/meta/conexion?clienteId=${clienteId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meta-estado', clienteId] });
    },
  });

  return (
    <Tarjeta className="p-6">
      <TarjetaCabecera className="p-0">
        <TarjetaTitulo>Conexión con Instagram</TarjetaTitulo>
        <TarjetaDescripcion>
          Conectá la cuenta de Instagram de esta marca para traer sus métricas reales al dashboard.
        </TarjetaDescripcion>
      </TarjetaCabecera>

      <TarjetaContenido className="p-0 pt-4">
        {aviso && AVISOS[aviso] && (
          <div className={`mb-4 rounded-md px-3 py-2 text-sm ${AVISOS[aviso].clase}`}>
            {AVISOS[aviso].texto}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando estado…</p>
        ) : estado?.conectado ? (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              <p>
                Conectado a{' '}
                <span className="font-medium text-slate-900">
                  {estado.igUsername ? `@${estado.igUsername}` : 'Instagram'}
                </span>
                {estado.pageNombre && ` · Página ${estado.pageNombre}`}
              </p>
              <p className="text-slate-400">
                {estado.ultimaSync
                  ? `Última sincronización: ${new Date(estado.ultimaSync).toLocaleString()}`
                  : 'Todavía no sincronizaste métricas.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Boton
                tamano="sm"
                disabled={sincronizar.isPending}
                onClick={() => sincronizar.mutate()}
              >
                {sincronizar.isPending ? 'Sincronizando…' : 'Sincronizar métricas'}
              </Boton>
              <Boton
                variante="secundario"
                tamano="sm"
                disabled={desconectar.isPending}
                onClick={() => {
                  if (confirm('¿Desconectar Instagram de esta marca?')) desconectar.mutate();
                }}
              >
                Desconectar
              </Boton>
              <Link to="/metricas" className="text-sm text-marca hover:underline">
                Ver métricas →
              </Link>
            </div>

            {sincronizar.isSuccess && !sincronizar.isPending && (
              <p className="text-sm text-green-600">
                Se sincronizaron {sincronizar.data.sincronizadas} publicaciones (de{' '}
                {sincronizar.data.medios} medios).
              </p>
            )}
            {sincronizar.isError && (
              <p className="text-sm text-red-600">
                No se pudieron sincronizar las métricas. Probá de nuevo.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Esta marca todavía no tiene Instagram conectado.
            </p>
            <Boton disabled={conectar.isPending} onClick={() => conectar.mutate()}>
              {conectar.isPending ? 'Redirigiendo…' : 'Conectar Instagram'}
            </Boton>
            {conectar.isError && (
              <p className="text-sm text-red-600">
                No se pudo iniciar la conexión. ¿La integración está configurada?
              </p>
            )}
          </div>
        )}
      </TarjetaContenido>
    </Tarjeta>
  );
}
