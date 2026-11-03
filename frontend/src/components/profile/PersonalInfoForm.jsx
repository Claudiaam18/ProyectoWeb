import { useState } from 'react';
import * as profileService from '../../services/profileService';

export default function PersonalInfoForm({ perfil, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(perfil.nombre);
  const [apellido, setApellido] = useState(perfil.apellido);
  const [correo, setCorreo] = useState(perfil.correo);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  async function manejarEnvio(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setExito('');
    try {
      const actualizado = await profileService.actualizarPerfil(nombre, apellido, correo);
      onActualizado(actualizado);
      setExito('Información actualizada correctamente');
      setEditando(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function cancelar() {
    setNombre(perfil.nombre);
    setApellido(perfil.apellido);
    setCorreo(perfil.correo);
    setError('');
    setExito('');
    setEditando(false);
  }

  return (
    <div className="perfil-card">
      <h2>Información personal</h2>

      {!editando ? (
        <>
          <div className="perfil-info-grid">
            <span className="perfil-label">Nombre</span>
            <span>{perfil.nombre} {perfil.apellido}</span>
            <span className="perfil-label">Correo</span>
            <span>{perfil.correo}</span>
            {perfil.fechaRegistro && (
              <>
                <span className="perfil-label">Miembro desde</span>
                <span>{new Date(perfil.fechaRegistro).toLocaleDateString('es-GT')}</span>
              </>
            )}
          </div>
          {exito && <p className="perfil-exito" role="status">{exito}</p>}
          <button onClick={() => setEditando(true)}>Editar información</button>
        </>
      ) : (
        <form onSubmit={manejarEnvio} className="perfil-form">
          <label>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={100} />
          </label>
          <label>
            Apellido
            <input value={apellido} onChange={(e) => setApellido(e.target.value)} required maxLength={100} />
          </label>
          <label>
            Correo electrónico
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required maxLength={200} />
          </label>
          {error && <p className="perfil-error" role="alert">{error}</p>}
          <div className="perfil-botones">
            <button type="submit" disabled={enviando}>{enviando ? 'Guardando...' : 'Guardar cambios'}</button>
            <button type="button" className="perfil-btn-secundario" onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
