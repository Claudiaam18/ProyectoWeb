import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Buscamos si el usuario tiene su "pase VIP" guardado
  const token = localStorage.getItem('token');

  // Si no hay token, lo redirigimos automáticamente a la pantalla de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, mostramos el componente (la página) que intentaba ver
  return children;
}