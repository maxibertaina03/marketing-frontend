# marketing-frontend — ContentOS

Frontend de **ContentOS**, la plataforma de gestión para agencias de marketing.
Stack: **React + Vite + TypeScript**, **Tailwind CSS** (+ componentes estilo shadcn),
**React Router**, **TanStack Query** y autenticación con **Clerk**.

> Convención del proyecto: **todo el código va nombrado en español** (carpetas, componentes, variables). Ver el plan en `../.claude/plans/`.

## Requisitos

- Node.js 20+
- El backend (`marketing-backend`) corriendo en `http://localhost:3000/api`
- Una app de [Clerk](https://clerk.com) (la misma que usa el backend)

## Puesta en marcha (local)

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
#    Completá VITE_CLERK_PUBLISHABLE_KEY (clave pública de Clerk)
#    y VITE_API_URL si tu backend no está en el puerto 3000.

# 3. Arrancar en modo desarrollo
npm run dev
```

App en `http://localhost:5173`.

## Cómo funciona la autenticación y el multi-tenant

- Clerk maneja login/registro (`/login`, `/registro`).
- `OrganizacionProvider` ([src/contexto/OrganizacionContext.tsx](src/contexto/OrganizacionContext.tsx))
  crea el cliente de API y resuelve la organización activa.
- El cliente de API ([src/lib/clienteApi.ts](src/lib/clienteApi.ts)) adjunta a cada
  petición el `Bearer` token de Clerk y el header `x-organizacion-id`.
- El selector de organización (barra superior) cambia la organización activa.
- Si el usuario no tiene ninguna organización, el panel ofrece crear la primera.

## Estructura

```
src/
  lib/             clienteApi (HTTP), queryClient, utils (cn)
  contexto/        OrganizacionContext (cliente API + organización activa, hook useApi)
  componentes/
    ui/            Boton, Tarjeta (estilo shadcn)
    layout/        Layout (sidebar + barra), secciones del producto, SelectorOrganizacion
    RutaProtegida  Exige sesión de Clerk
  funcionalidades/
    auth/          PaginaLogin, PaginaRegistro
    panel/         PaginaPanel (dashboard) + CrearPrimeraOrganizacion
    comun/         PaginaProximamente (placeholder de secciones futuras)
  rutas.tsx        Definición de rutas
  main.tsx         Providers (Clerk, React Query, Router)
```

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Type-check + build de producción |
| `npm run preview` | Sirve el build |
| `npm run lint` | ESLint + Prettier |

## Flujo de ramas

`main` (producción) ← `develop` (integración) ← `masita/*` y `capitan/*` (trabajo).
PRs hacia `develop`, revisados por el otro integrante. Ver el plan del proyecto.
