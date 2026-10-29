import { useState } from 'react';
import * as profileService from '../../services/profileService';

export default function ProfilePreferences({ preferencias, onActualizado }) {
  const [moneda, setMoneda] = useState(preferencias.moneda ?? 'GTQ');
  const [tema, setTema] = useState(preferencias.tema ?? 'claro');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  async function manejarEnvio(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setExito('');
    try {
      const prefs = await profileService.actualizarPreferencias(moneda, tema);
      onActualizado(prefs);
      setExito('Preferencias guardadas correctamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="perfil-card">
      <h2>Preferencias</h2>
      <form onSubmit={manejarEnvio} className="perfil-form">
        <label>
          Moneda
          <select value={moneda} onChange={(e) => setMoneda(e.target.value)}>
            <option value="GTQ">Quetzal (GTQ)</option>
            <option value="USD">Dólar (USD)</option>
          </select>
        </label>

        <label>
          Tema
          <select value={tema} onChange={(e) => setTema(e.target.value)}>
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
          </select>
        </label>

        {error && <p className="perfil-error" role="alert">{error}</p>}
        {exito && <p className="perfil-exito" role="status">{exito}</p>}

        <button type="submit" disabled={enviando}>{enviando ? 'Guardando...' : 'Guardar preferencias'}</button>
      </form>
    </div>
  );
}
