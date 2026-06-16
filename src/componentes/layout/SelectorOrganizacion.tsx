import { useOrganizacion } from '@/contexto/contexto-organizacion';

/** Selector de la organización activa (desplegable en la barra superior). */
export function SelectorOrganizacion() {
  const { organizaciones, organizacionId, seleccionar, cargando } = useOrganizacion();

  if (cargando) {
    return <span className="text-sm text-slate-400">Cargando organizaciones…</span>;
  }

  if (organizaciones.length === 0) {
    return <span className="text-sm text-slate-400">Sin organizaciones</span>;
  }

  return (
    <select
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
      value={organizacionId ?? ''}
      onChange={(e) => seleccionar(e.target.value)}
    >
      {organizaciones.map((org) => (
        <option key={org.organizacionId} value={org.organizacionId}>
          {org.nombre} ({org.rol})
        </option>
      ))}
    </select>
  );
}
