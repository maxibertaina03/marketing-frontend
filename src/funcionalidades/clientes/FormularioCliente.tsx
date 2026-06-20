import { useState, type FormEvent } from 'react';
import { Boton } from '@/componentes/ui/boton';
import { Campo, Entrada, AreaTexto, Selector } from '@/componentes/ui/campo';
import { ESTADOS_CLIENTE, ETIQUETA_ESTADO, type Cliente, type DatosCliente } from './tipos';

interface Props {
  inicial?: Cliente;
  guardando: boolean;
  textoBoton: string;
  onGuardar: (datos: DatosCliente) => void;
}

/** Formulario con todos los campos del cliente. Se usa para crear y para editar. */
export function FormularioCliente({ inicial, guardando, textoBoton, onGuardar }: Props) {
  const [valores, setValores] = useState({
    nombre: inicial?.nombre ?? '',
    rubro: inicial?.rubro ?? '',
    estado: inicial?.estado ?? 'ACTIVO',
    ubicacion: inicial?.ubicacion ?? '',
    sitioWeb: inicial?.sitioWeb ?? '',
    contactoNombre: inicial?.contactoNombre ?? '',
    contactoEmail: inicial?.contactoEmail ?? '',
    contactoTelefono: inicial?.contactoTelefono ?? '',
    instagram: inicial?.redes?.instagram ?? '',
    facebook: inicial?.redes?.facebook ?? '',
    tiktok: inicial?.redes?.tiktok ?? '',
    paletaColores: (inicial?.paletaColores ?? []).join(', '),
    tono: inicial?.tono ?? '',
    publicoObjetivo: inicial?.publicoObjetivo ?? '',
    productosServicios: inicial?.productosServicios ?? '',
    objetivos: inicial?.objetivos ?? '',
    competencia: inicial?.competencia ?? '',
    promociones: inicial?.promociones ?? '',
  });

  function actualizar(campo: keyof typeof valores, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!valores.nombre.trim()) return;

    const redes: Record<string, string> = {};
    if (valores.instagram.trim()) redes.instagram = valores.instagram.trim();
    if (valores.facebook.trim()) redes.facebook = valores.facebook.trim();
    if (valores.tiktok.trim()) redes.tiktok = valores.tiktok.trim();

    const paletaColores = valores.paletaColores
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    onGuardar({
      nombre: valores.nombre.trim(),
      rubro: valores.rubro.trim() || undefined,
      estado: valores.estado as DatosCliente['estado'],
      ubicacion: valores.ubicacion.trim() || undefined,
      sitioWeb: valores.sitioWeb.trim() || undefined,
      contactoNombre: valores.contactoNombre.trim() || undefined,
      contactoEmail: valores.contactoEmail.trim() || undefined,
      contactoTelefono: valores.contactoTelefono.trim() || undefined,
      redes: Object.keys(redes).length ? redes : undefined,
      paletaColores: paletaColores.length ? paletaColores : undefined,
      tono: valores.tono.trim() || undefined,
      publicoObjetivo: valores.publicoObjetivo.trim() || undefined,
      productosServicios: valores.productosServicios.trim() || undefined,
      objetivos: valores.objetivos.trim() || undefined,
      competencia: valores.competencia.trim() || undefined,
      promociones: valores.promociones.trim() || undefined,
    });
  }

  return (
    <form className="space-y-6" onSubmit={enviar}>
      <section className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre de la marca *">
          <Entrada
            value={valores.nombre}
            onChange={(e) => actualizar('nombre', e.target.value)}
            placeholder="Café del Centro"
            required
          />
        </Campo>
        <Campo etiqueta="Rubro">
          <Entrada
            value={valores.rubro}
            onChange={(e) => actualizar('rubro', e.target.value)}
            placeholder="Gastronomía"
          />
        </Campo>
        <Campo etiqueta="Estado">
          <Selector value={valores.estado} onChange={(e) => actualizar('estado', e.target.value)}>
            {ESTADOS_CLIENTE.map((estado) => (
              <option key={estado} value={estado}>
                {ETIQUETA_ESTADO[estado].texto}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Ubicación">
          <Entrada
            value={valores.ubicacion}
            onChange={(e) => actualizar('ubicacion', e.target.value)}
            placeholder="Córdoba, Argentina"
          />
        </Campo>
        <Campo etiqueta="Sitio web">
          <Entrada
            value={valores.sitioWeb}
            onChange={(e) => actualizar('sitioWeb', e.target.value)}
            placeholder="https://…"
          />
        </Campo>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Contacto</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Nombre">
            <Entrada
              value={valores.contactoNombre}
              onChange={(e) => actualizar('contactoNombre', e.target.value)}
            />
          </Campo>
          <Campo etiqueta="Email">
            <Entrada
              type="email"
              value={valores.contactoEmail}
              onChange={(e) => actualizar('contactoEmail', e.target.value)}
            />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Entrada
              value={valores.contactoTelefono}
              onChange={(e) => actualizar('contactoTelefono', e.target.value)}
            />
          </Campo>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Redes sociales</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Instagram">
            <Entrada
              value={valores.instagram}
              onChange={(e) => actualizar('instagram', e.target.value)}
              placeholder="@usuario"
            />
          </Campo>
          <Campo etiqueta="Facebook">
            <Entrada
              value={valores.facebook}
              onChange={(e) => actualizar('facebook', e.target.value)}
            />
          </Campo>
          <Campo etiqueta="TikTok">
            <Entrada
              value={valores.tiktok}
              onChange={(e) => actualizar('tiktok', e.target.value)}
              placeholder="@usuario"
            />
          </Campo>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Marca y estrategia</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Paleta de colores (hex separados por coma)">
            <Entrada
              value={valores.paletaColores}
              onChange={(e) => actualizar('paletaColores', e.target.value)}
              placeholder="#6F4E37, #C0A080"
            />
          </Campo>
          <Campo etiqueta="Tono de comunicación">
            <Entrada
              value={valores.tono}
              onChange={(e) => actualizar('tono', e.target.value)}
              placeholder="Cercano, cálido"
            />
          </Campo>
        </div>
        <Campo etiqueta="Público objetivo">
          <AreaTexto
            value={valores.publicoObjetivo}
            onChange={(e) => actualizar('publicoObjetivo', e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Productos / servicios">
          <AreaTexto
            value={valores.productosServicios}
            onChange={(e) => actualizar('productosServicios', e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Objetivos">
          <AreaTexto
            value={valores.objetivos}
            onChange={(e) => actualizar('objetivos', e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Competencia">
          <AreaTexto
            value={valores.competencia}
            onChange={(e) => actualizar('competencia', e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Promociones">
          <AreaTexto
            value={valores.promociones}
            onChange={(e) => actualizar('promociones', e.target.value)}
          />
        </Campo>
      </section>

      <Boton type="submit" disabled={guardando}>
        {guardando ? 'Guardando…' : textoBoton}
      </Boton>
    </form>
  );
}
