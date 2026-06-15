import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import PrivateRoute from './PrivateRoute';
import RestrictedRoute from './RestrictedRoute';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const FuncionarioList = lazy(() => import('../pages/FuncionarioList'));
const FuncionarioForm = lazy(() => import('../pages/FuncionarioForm'));
const ClienteList = lazy(() => import('../pages/ClienteList'));
const ClienteForm = lazy(() => import('../pages/ClienteForm'));
const ProdutoList = lazy(() => import('../pages/ProdutoList'));
const ProdutoForm = lazy(() => import('../pages/ProdutoForm'));
const ComandaList = lazy(() => import('../pages/ComandaList'));
const ComandaForm = lazy(() => import('../pages/ComandaForm'));
const CaixaDashboard = lazy(() => import('../pages/Caixa/CaixaDashboard'));
const CaixaConferencia = lazy(() => import('../pages/Caixa/CaixaConferencia'));
const CaixaComprovante = lazy(() => import('../pages/Caixa/CaixaComprovante'));
const CaixaHistorico = lazy(() => import('../pages/Caixa'));
const Perfil = lazy(() => import('../pages/Perfil'));
const LoginForm = lazy(() => import('../components/forms/LoginForm'));
const NotFound = lazy(() => import('../pages/NotFound'));

const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
    <CircularProgress sx={{ color: '#f59e0b' }} />
  </Box>
);

const AppRoutes = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Restritas - somente sem login */}
      <Route
        path="/login"
        element={
          <RestrictedRoute>
            <LoginForm />
          </RestrictedRoute>
        }
      />

      {/* Protegidas */}
      <Route path="/home" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/funcionarios" element={<PrivateRoute><FuncionarioList /></PrivateRoute>} />
      <Route path="/funcionario" element={<PrivateRoute><FuncionarioForm /></PrivateRoute>} />
      <Route path="/funcionario/:id" element={<PrivateRoute><FuncionarioForm /></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><ClienteList /></PrivateRoute>} />
      <Route path="/cliente" element={<PrivateRoute><ClienteForm /></PrivateRoute>} />
      <Route path="/cliente/:id" element={<PrivateRoute><ClienteForm /></PrivateRoute>} />
      <Route path="/produtos" element={<PrivateRoute><ProdutoList /></PrivateRoute>} />
      <Route path="/produto" element={<PrivateRoute><ProdutoForm /></PrivateRoute>} />
      <Route path="/produto/:id" element={<PrivateRoute><ProdutoForm /></PrivateRoute>} />
      <Route path="/comandas" element={<PrivateRoute><ComandaList /></PrivateRoute>} />
      <Route path="/comanda" element={<PrivateRoute><ComandaForm /></PrivateRoute>} />
      <Route path="/comanda/:id" element={<PrivateRoute><ComandaForm /></PrivateRoute>} />
      <Route path="/caixa" element={<PrivateRoute><CaixaDashboard /></PrivateRoute>} />
      <Route path="/caixa/conferencia" element={<PrivateRoute><CaixaConferencia /></PrivateRoute>} />
      <Route path="/caixa/comprovante/:id" element={<PrivateRoute><CaixaComprovante /></PrivateRoute>} />
      <Route path="/caixa/historico" element={<PrivateRoute><CaixaHistorico /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
