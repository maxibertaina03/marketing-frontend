# CLAUDE.md — marketing-frontend (ContentOS)

Contexto para Claude Code. Léelo antes de trabajar en este repo.

## Qué es

Frontend de **ContentOS**, una plataforma SaaS **multi-tenant** para community managers y
agencias de marketing. Stack: **React 18 + Vite + TypeScript**, **Tailwind CSS** (componentes
estilo shadcn), **React Router**, **TanStack Query** y autenticación con **Clerk**.

El backend está en un repo separado: `marketing-backend` (NestJS, API en `/api`, Swagger en
`/api/docs` — ese es el contrato).

## Convención de nomenclatura (OBLIGATORIA)

**Todo el código se nombra en español**: carpetas, componentes, hooks, variables, funciones.
En inglés solo: palabras clave del lenguaje/framework, paquetes npm de terceros y APIs externas
(Clerk). Componentes en `PascalCase`, variables/funciones en `camelCase`, carpetas/archivos en
`kebab-case` (salvo componentes `.tsx` que pueden ir en `PascalCase`).

## Arquitectura

- **Carpetas por funcionalidad** en `src/funcionalidades/` (ej. `clientes/`, `calendario/`).
- **`src/lib/clienteApi.ts`**: cliente HTTP que adjunta a cada petición el token de Clerk y el
  header `x-organizacion-id`. No llames `fetch` directo: usá este cliente.
- **`src/contexto/`**: `OrganizacionProvider` crea el cliente de API y resuelve la organización
  activa. Obtené el cliente con el hook `useApi()` y la organización con `useOrganizacion()`
  (ambos desde `@/contexto/contexto-organizacion`).
- **Estado de servidor con TanStack Query**: usá `useQuery`/`useMutation`, no `useState`+`fetch`.
  Tras una mutación, invalidá las queries afectadas con `queryClient.invalidateQueries`.
- **UI**: componentes base en `src/componentes/ui/` (`Boton`, `Tarjeta`) con `cva` + `cn`.
  Reutilizalos; seguí ese patrón para nuevos componentes.
- **Rutas** en `src/rutas.tsx`. El área autenticada cuelga de `AreaPrivada`
  (`RutaProtegida` + `OrganizacionProvider` + `Layout`). El sidebar y sus secciones están en
  `src/componentes/layout/secciones.ts` — al implementar una sección, marcala `disponible: true`
  y reemplazá su `PaginaProximamente` por la página real.
- Alias de imports: `@/` apunta a `src/`.

## Cómo correr

```bash
npm install
cp .env.example .env          # completar VITE_CLERK_PUBLISHABLE_KEY (pedírselo a masita)
npm run dev                   # http://localhost:5173 (requiere el backend corriendo en :3000)
```

Requiere **Node 20+**. Antes de abrir un PR: `npm run lint` y `npm run build`.

## Flujo de ramas

`main` (producción) ← `develop` (integración) ← `masita/*` y `capitan/*` (trabajo).

```bash
git checkout develop && git pull
git checkout -b capitan/<feature>     # o masita/<feature>
git push -u origin capitan/<feature>  # PR hacia develop, lo revisa el otro
```

Nunca commitees `.env` ni `node_modules` (ya están en `.gitignore`).

## Reparto del trabajo por fase

- **masita**: Fase 1 pantallas de `clientes` + `equipo`; Fase 2 IA de Contenido + Biblioteca de
  Copys; Fase 3 producción + archivos; Fase 4 dashboard por cliente + integraciones.
- **capitan**: Fase 1 editor de `estrategia-marca` + `calendario` (mensual/semanal, estados de
  publicación); Fase 2 IA Estratégica + IA de Campañas + Banco de Ideas; Fase 3 aprobaciones +
  portal del cliente; Fase 4 métricas + informes.

Cada pantalla consume la API del backend según el contrato de Swagger. El plan completo lo tiene
masita; pedíselo si necesitás el detalle.
