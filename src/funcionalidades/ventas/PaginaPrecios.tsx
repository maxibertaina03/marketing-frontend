import { Check, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLANES, type Plan } from '@/planes/planes';

const OFRECIDOS: Plan[] = ['STARTER', 'AGENCY', 'AGENCY_PRO', 'ENTERPRISE'];

const PARA_QUIEN: Record<Plan, string> = {
  PRUEBA: '',
  STARTER: 'Freelancers y CM',
  AGENCY: 'Agencias chicas',
  AGENCY_PRO: 'Agencias con muchos clientes',
  ENTERPRISE: 'Agencias grandes',
};

const FILAS: Array<{ etiqueta: string; valores: Record<Plan, boolean | string> }> = [
  {
    etiqueta: 'Marcas',
    valores: { PRUEBA: '', STARTER: '3', AGENCY: '10', AGENCY_PRO: '30', ENTERPRISE: 'ilimitadas' },
  },
  {
    etiqueta: 'Usuarios internos',
    valores: { PRUEBA: '', STARTER: '1', AGENCY: '5', AGENCY_PRO: '15', ENTERPRISE: 'a medida' },
  },
  {
    etiqueta: 'Usuarios "Cliente"',
    valores: { PRUEBA: '', STARTER: 'ilimitados', AGENCY: 'ilimitados', AGENCY_PRO: 'ilimitados', ENTERPRISE: 'ilimitados' },
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
  if (valor === false) return <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="No incluido" />;
  return <span className="text-sm text-slate-700">{valor}</span>;
}

export function PaginaPrecios() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-marca">ContentOS</p>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Planes para cada agencia
          </h1>
          <p className="mt-4 text-lg text-slate-500">
            Todos arrancan con 14 días de prueba gratuita — sin tarjeta.
          </p>
        </div>

        {/* Pricing table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-center">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-5 text-left text-sm font-medium text-slate-400">&nbsp;</th>
                {OFRECIDOS.map((p) => (
                  <th
                    key={p}
                    className={[
                      'p-5 align-top',
                      p === 'AGENCY' ? 'border-x border-marca/30 bg-marca/5' : '',
                    ].join(' ')}
                  >
                    <div className="space-y-1.5">
                      <p className="font-semibold text-slate-900">{PLANES[p].nombre}</p>
                      <p className="text-xl font-bold text-marca">{PLANES[p].precio}</p>
                      <p className="text-xs font-normal text-slate-500">{PARA_QUIEN[p]}</p>
                      {p === 'AGENCY' && (
                        <p className="text-xs font-medium text-marca">El más elegido</p>
                      )}
                      <div className="pt-1">
                        {p === 'ENTERPRISE' ? (
                          <a
                            href="mailto:hola@contentos.app"
                            className="inline-block rounded-lg border border-marca px-4 py-1.5 text-sm font-medium text-marca hover:bg-marca hover:text-white transition-colors"
                          >
                            Contactanos
                          </a>
                        ) : (
                          <Link
                            to="/registro"
                            className={[
                              'inline-block rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                              p === 'AGENCY'
                                ? 'bg-marca text-white hover:bg-marca/90'
                                : 'border border-marca text-marca hover:bg-marca hover:text-white',
                            ].join(' ')}
                          >
                            Empezar gratis
                          </Link>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FILAS.map((fila) => (
                <tr key={fila.etiqueta} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <th scope="row" className="p-4 text-left text-sm font-normal text-slate-600">
                    {fila.etiqueta}
                  </th>
                  {OFRECIDOS.map((p) => (
                    <td
                      key={p}
                      className={p === 'AGENCY' ? 'border-x border-marca/30 bg-marca/5 p-4' : 'p-4'}
                    >
                      <Celda valor={fila.valores[p]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-sm text-slate-400">
          ¿Tenés preguntas?{' '}
          <a href="mailto:hola@contentos.app" className="text-marca hover:underline">
            Escribinos
          </a>{' '}
          — respondemos el mismo día.
        </p>

        {/* Login link */}
        <p className="mt-4 text-center text-sm text-slate-400">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-marca hover:underline">
            Ingresá acá
          </Link>
        </p>
      </div>
    </div>
  );
}
