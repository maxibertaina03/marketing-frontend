import { Check, Minus } from 'lucide-react';
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta';
import { usePlan } from '@/planes/usePlan';
import { PLANES, type Plan } from '@/planes/planes';
import { cn } from '@/lib/utils';

/** Planes que se ofrecen en la grilla (PRUEBA no se vende: se otorga). */
const OFRECIDOS: Plan[] = ['STARTER', 'AGENCY', 'AGENCY_PRO', 'ENTERPRISE'];

const PARA_QUIEN: Record<Plan, string> = {
  PRUEBA: 'Para probar todo',
  STARTER: 'Freelancers y CM',
  AGENCY: 'Agencias chicas',
  AGENCY_PRO: 'Agencias con muchos clientes',
  ENTERPRISE: 'Agencias grandes',
};

/** `true` = incluido, `false` = no, string = valor concreto. */
const FILAS: Array<{ etiqueta: string; valores: Record<Plan, boolean | string> }> = [
  {
    etiqueta: 'Marcas',
    valores: { PRUEBA: '10', STARTER: '3', AGENCY: '10', AGENCY_PRO: '30', ENTERPRISE: 'ilimitadas' },
  },
  {
    etiqueta: 'Usuarios internos',
    valores: { PRUEBA: '5', STARTER: '1', AGENCY: '5', AGENCY_PRO: '15', ENTERPRISE: 'a medida' },
  },
  {
    etiqueta: 'Usuarios "Cliente"',
    valores: {
      PRUEBA: 'ilimitados',
      STARTER: 'ilimitados',
      AGENCY: 'ilimitados',
      AGENCY_PRO: 'ilimitados',
      ENTERPRISE: 'ilimitados',
    },
  },
  {
    etiqueta: 'Calendario, clientes y aprobaciones',
    valores: { PRUEBA: true, STARTER: true, AGENCY: true, AGENCY_PRO: true, ENTERPRISE: true },
  },
  {
    etiqueta: 'IA de Contenido y Banco de ideas',
    valores: { PRUEBA: true, STARTER: true, AGENCY: true, AGENCY_PRO: true, ENTERPRISE: true },
  },
  {
    etiqueta: 'Métricas de Instagram',
    valores: { PRUEBA: true, STARTER: true, AGENCY: true, AGENCY_PRO: true, ENTERPRISE: true },
  },
  {
    etiqueta: 'IA Estratégica y Campañas',
    valores: { PRUEBA: true, STARTER: false, AGENCY: true, AGENCY_PRO: true, ENTERPRISE: true },
  },
  {
    etiqueta: 'Roles y permisos',
    valores: { PRUEBA: true, STARTER: false, AGENCY: true, AGENCY_PRO: true, ENTERPRISE: true },
  },
  {
    etiqueta: 'Producción y tareas',
    valores: { PRUEBA: true, STARTER: false, AGENCY: true, AGENCY_PRO: true, ENTERPRISE: true },
  },
  {
    etiqueta: 'Informes mensuales',
    valores: { PRUEBA: true, STARTER: false, AGENCY: true, AGENCY_PRO: true, ENTERPRISE: true },
  },
  {
    etiqueta: 'Automatizaciones',
    valores: { PRUEBA: true, STARTER: false, AGENCY: true, AGENCY_PRO: true, ENTERPRISE: true },
  },
  {
    etiqueta: 'Soporte',
    valores: {
      PRUEBA: false,
      STARTER: false,
      AGENCY: false,
      AGENCY_PRO: 'prioritario',
      ENTERPRISE: 'prioritario + implementación',
    },
  },
];

function Celda({ valor }: { valor: boolean | string }) {
  if (valor === true) return <Check className="mx-auto h-4 w-4 text-marca" aria-label="Incluido" />;
  if (valor === false)
    return <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="No incluido" />;
  return <span className="text-sm text-slate-700">{valor}</span>;
}

export function PaginaPlanes() {
  const { plan, planExpiraEn } = usePlan();

  const diasDePrueba =
    plan === 'PRUEBA' && planExpiraEn
      ? Math.max(
          0,
          Math.ceil((new Date(planExpiraEn).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        )
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Planes</h1>
        <p className="text-sm text-slate-600">
          {plan ? (
            <>
              Tu plan actual es <strong className="text-slate-800">{PLANES[plan].nombre}</strong>
              {diasDePrueba !== null && (
                <>
                  {' '}
                  — te {diasDePrueba === 1 ? 'queda' : 'quedan'} {diasDePrueba}{' '}
                  {diasDePrueba === 1 ? 'día' : 'días'} de prueba
                </>
              )}
              .
            </>
          ) : (
            'Elegí el plan que le sirve a tu agencia.'
          )}
        </p>
      </div>

      <Tarjeta>
        <TarjetaContenido className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse text-center">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 text-left text-sm font-medium text-slate-500">&nbsp;</th>
                {OFRECIDOS.map((p) => (
                  <th
                    key={p}
                    className={cn(
                      'p-4 align-top',
                      p === plan && 'bg-marca/5',
                      p === 'AGENCY' && 'border-x border-marca/30',
                    )}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{PLANES[p].nombre}</p>
                      <p className="text-lg font-bold text-marca">{PLANES[p].precio}</p>
                      <p className="text-xs font-normal text-slate-500">{PARA_QUIEN[p]}</p>
                      {p === plan && (
                        <p className="text-xs font-medium text-marca">Tu plan actual</p>
                      )}
                      {p === 'AGENCY' && p !== plan && (
                        <p className="text-xs font-medium text-marca">El más elegido</p>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FILAS.map((fila) => (
                <tr key={fila.etiqueta} className="border-b border-slate-100 last:border-0">
                  <th scope="row" className="p-4 text-left text-sm font-normal text-slate-600">
                    {fila.etiqueta}
                  </th>
                  {OFRECIDOS.map((p) => (
                    <td
                      key={p}
                      className={cn(
                        'p-4',
                        p === plan && 'bg-marca/5',
                        p === 'AGENCY' && 'border-x border-marca/30',
                      )}
                    >
                      <Celda valor={fila.valores[p]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TarjetaContenido>
      </Tarjeta>

      <p className="text-center text-sm text-slate-500">
        Para cambiar de plan, escribinos. El pago con tarjeta llega en la próxima versión.
      </p>
    </div>
  );
}
