
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await login(correo, contrasena);
      navigate('/inicio');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="auth-error" role="alert">{error}</p>}

      <label>
        Correo electrónico
        <input id="login-correo" type="email" value={correo}
          onChange={(e) => setCorreo(e.target.value)} autoComplete="email" required />
      </label>

      <label>
        Contraseña
        <input id="login-contrasena" type="password" value={contrasena}
          onChange={(e) => setContrasena(e.target.value)} autoComplete="current-password" required />
      </label>

      <button type="submit" disabled={cargando}>
        {cargando ? 'Ingresando...' : 'Entrar'}
      </button>
    </form>
  );
}
