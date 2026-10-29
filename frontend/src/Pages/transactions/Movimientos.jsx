import { useEffect, useState } from 'react';
import { getExpensesService } from '../../services/transactionService';
import GastoForm from './GastoForm';

export default function Movimientos() {
  const [expenses, setExpenses] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarGastos = async () => {
    try {
      const data = await getExpensesService();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  return (
    <div>
      <h2>Módulo de Movimientos / Gastos</h2>
      
      {/* Formulario integrado */}
      <GastoForm onGastoCreado={cargarGastos} />

      <hr />

      <h3>Historial de Transacciones</h3>
      {cargando ? (
        <p>Cargando transacciones...</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Descripción</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item) => (
              <tr key={item.IDTransaccion}>
                <td>{item.IDTransaccion}</td>
                <td>{item.IDUsuario}</td>
                <td>{item.IDCategoria}</td>
                <td>{item.Tipo}</td>
                <td>Q{item.Monto}</td>
                <td>{item.Descripcion}</td>
                <td>{new Date(item.Fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}