import { useState } from 'react';

// Sirve para crear una categoría nueva y para renombrar una existente
export default function CategoriaForm({ nombreInicial = '', textoBoton = 'Crear categoría', onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (nombre.trim() === '') {
      setError('El nombre es obligatorio');
      return;
    }

    setEnviando(true);
    setError('');
    try {
      await onGuardar(nombre.trim());
      setNombre(nombreInicial);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio}>
      <label>
        Nombre
        <input
          type="text"
          maxLength={50}
          placeholder="Ej. Alimentación"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? 'Guardando...' : textoBoton}
      </button>
      {onCancelar && (
        <button type="button" onClick={onCancelar}>Cancelar</button>
      )}
    </form>
  );
}
