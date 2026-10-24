
import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Outlet,
  Navigate
} from 'react-router-dom';
import './App.css';
import './styles/categories.css';

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
      <div className="bienvenida-contenido">

        <h1>Cartera Digital</h1>

        {vista === 'bienvenida' && (
          <>
            <h2>¡Bienvenido!</h2>
            <p>Tu dinero, tus metas, tu tranquilidad.</p>

            <button onClick={() => setVista('login')}>
              Iniciar sesión
            </button>

            <button onClick={() => setVista('registro')}>
              Crear cuenta
            </button>
          </>
        )}

        {vista === 'login' && (
          <>
            <Login />

            <button onClick={() => setVista('registro')}>
              ¿No tienes cuenta? Regístrate
            </button>

            <button onClick={() => setVista('bienvenida')}>
              Volver
            </button>
          </>
        )}

        {vista === 'registro' && (
          <>
            <Registro />

            <button onClick={() => setVista('login')}>
              ¿Ya tienes cuenta? Inicia sesión
            </button>

            <button onClick={() => setVista('bienvenida')}>
              Volver
            </button>
          </>
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

        {/* Pantalla principal */}
        <Route
          path="/"
          element={<Bienvenida />}
        />

        {/* Compatibilidad con rutas anteriores */}
        <Route
          path="/login"
          element={<Bienvenida vistaInicial="login" />}
        />

        <Route
          path="/registro"
          element={<Bienvenida vistaInicial="registro" />}
        />

        {/* Páginas de los demás compañeros */}
        <Route element={<Layout />}>
          <Route path="/inicio" element={<Dashboard />} />
          <Route path="/saldo" element={<Saldo />} />
          
          <Route path="/categorias" element={
            <div className="categorias-page"><Categorias /></div>} />

          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
