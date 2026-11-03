import { useState, useEffect } from 'react';
import { createExpenseService } from '../../services/transactionService';
import { listarCategorias } from '../../services/categoryService';

export default function GastoForm({ onGastoCreado }) {
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    idCategoria: '',
    monto: '',
    descripcion: ''
  });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExpenseService(formData);
      setMensaje('Gasto registrado con éxito');
      setFormData({ idCategoria: '', monto: '', descripcion: '' });
      if (onGastoCreado) onGastoCreado();
    } catch (err) {
      setMensaje(`Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Categoría
        <select name="idCategoria" value={formData.idCategoria} onChange={handleChange} required>
          <option value="">Selecciona una categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </label>
      <label>
        Monto
        <input type="number" step="0.01" name="monto" value={formData.monto} onChange={handleChange} required />
      </label>
      <label>
        Descripción
        <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} />
      </label>
      {mensaje && <p className={mensaje.startsWith('Error') ? 'perfil-error' : 'movimientos-exito'}>{mensaje}</p>}
      <button type="submit">Guardar gasto</button>
    </form>
  );
}