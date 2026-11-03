import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await register(nombre, apellido, correo, contrasena);
      setExito(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="auth-error">{error}</p>}
      {exito && <p className="auth-exito">Cuenta creada con éxito. Redirigiendo...</p>}

      <label>
        Nombre
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>
      <label>
        Apellido
        <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
      </label>
      <label>
        Correo electrónico
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
      </label>
      <label>
        Contraseña
        <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
      </label>
      <label>
        Confirmar contraseña
        <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required />
      </label>

      <button type="submit">Registrarme</button>
    </form>
  );
}