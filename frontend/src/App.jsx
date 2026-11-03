import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Outlet,
  Navigate
} from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';

import './App.css';
import './styles/categories.css';
import './styles/bienvenida.css';

import Login from './Pages/auth/Login';
import Registro from './Pages/auth/Registro';
import Perfil from './Pages/profile/Perfil';
import Saldo from './Pages/balance/Saldo';
import Categorias from './Pages/categories/Categorias';
import Movimientos from './Pages/transactions/Movimientos';
import Dashboard from './Pages/dashboard/Dashboard';

function Bienvenida({ vistaInicial = 'bienvenida' }) {
  const [vista, setVista] = useState(vistaInicial);

  return (
    <div className="bienvenida">

      {/* ENCABEZADO con botones arriba */}
      <header className="bienvenida-header">
        <div className="bienvenida-logo">
          <span className="bienvenida-logo-icon">💳</span>
          <span>Cartera Digital</span>
        </div>
        <nav className="bienvenida-nav">
          <button className="btn-login" onClick={() => setVista('login')}>Iniciar sesión</button>
          <button className="btn-registro" onClick={() => setVista('registro')}>Crear cuenta</button>
        </nav>
      </header>

      {/* CONTENIDO CENTRAL */}
      <div className="bienvenida-contenido">

        {vista === 'bienvenida' && (
          <>
            <h1 className="bienvenida-titulo">Cartera Digital</h1>
            <p className="bienvenida-subtitulo">Tu dinero, tus metas, tu tranquilidad.</p>
          </>
        )}

        {vista === 'login' && (
          <div className="bienvenida-card auth-form">
            <h2>Iniciar sesión</h2>
            <Login />
          </div>
        )}

        {vista === 'registro' && (
          <div className="bienvenida-card auth-form">
            <h2>Crear cuenta</h2>
            <Registro />
          </div>
        )}

      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">💳</span>
          <span>Cartera Digital</span>
        </div>

        <nav className="app-nav" aria-label="Navegación principal">
          <NavLink to="/inicio">Inicio</NavLink>
          <NavLink to="/saldo">Saldo</NavLink>
          <NavLink to="/categorias">Categorías</NavLink>
          <NavLink to="/movimientos">Movimientos</NavLink>
          <NavLink to="/perfil">Mi perfil</NavLink>
        </nav>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Bienvenida />} />
        <Route path="/login" element={<Bienvenida vistaInicial="login" />} />
        <Route path="/registro" element={<Bienvenida vistaInicial="registro" />} />

        {/* Rutas privadas con el diseño original */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/inicio" element={<Dashboard />} />
          <Route path="/saldo" element={<Saldo />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}