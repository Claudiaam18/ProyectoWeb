import { useState } from 'react';
import * as balanceService from '../../services/balanceService';

export default function IngresoForm({ onIngresoRegistrado }) {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function manejarEnvio(evento) {
    evento.preventDefault();
    const montoNumero = Number(monto);

    if (!montoNumero || montoNumero <= 0) {
      setError('Ingresa un monto mayor que 0');
      return;
    }

    // El botón queda desactivado mientras se envía, así un doble clic no duplica el ingreso
    setEnviando(true);
    setError('');
    try {
      const saldoNuevo = await balanceService.registrarIngreso(montoNumero, descripcion.trim());
      onIngresoRegistrado(saldoNuevo);
      setMonto('');
      setDescripcion('');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio}>
      <label>
        Monto (Q)
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
      </label>

      <label>
        Descripción
        <input
          type="text"
          maxLength={200}
          placeholder="Ej. Sueldo de octubre"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Registrar ingreso'}
      </button>
    </form>
  );
}
