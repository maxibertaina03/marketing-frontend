import { Navigate } from 'react-router-dom';
import { ShieldAlert, Ban, RotateCcw, Sparkles, Users, Store } from 'lucide-react';
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta';
import { cn } from '@/lib/utils';
import { PLANES, type Plan } from '@/planes/planes';
import {
  useAgencias,
  useConsumoTotal,
  useEsSuperadmin,
  useCambiarPlan,
  useSuspension,
  useReiniciarCuota,
  type AgenciaAdmin,
} from './hooks';

const PLANES_ELEGIBLES: Plan[] = ['PRUEBA', 'STARTER', 'AGENCY', 'AGENCY_PRO', 'ENTERPRISE'];

function Fila({ agencia }: { agencia: AgenciaAdmin }) {
  const cambiarPlan = useCambiarPlan();
  const suspension = useSuspension();
  const reiniciar = useReiniciarCuota();

  const cuota = agencia.limites.generacionesIaPorMes;
  const cerca = cuota !== null && agencia.consumoIaMes >= cuota * 0.8;

  return (
    <tr className={cn('border-b border-slate-100', agencia.suspendida && 'bg-red-50/50')}>
      <td className="py-3 pr-4">
        <div className="font-medium text-slate-900">{agencia.nombre}</div>
        <div className="text-xs text-slate-400">
          {agencia.suspendida ? (
            <span className="text-red-600">Suspendida</span>
          ) : (
            `desde ${new Date(agencia.creadoEn).toLocaleDateString('es')}`
          )}
        </div>
      </td>
      <td className="px-2">
        <select
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          value={agencia.planContratado}
          disabled={cambiarPlan.isPending}
          onChange={(e) => cambiarPlan.mutate({ id: agencia.id, plan: e.target.value as Plan })}
        >
          {PLANES_ELEGIBLES.map((p) => (
            <option key={p} value={p}>
              {PLANES[p].nombre}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 text-center text-sm text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Store className="h-3.5 w-3.5 text-slate-400" />
          {agencia.marcas}
          {agencia.limites.marcas !== null && `/${agencia.limites.marcas}`}
        </span>
      </td>
      <td className="px-2 text-center text-sm text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {agencia.usuarios}
        </span>
      </td>
      <td className="px-2 text-center text-sm">
        <span className={cn('font-medium', cerca ? 'text-amber-600' : 'text-slate-700')}>
          {agencia.consumoIaMes}
          {cuota !== null && <span className="text-slate-400">/{cuota}</span>}
        </span>
        <div className="text-xs text-slate-400">${agencia.costoIaMes.toFixed(2)}</div>
      </td>
      <td className="py-2 pl-2">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Reiniciar cuota de IA del mes"
            onClick={() => reiniciar.mutate(agencia.id)}
            disabled={reiniciar.isPending}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            title={agencia.suspendida ? 'Reactivar agencia' : 'Suspender agencia'}
            onClick={() =>
              suspension.mutate({ id: agencia.id, activar: agencia.suspendida })
            }
            disabled={suspension.isPending}
            className={cn(
              'rounded p-1.5 disabled:opacity-50',
              agencia.suspendida
                ? 'text-emerald-600 hover:bg-emerald-50'
                : 'text-red-600 hover:bg-red-50',
            )}
          >
            <Ban className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/** Portal de superadministración. Solo accesible para los emails de SUPERADMINS. */
export function PaginaAdmin() {
  const { data: estado, isLoading: cargandoEstado } = useEsSuperadmin();
  const { data: agencias, isLoading } = useAgencias();
  const { data: total } = useConsumoTotal();

  if (cargandoEstado) return <p className="text-slate-500">Cargando…</p>;
  // Si no es superadmin, no existe para él: lo mandamos a su panel.
  if (!estado?.esSuperadmin) return <Navigate to="/panel" replace />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-6 w-6 text-marca" />
        <div>
          <h1 className="text-2xl font-bold">Superadministración</h1>
          <p className="text-sm text-slate-500">Todas las agencias de la plataforma.</p>
        </div>
      </div>

      {total && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Tarjeta className="p-4">
            <TarjetaContenido className="p-0">
              <p className="text-xs text-slate-500">Agencias con actividad</p>
              <p className="text-2xl font-bold text-slate-900">{total.agenciasActivas}</p>
            </TarjetaContenido>
          </Tarjeta>
          <Tarjeta className="p-4">
            <TarjetaContenido className="p-0">
              <p className="text-xs text-slate-500">Generaciones de IA (mes)</p>
              <p className="text-2xl font-bold text-slate-900">{total.generaciones}</p>
            </TarjetaContenido>
          </Tarjeta>
          <Tarjeta className="p-4">
            <TarjetaContenido className="flex items-center gap-2 p-0">
              <Sparkles className="h-5 w-5 text-marca" />
              <div>
                <p className="text-xs text-slate-500">Costo IA de la plataforma (mes)</p>
                <p className="text-2xl font-bold text-slate-900">${total.costoUsd.toFixed(2)}</p>
              </div>
            </TarjetaContenido>
          </Tarjeta>
        </div>
      )}

      <Tarjeta className="p-6">
        <TarjetaContenido className="overflow-x-auto p-0">
          {isLoading ? (
            <p className="text-slate-400">Cargando agencias…</p>
          ) : (
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Agencia</th>
                  <th className="px-2 pb-2 font-medium">Plan</th>
                  <th className="px-2 pb-2 text-center font-medium">Marcas</th>
                  <th className="px-2 pb-2 text-center font-medium">Usuarios</th>
                  <th className="px-2 pb-2 text-center font-medium">IA (mes)</th>
                  <th className="pb-2 pl-2 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agencias?.map((a) => <Fila key={a.id} agencia={a} />)}
              </tbody>
            </table>
          )}
        </TarjetaContenido>
      </Tarjeta>
    </div>
  );
}
