import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import {
  Tarjeta,
  TarjetaCabecera,
  TarjetaTitulo,
  TarjetaDescripcion,
  TarjetaContenido,
} from '@/componentes/ui/tarjeta';
import { Boton } from '@/componentes/ui/boton';
import { ROLES, ETIQUETA_ROL } from '@/funcionalidades/equipo/tipos';
import { AREAS, ETIQUETA_AREA, EDICION } from '@/permisos/permisos';
import { PanelConsumoIa } from './PanelConsumoIa';
import { ZonaPeligro } from './ZonaPeligro';

/** Centro de configuración: gestión del equipo y matriz de permisos por rol. */
export function PaginaConfiguracion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-slate-500">Roles, permisos y equipo de tu agencia.</p>
      </div>

      <PanelConsumoIa />

      <Tarjeta className="p-6">
        <TarjetaCabecera className="p-0">
          <TarjetaTitulo>Equipo y roles</TarjetaTitulo>
          <TarjetaDescripcion>
            Invitá gente, cambiá roles y administrá los accesos de tu agencia.
          </TarjetaDescripcion>
        </TarjetaCabecera>
        <TarjetaContenido className="p-0 pt-4">
          <Link to="/equipo">
            <Boton>Gestionar equipo</Boton>
          </Link>
        </TarjetaContenido>
      </Tarjeta>

      <Tarjeta className="p-6">
        <TarjetaCabecera className="p-0">
          <TarjetaTitulo>Matriz de permisos</TarjetaTitulo>
          <TarjetaDescripcion>
            Qué puede <strong>editar</strong> cada rol. Lo que no está marcado es solo lectura o sin
            acceso. El administrador puede todo.
          </TarjetaDescripcion>
        </TarjetaCabecera>
        <TarjetaContenido className="p-0 pt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4 font-medium">Área</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-2 py-2 text-center font-medium">
                      {ETIQUETA_ROL[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AREAS.map((area) => (
                  <tr key={area} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{ETIQUETA_AREA[area]}</td>
                    {ROLES.map((r) => (
                      <td key={r} className="px-2 py-2 text-center">
                        {EDICION[area].includes(r) ? (
                          <Check className="mx-auto size-4 text-green-600" />
                        ) : (
                          <span className="text-slate-300">·</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            <Check className="inline size-3 text-green-600" /> puede editar · &nbsp;·&nbsp; solo
            lectura o sin acceso
          </p>
        </TarjetaContenido>
      </Tarjeta>

      <ZonaPeligro />
    </div>
  );
}
