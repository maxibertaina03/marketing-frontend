/** Placeholder para secciones del producto que se implementan en fases posteriores. */
export function PaginaProximamente({ titulo }: { titulo: string }) {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        <p className="mt-2 text-slate-500">Esta sección se implementa en una fase posterior.</p>
      </div>
    </div>
  );
}
