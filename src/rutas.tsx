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
import { PaginaIaEstrategia } from '@/funcionalidades/ia-estrategia/PaginaIaEstrategia';
import { PaginaBancoIdeas } from '@/funcionalidades/banco-ideas/PaginaBancoIdeas';
import { PaginaIaCampanas } from '@/funcionalidades/ia-campanas/PaginaIaCampanas';
import { PaginaProduccion } from '@/funcionalidades/produccion/PaginaProduccion';
import { PaginaArchivos } from '@/funcionalidades/archivos/PaginaArchivos';
import { PaginaAprobaciones } from '@/funcionalidades/aprobaciones/PaginaAprobaciones';
import { PaginaPortalCliente } from '@/funcionalidades/portal-cliente/PaginaPortalCliente';
import { PaginaDashboard } from '@/funcionalidades/dashboard/PaginaDashboard';
import { PaginaIaMetricas } from '@/funcionalidades/ia-metricas/PaginaIaMetricas';
import { PaginaInformes } from '@/funcionalidades/informes/PaginaInformes';

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
      { path: 'ia', element: <PaginaIaEstrategia /> },
      { path: 'ideas', element: <PaginaBancoIdeas /> },
      { path: 'biblioteca-copys', element: <PaginaProximamente titulo="Biblioteca de copys" /> },
      { path: 'campanias', element: <PaginaIaCampanas /> },
      { path: 'produccion', element: <PaginaProduccion /> },
      { path: 'aprobaciones', element: <PaginaAprobaciones /> },
      { path: 'portal-cliente', element: <PaginaPortalCliente /> },
      { path: 'archivos', element: <PaginaArchivos /> },
      { path: 'metricas', element: <PaginaDashboard /> },
      { path: 'ia-metricas', element: <PaginaIaMetricas /> },
      { path: 'informes', element: <PaginaInformes /> },
      { path: 'equipo', element: <PaginaEquipo /> },
    ],
  },
  { path: '*', element: <Navigate to="/panel" replace /> },
]);
