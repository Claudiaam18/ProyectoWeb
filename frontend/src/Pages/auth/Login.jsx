import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';

export default function Login() {
  // Estados para guardar los datos del formulario
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);

  // Hook para navegar a otras pantallas
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página recargue al enviar el formulario
    setError(null); // Limpiamos errores previos

    try {
      // Llamamos a tu servicio enviando el correo y contraseña
      const respuesta = await login(correo, contrasena);
      console.log("Éxito:", respuesta.mensaje);

      // Si todo sale bien, lo mandamos a la ruta protegida (ej. /balance)
      navigate('/saldo');
    } catch (err) {
      // Si las credenciales son incorrectas, mostramos el error
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}