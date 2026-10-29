import { useState } from 'react';
import * as profileService from '../../services/profileService';

export default function ChangePasswordForm() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (nueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    setEnviando(true);
    try {
      await profileService.cambiarContrasena(actual, nueva);
      setExito('Contraseña actualizada correctamente');
      setActual('');
      setNueva('');
      setConfirmar('');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const tipo = mostrar ? 'text' : 'password';

  return (
    <div className="perfil-card">
      <h2>Seguridad</h2>
      <form onSubmit={manejarEnvio} className="perfil-form">
        <label>
          Contraseña actual
          <input type={tipo} value={actual} onChange={(e) => setActual(e.target.value)} required />
        </label>
        <label>
          Nueva contraseña
          <input type={tipo} value={nueva} onChange={(e) => setNueva(e.target.value)} required />
        </label>
        <label>
          Confirmar nueva contraseña
          <input type={tipo} value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required />
        </label>

        <label className="perfil-mostrar-check">
          <input type="checkbox" checked={mostrar} onChange={(e) => setMostrar(e.target.checked)} />
          Mostrar contraseñas
        </label>

        {error && <p className="perfil-error" role="alert">{error}</p>}
        {exito && <p className="perfil-exito" role="status">{exito}</p>}

        <button type="submit" disabled={enviando}>{enviando ? 'Actualizando...' : 'Cambiar contraseña'}</button>
      </form>
    </div>
  );
}
