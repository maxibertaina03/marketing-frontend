import { useState } from 'react';
import { Boton } from '@/componentes/ui/boton';
import type { CrearEstrategiaPayload, TonoComunicacion, EstrategiaDeMarca } from './hooks';

const TONOS: { valor: TonoComunicacion; etiqueta: string }[] = [
  { valor: 'FORMAL', etiqueta: 'Formal' },
  { valor: 'INFORMAL', etiqueta: 'Informal' },
  { valor: 'CASUAL', etiqueta: 'Casual' },
  { valor: 'PROFESIONAL', etiqueta: 'Profesional' },
  { valor: 'CERCANO', etiqueta: 'Cercano' },
  { valor: 'INSPIRADOR', etiqueta: 'Inspirador' },
  { valor: 'HUMORISTICO', etiqueta: 'Humorístico' },
];

interface Props {
  clienteId: string;
  inicial?: Partial<EstrategiaDeMarca>;
  onGuardar: (payload: CrearEstrategiaPayload) => void;
  onCancelar: () => void;
  guardando: boolean;
}

export function FormularioEstrategia({ clienteId, inicial, onGuardar, onCancelar, guardando }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [objetivo, setObjetivo] = useState(inicial?.objetivo ?? '');
  const [publicoObjetivo, setPublicoObjetivo] = useState(inicial?.publicoObjetivo ?? '');
  const [tono, setTono] = useState<TonoComunicacion>(inicial?.tono ?? 'PROFESIONAL');
  const [pilarInput, setPilarInput] = useState('');
  const [pilares, setPilares] = useState<string[]>(inicial?.pilares ?? []);
  const [restricciones, setRestricciones] = useState(inicial?.restricciones ?? '');

  function agregarPilar() {
    const p = pilarInput.trim();
    if (p && !pilares.includes(p)) {
      setPilares([...pilares, p]);
    }
    setPilarInput('');
  }

  function quitarPilar(p: string) {
    setPilares(pilares.filter((x) => x !== p));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGuardar({ nombre, clienteId, objetivo, publicoObjetivo, tono, pilares, restricciones: restricciones || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la estrategia</label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej. Estrategia Principal 2024"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo de la marca</label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca min-h-[80px]"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          placeholder="¿Qué quiere lograr la marca?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Público objetivo</label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca min-h-[80px]"
          value={publicoObjetivo}
          onChange={(e) => setPublicoObjetivo(e.target.value)}
          placeholder="¿A quién se dirige la marca?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tono de comunicación</label>
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
          value={tono}
          onChange={(e) => setTono(e.target.value as TonoComunicacion)}
        >
          {TONOS.map((t) => (
            <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pilares de la marca</label>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca"
            value={pilarInput}
            onChange={(e) => setPilarInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarPilar(); } }}
            placeholder="ej. Innovación"
          />
          <Boton type="button" variante="secundario" tamano="md" onClick={agregarPilar}>
            Agregar
          </Boton>
        </div>
        {pilares.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pilares.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 rounded-full bg-marca/10 px-3 py-1 text-xs font-medium text-marca"
              >
                {p}
                <button type="button" onClick={() => quitarPilar(p)} className="text-marca hover:text-marca-oscuro">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Restricciones <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marca min-h-[60px]"
          value={restricciones}
          onChange={(e) => setRestricciones(e.target.value)}
          placeholder="Qué evitar en la comunicación de esta marca"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Boton type="button" variante="contorno" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando || pilares.length === 0}>
          {guardando ? 'Guardando…' : 'Guardar estrategia'}
        </Boton>
      </div>
    </form>
  );
}
