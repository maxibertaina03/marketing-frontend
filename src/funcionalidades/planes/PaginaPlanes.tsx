import { useSearchParams } from 'react-router-dom';
import { Check, Minus, CheckCircle2 } from 'lucide-react';
import { Tarjeta, TarjetaContenido } from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { usePlan } from '@/planes/usePlan';
import { useRolActual } from '@/permisos/usePermisos';
import { PLANES, type Plan } from '@/planes/planes';
import { cn } from '@/lib/utils';
import { useIniciarPago } from './hooks';

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
  const esAdmin = useRolActual() === 'ADMIN';
  const [params] = useSearchParams();
  const volvioDePago = params.get('pago') === 'listo';

  const diasDePrueba =
    plan === 'PRUEBA' && planExpiraEn
      ? Math.max(
          0,
          Math.ceil((new Date(planExpiraEn).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        )
      : null;

  return (
    <div className="space-y-6">
      {volvioDePago && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            ¡Gracias! Estamos confirmando tu pago con Mercado Pago. En cuanto se acredite, tu plan se
            actualiza acá solo —puede tardar unos minutos—.
          </span>
        </div>
      )}
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
              <tr>
                <th scope="row" className="p-4">&nbsp;</th>
                {OFRECIDOS.map((p) => (
                  <td
                    key={p}
                    className={cn(
                      'p-4 align-top',
                      p === plan && 'bg-marca/5',
                      p === 'AGENCY' && 'border-x border-marca/30',
                    )}
                  >
                    <BotonPlan plan={p} planActual={plan} esAdmin={esAdmin} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </TarjetaContenido>
      </Tarjeta>

      {!esAdmin && (
        <p className="text-center text-sm text-slate-500">
          Solo el administrador de la agencia puede cambiar de plan.
        </p>
      )}
    </div>
  );
}

/** Botón de acción de cada plan en la grilla: contratar, plan actual, o contacto. */
function BotonPlan({
  plan,
  planActual,
  esAdmin,
}: {
  plan: Plan;
  planActual: Plan | undefined;
  esAdmin: boolean;
}) {
  const iniciarPago = useIniciarPago();

  if (plan === planActual) {
    return <span className="block text-center text-xs font-medium text-marca">Plan actual</span>;
  }
  if (plan === 'ENTERPRISE') {
    return (
      <a
        href="mailto:oscontent029@gmail.com"
        className="block rounded-md border border-slate-300 px-3 py-1.5 text-center text-sm text-slate-700 hover:bg-slate-50"
      >
        Contactar
      </a>
    );
  }
  if (!esAdmin) return null;

  return (
    <Boton
      tamano="sm"
      className="w-full"
      disabled={iniciarPago.isPending}
      onClick={() => iniciarPago.mutate(plan)}
    >
      {iniciarPago.isPending ? 'Abriendo…' : 'Contratar'}
    </Boton>
  );
}
