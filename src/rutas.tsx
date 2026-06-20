import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AreaPrivada } from '@/componentes/AreaPrivada';
import { PaginaLogin } from '@/funcionalidades/auth/PaginaLogin';
import { PaginaRegistro } from '@/funcionalidades/auth/PaginaRegistro';
import { PaginaPanel } from '@/funcionalidades/panel/PaginaPanel';
import { PaginaClientes } from '@/funcionalidades/clientes/PaginaClientes';
import { FichaCliente } from '@/funcionalidades/clientes/FichaCliente';
import { PaginaEquipo } from '@/funcionalidades/equipo/PaginaEquipo';
import { PaginaEstrategia } from '@/funcionalidades/estrategia-marca/PaginaEstrategia';
import { PaginaCalendario } from '@/funcionalidades/calendario/PaginaCalendario';
import { PaginaProximamente } from '@/funcionalidades/comun/PaginaProximamente';

export const router = createBrowserRouter([
  { path: '/login', element: <PaginaLogin /> },
  { path: '/registro', element: <PaginaRegistro /> },
  {
    path: '/',
    element: <AreaPrivada />,
    children: [
      { index: true, element: <Navigate to="/panel" replace /> },
      { path: 'panel', element: <PaginaPanel /> },
      { path: 'clientes', element: <PaginaClientes /> },
      { path: 'clientes/:id', element: <FichaCliente /> },
      { path: 'estrategia', element: <PaginaEstrategia /> },
      { path: 'calendario', element: <PaginaCalendario /> },
      { path: 'ia', element: <PaginaProximamente titulo="Centro de IA" /> },
      { path: 'ideas', element: <PaginaProximamente titulo="Banco de ideas" /> },
      { path: 'biblioteca-copys', element: <PaginaProximamente titulo="Biblioteca de copys" /> },
      { path: 'campanias', element: <PaginaProximamente titulo="Campañas" /> },
      { path: 'aprobaciones', element: <PaginaProximamente titulo="Aprobaciones" /> },
      { path: 'archivos', element: <PaginaProximamente titulo="Archivos" /> },
      { path: 'metricas', element: <PaginaProximamente titulo="Métricas" /> },
      { path: 'equipo', element: <PaginaEquipo /> },
    ],
  },
  { path: '*', element: <Navigate to="/panel" replace /> },
]);
