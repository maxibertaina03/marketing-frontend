import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi, useOrganizacion } from '@/contexto/contexto-organizacion';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Entrada, Selector } from '@/componentes/ui/campo';
import { Tarjeta } from '@/componentes/ui/tarjeta';
import { ETIQUETA_ROL, ROLES, type Invitacion, type Miembro, type Rol } from './tipos';

/** Gestión del equipo: miembros, roles e invitaciones. Las acciones son solo para ADMIN. */
export function PaginaEquipo() {
  const api = useApi();
  const cliente = useQueryClient();
  const { organizaciones, organizacionId } = useOrganizacion();
  const esAdmin = organizaciones.find((o) => o.organizacionId === organizacionId)?.rol === 'ADMIN';

  const [email, setEmail] = useState('');
  const [rolInvitado, setRolInvitado] = useState<Rol>('COMMUNITY_MANAGER');

  const { data: miembros = [] } = useQuery({
    queryKey: ['equipo-miembros', organizacionId],
    queryFn: () => api.get<Miembro[]>('/equipo/miembros'),
  });

  const { data: invitaciones = [] } = useQuery({
    queryKey: ['equipo-invitaciones', organizacionId],
    queryFn: () => api.get<Invitacion[]>('/equipo/invitaciones'),
    enabled: esAdmin,
  });

  function refrescar() {
    cliente.invalidateQueries({ queryKey: ['equipo-miembros'] });
    cliente.invalidateQueries({ queryKey: ['equipo-invitaciones'] });
  }

  const invitar = useMutation({
    mutationFn: () => api.post('/equipo/invitaciones', { email, rol: rolInvitado }),
    onSuccess: () => {
      setEmail('');
      refrescar();
    },
  });

  const cambiarRol = useMutation({
    mutationFn: (vars: { membresiaId: string; rol: Rol }) =>
      api.patch(`/equipo/miembros/${vars.membresiaId}`, { rol: vars.rol }),
    onSuccess: refrescar,
  });

  const quitar = useMutation({
    mutationFn: (membresiaId: string) => api.delete(`/equipo/miembros/${membresiaId}`),
    onSuccess: refrescar,
  });

  const cancelar = useMutation({
    mutationFn: (id: string) => api.delete(`/equipo/invitaciones/${id}`),
    onSuccess: refrescar,
  });

  function enviarInvitacion(e: FormEvent) {
    e.preventDefault();
    if (email.trim()) invitar.mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipo</h1>
        <p className="text-slate-500">Miembros de tu organización y sus roles.</p>
      </div>

      {esAdmin && (
        <Tarjeta className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Invitar a alguien</h2>
          <form className="flex flex-wrap items-end gap-3" onSubmit={enviarInvitacion}>
            <Campo etiqueta="Email">
              <Entrada
                type="email"
                className="w-64"
                placeholder="colega@agencia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Campo>
            <Campo etiqueta="Rol">
              <Selector
                className="w-52"
                value={rolInvitado}
                onChange={(e) => setRolInvitado(e.target.value as Rol)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ETIQUETA_ROL[r]}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Boton type="submit" disabled={invitar.isPending}>
              {invitar.isPending ? 'Invitando…' : 'Invitar'}
            </Boton>
          </form>
          {invitar.isError && (
            <p className="mt-3 text-sm text-red-600">
              No se pudo invitar (¿ya es miembro o ya está invitado?).
            </p>
          )}
          {invitar.isSuccess && (
            <p className="mt-3 text-sm text-green-600">
              Invitación enviada. Se sumará al iniciar sesión con ese email.
            </p>
          )}
        </Tarjeta>
      )}

      <Tarjeta className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-3 font-semibold">
          Miembros ({miembros.length})
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              {esAdmin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {miembros.map((m) => (
              <tr key={m.membresiaId} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{m.nombre ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{m.email}</td>
                <td className="px-4 py-3">
                  {esAdmin ? (
                    <Selector
                      className="w-48"
                      value={m.rol}
                      onChange={(e) =>
                        cambiarRol.mutate({ membresiaId: m.membresiaId, rol: e.target.value as Rol })
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ETIQUETA_ROL[r]}
                        </option>
                      ))}
                    </Selector>
                  ) : (
                    ETIQUETA_ROL[m.rol]
                  )}
                </td>
                {esAdmin && (
                  <td className="px-4 py-3 text-right">
                    <Boton
                      variante="fantasma"
                      tamano="sm"
                      onClick={() => {
                        if (confirm(`¿Quitar a ${m.email} de la organización?`)) {
                          quitar.mutate(m.membresiaId);
                        }
                      }}
                    >
                      Quitar
                    </Boton>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>

      {esAdmin && invitaciones.length > 0 && (
        <Tarjeta className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3 font-semibold">
            Invitaciones pendientes ({invitaciones.length})
          </div>
          <table className="w-full text-sm">
            <tbody>
              {invitaciones.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-700">{inv.email}</td>
                  <td className="px-4 py-3 text-slate-500">{ETIQUETA_ROL[inv.rol]}</td>
                  <td className="px-4 py-3 text-right">
                    <Boton variante="fantasma" tamano="sm" onClick={() => cancelar.mutate(inv.id)}>
                      Cancelar
                    </Boton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      )}
    </div>
  );
}
