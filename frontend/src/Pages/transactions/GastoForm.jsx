import { useState } from 'react';
import { createExpenseService } from '../../services/transactionService';

export default function GastoForm({ onGastoCreado }) {
  const [formData, setFormData] = useState({
    idUsuario: 1, // ID por defecto para pruebas
    idCategoria: '',
    monto: '',
    descripcion: ''
  });
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExpenseService(formData);
      setMensaje('Gasto registrado con éxito');
      setFormData({ idUsuario: 1, idCategoria: '', monto: '', descripcion: '' });
      if (onGastoCreado) onGastoCreado(); // Recargar la lista en Movimientos
    } catch (err) {
      setMensaje(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h3>Registrar Nuevo Gasto</h3>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID Categoría: </label>
          <input type="number" name="idCategoria" value={formData.idCategoria} onChange={handleChange} required />
        </div>
        <div>
          <label>Monto: </label>
          <input type="number" step="0.01" name="monto" value={formData.monto} onChange={handleChange} required />
        </div>
        <div>
          <label>Descripción: </label>
          <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} />
        </div>
        <button type="submit">Guardar Gasto</button>
      </form>
    </div>
  );
}