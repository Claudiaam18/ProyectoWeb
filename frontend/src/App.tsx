import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Login from './Pages/auth/Login';
import Registro from './Pages/auth/Registro';
import Perfil from './Pages/profile/Perfil';
import Saldo from './Pages/balance/Saldo';
import Categorias from './Pages/categories/Categorias';
import Movimientos from './Pages/transactions/Movimientos';
import Dashboard from './Pages/dashboard/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <nav aria-label="Navegación principal">
        <Link to="/">Login</Link>{' | '}
        <Link to="/registro">Registro</Link>{' | '}
        <Link to="/inicio">Inicio</Link>{' | '}
        <Link to="/saldo">Saldo</Link>{' | '}
        <Link to="/categorias">Categorías</Link>{' | '}
        <Link to="/movimientos">Movimientos</Link>{' | '}
        <Link to="/perfil">Perfil</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/inicio" element={<Dashboard />} />
          <Route path="/saldo" element={<Saldo />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<h1>Página no encontrada</h1>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}