import { useEffect, useState } from 'react';
import { getExpensesService } from '../../services/transactionService';
import GastoForm from './GastoForm';
import '../../styles/movimientos.css';

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
    <div className="movimientos-page">
      <h1>Movimientos</h1>

      <div className="nuevo-gasto-wrapper">
        <h2>Registrar nuevo gasto</h2>
        <GastoForm onGastoCreado={cargarGastos} />
      </div>

      <div className="movimientos-tabla-wrapper">
        <h2>Historial de transacciones</h2>
        {cargando ? (
          <p>Cargando transacciones...</p>
        ) : (
          <table>
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
    </div>
  );
}