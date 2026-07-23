import { Sparkles, TrendingUp, Users, Store } from 'lucide-react';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaDescripcion,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';
import { cn } from '@/lib/utils';
import { useConsumoIa, type ConsumoIa } from './hooks';

/** Etiquetas legibles de cada botón de IA (coinciden con las del Banco de ideas). */
const ETIQUETA_BOTON: Record<string, string> = {
  IDEAS_CONTENIDO: 'Ideas de contenido',
  COPYWRITING: 'Copywriting',
  CARRUSEL: 'Carrusel',
  HOOKS: 'Hooks',
  ESTRATEGIA_MENSUAL: 'Estrategia mensual',
  FODA: 'FODA',
  BUYER_PERSONA: 'Buyer Persona',
  PILARES: 'Pilares',
  CAMPANA: 'Campaña',
  ANALISIS_METRICAS: 'Análisis de métricas',
  OPORTUNIDADES: 'Oportunidades',
  OTRO: 'Otro',
};

/** El mes en curso, en palabras. */
function mesLegible(periodo: string): string {
  const [anio, mes] = periodo.split('-').map(Number);
  const nombre = new Date(anio, mes - 1, 1).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

function Barra({ datos, total }: { datos: ConsumoIa['porUsuario']; total: number }) {
  if (datos.length === 0) {
    return <p className="text-sm text-slate-400">Sin generaciones este mes.</p>;
  }
  return (
    <ul className="space-y-2">
      {datos.map((d) => (
        <li key={d.etiqueta} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-700">{ETIQUETA_BOTON[d.etiqueta] ?? d.etiqueta}</span>
            <span className="text-slate-500">{d.generaciones}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-marca/60"
              style={{ width: `${total > 0 ? (d.generaciones / total) * 100 : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Panel de consumo de IA del mes: cuánto va, cuánto queda y el detalle. */
export function PanelConsumoIa() {
  const { data, isLoading } = useConsumoIa();

  if (isLoading || !data) {
    return (
      <Tarjeta className="p-6">
        <TarjetaCabecera className="p-0">
          <TarjetaTitulo>Consumo de IA</TarjetaTitulo>
        </TarjetaCabecera>
        <TarjetaContenido className="p-0 pt-4">
          <p className="text-sm text-slate-400">Cargando…</p>
        </TarjetaContenido>
      </Tarjeta>
    );
  }

  const sinTope = data.limite === null;
  const porcentaje = sinTope ? 0 : Math.min(100, Math.round((data.generaciones / data.limite!) * 100));
  const restantes = sinTope ? null : Math.max(0, data.limite! - data.generaciones);
  const cerca = porcentaje >= 80;
  const agotado = restantes === 0;

  return (
    <Tarjeta className="p-6">
      <TarjetaCabecera className="p-0">
        <TarjetaTitulo className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-marca" aria-hidden="true" />
          Consumo de IA
        </TarjetaTitulo>
        <TarjetaDescripcion>{mesLegible(data.periodo)}</TarjetaDescripcion>
      </TarjetaCabecera>

      <TarjetaContenido className="space-y-6 p-0 pt-4">
        {/* Barra de cuota */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {data.generaciones}
              {!sinTope && <span className="text-base font-normal text-slate-400"> / {data.limite}</span>}
            </span>
            <span className="text-sm text-slate-500">
              {sinTope
                ? 'Sin límite'
                : agotado
                  ? 'Cuota agotada'
                  : `${restantes} generaciones disponibles`}
            </span>
          </div>
          {!sinTope && (
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  agotado ? 'bg-red-500' : cerca ? 'bg-amber-500' : 'bg-marca',
                )}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          )}
          {cerca && !agotado && (
            <p className="text-sm text-amber-600">
              Estás cerca del límite. Cuando se agote, los botones de IA se bloquean hasta el mes que
              viene.
            </p>
          )}
          {agotado && (
            <p className="text-sm text-red-600">
              Agotaste la cuota del mes. Mejorá el plan para seguir generando ahora.
            </p>
          )}
        </div>

        {/* Costo real: solo lo ve la agencia, es su dato de gestión */}
        <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <TrendingUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
          Costo real de IA este mes:{' '}
          <strong className="text-slate-800">
            {data.costoUsd < 0.01 ? '<$0.01' : `$${data.costoUsd.toFixed(2)}`}
          </strong>
        </div>

        {/* Detalle por persona y por marca */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Por persona
            </p>
            <Barra datos={data.porUsuario} total={data.generaciones} />
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Store className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Por marca
            </p>
            <Barra datos={data.porMarca} total={data.generaciones} />
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Sparkles className="h-4 w-4 text-slate-400" aria-hidden="true" />
              Por herramienta
            </p>
            <Barra datos={data.porBoton} total={data.generaciones} />
          </div>
        </div>
      </TarjetaContenido>
    </Tarjeta>
  );
}
