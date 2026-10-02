import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import PerfilPaciente from './pages/PerfilPaciente';
import Etiquetas from './pages/Etiquetas';
import Trocas from './pages/Trocas';
import Escalas from './pages/Escalas';
import Relatorios from './pages/Relatorios';
import Usuarios from './pages/Usuarios';

const ROTAS = [
  { caminho: '/', Pagina: Dashboard },
  { caminho: '/pacientes', Pagina: Pacientes },
  { caminho: '/pacientes/:id', Pagina: PerfilPaciente },
  { caminho: '/etiquetas', Pagina: Etiquetas },
  { caminho: '/trocas', Pagina: Trocas },
  { caminho: '/escalas', Pagina: Escalas },
  { caminho: '/relatorios', Pagina: Relatorios },
  { caminho: '/usuarios', Pagina: Usuarios, somenteAdmin: true },
];

// UI-only guard; the API enforces the same rules server-side.
function RotaProtegida({ children, somenteAdmin = false }) {
  const { usuario, carregando, isAdmin } = useAuth();

  if (carregando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (somenteAdmin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        {ROTAS.map(({ caminho, Pagina, somenteAdmin }) => (
          <Route
            key={caminho}
            path={caminho}
            element={
              <RotaProtegida somenteAdmin={somenteAdmin}>
                <Layout>
                  <Pagina />
                </Layout>
              </RotaProtegida>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
