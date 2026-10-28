import { useEffect, useState } from "react";
import * as balanceService from '../../services/balanceService';
import IngresoForm from './IngresoForm';
import '../../styles/saldo.css';

const formatoQuetzales = new Intl.NumberFormat('es-GT', {style: 'currency', currency : 'GTQ'});

export default function Saldo(){
  const [saldo, setSaldo] = useState (null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    balanceService.obtenerSaldo().then(setSaldo).catch((err) => setError(err.message)).finally(()=> setCargando(false));
  }, []);

  if (cargando) return <p>Cargando saldo</p>;

  if (error) return <p role="alert">{error}</p>;

  return (
    <section className="saldo-page">
      <h1>Saldo e ingresos</h1>

      <div className="saldo-resumen">
        <p>Dinero sin asignar: <strong>{formatoQuetzales.format(saldo.saldoPrincipal)}</strong></p>
        <p>Total de ingresos: {formatoQuetzales.format(saldo.totalIngresos)}</p>
        <p>Asignado a categorías: {formatoQuetzales.format(saldo.totalAsignado)}</p>
        <p>Total gastado: {formatoQuetzales.format(saldo.totalGastado)}</p>
      </div>

      <div className="nuevo-ingreso-wrapper">
        <h2>Registrar ingreso</h2>
        <IngresoForm onIngresoRegistrado={setSaldo} />
      </div>
    </section>
  );
}