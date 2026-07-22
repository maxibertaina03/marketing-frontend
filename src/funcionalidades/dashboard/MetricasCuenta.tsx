import { Tarjeta } from '@/componentes/ui/tarjeta';
import type { DiaCuenta } from './hooks';

const num = (n: number) => n.toLocaleString('es-AR');
const dia = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

/**
 * Serie diaria de la cuenta de Instagram. A diferencia de las publicaciones,
 * estos valores ya son diarios y vienen con historial (~30 días).
 */
export function MetricasCuenta({ dias }: { dias: DiaCuenta[] }) {
  if (dias.length === 0) return null;

  const total = dias.reduce(
    (acc, d) => ({
      alcance: acc.alcance + d.alcance,
      vistas: acc.vistas + d.vistas,
      visitasPerfil: acc.visitasPerfil + d.visitasPerfil,
    }),
    { alcance: 0, vistas: 0, visitasPerfil: 0 },
  );
  const seguidores = [...dias].reverse().find((d) => d.seguidores > 0)?.seguidores ?? 0;
  const pico = Math.max(...dias.map((d) => d.alcance), 1);

  return (
    <Tarjeta className="overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold text-slate-900">Cuenta de Instagram</h2>
        <p className="text-xs text-slate-500">
          Actividad diaria de la cuenta (no de una publicación). Instagram entrega hasta 30 días de
          historial.
        </p>
      </div>

      <div className="grid gap-4 border-b border-slate-100 px-4 py-3 sm:grid-cols-4">
        <Dato etiqueta="Alcance (período)" valor={num(total.alcance)} />
        <Dato etiqueta="Vistas (período)" valor={num(total.vistas)} />
        <Dato etiqueta="Visitas al perfil" valor={num(total.visitasPerfil)} />
        <Dato
          etiqueta="Seguidores"
          valor={seguidores > 0 ? num(seguidores) : '—'}
          nota={seguidores === 0 ? 'Requiere +100 seguidores' : undefined}
        />
      </div>

      <div className="max-h-72 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Día</th>
              <th className="px-3 py-2 font-medium">Alcance</th>
              <th className="px-3 py-2 text-right font-medium">Vistas</th>
              <th className="px-3 py-2 text-right font-medium">Visitas al perfil</th>
            </tr>
          </thead>
          <tbody>
            {[...dias].reverse().map((d) => (
              <tr key={d.fecha} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-600">{dia(d.fecha)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-marca"
                        style={{ width: `${Math.round((d.alcance / pico) * 100)}%` }}
                      />
                    </div>
                    <span className="tabular-nums">{num(d.alcance)}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{num(d.vistas)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{num(d.visitasPerfil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Tarjeta>
  );
}

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{etiqueta}</p>
      <p className="text-xl font-semibold text-slate-900">{valor}</p>
      {nota && <p className="text-xs text-slate-400">{nota}</p>}
    </div>
  );
}
