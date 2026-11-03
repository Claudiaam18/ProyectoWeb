import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getExpensesByCategoryService,
  getMonthlySummaryService,
  getResumenTarjetasService,
  getUltimosMovimientosService,
} from '../../services/dashboardService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import '../../styles/dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const fmt = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' });

function etiquetarFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy';
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer';
  return fecha.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const [tarjetas, setTarjetas]       = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [pieData, setPieData]         = useState(null);
  const [barData, setBarData]         = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const idUsuario = 1;

    getResumenTarjetasService().then(setTarjetas).catch(console.error);
    getUltimosMovimientosService().then(setMovimientos).catch(console.error);

    getExpensesByCategoryService(idUsuario).then((res) => {
      setPieData({
        labels: res.chartData.labels,
        datasets: [{ label: 'Monto Gastado (Q)', data: res.chartData.data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }],
      });
    }).catch(console.error);

    getMonthlySummaryService(idUsuario, new Date().getFullYear()).then((res) => {
      setBarData({
        labels: res.map(i => i.MesNombre),
        datasets: [
          { label: 'Ingresos', data: res.map(i => i.Ingresos), backgroundColor: '#4BC0C0' },
          { label: 'Gastos',   data: res.map(i => i.Gastos),   backgroundColor: '#FF6384' },
        ],
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Resumen financiero</h1>
      <p className="dashboard-subtitulo">Consulta el estado de tus finanzas</p>

      {/* ── TARJETAS DE RESUMEN ── */}
      <div className="dashboard-tarjetas">
        <div className="dashboard-tarjeta">
          <span className="dashboard-tarjeta-label">Saldo disponible</span>
          <span className="dashboard-tarjeta-valor">{tarjetas ? fmt.format(tarjetas.saldo) : '—'}</span>
        </div>
        <div className="dashboard-tarjeta">
          <span className="dashboard-tarjeta-label">Ingresos del mes</span>
          <span className="dashboard-tarjeta-valor positivo">{tarjetas ? fmt.format(tarjetas.ingresosMes) : '—'}</span>
        </div>
        <div className="dashboard-tarjeta">
          <span className="dashboard-tarjeta-label">Gastos del mes</span>
          <span className="dashboard-tarjeta-valor negativo">{tarjetas ? fmt.format(tarjetas.gastosMes) : '—'}</span>
        </div>
        <div className="dashboard-tarjeta">
          <span className="dashboard-tarjeta-label">Balance del mes</span>
          <span className={`dashboard-tarjeta-valor ${tarjetas?.balanceMes >= 0 ? 'positivo' : 'negativo'}`}>
            {tarjetas ? `${tarjetas.balanceMes >= 0 ? '+' : ''}${fmt.format(tarjetas.balanceMes)}` : '—'}
          </span>
        </div>
      </div>

      {/* ── ACCIONES RÁPIDAS ── */}
      <div className="dashboard-card">
        <h2>Acciones rápidas</h2>
        <div className="dashboard-acciones">
          <button onClick={() => navigate('/movimientos')}>Registrar gasto</button>
          <button onClick={() => navigate('/saldo')}>Registrar ingreso</button>
          <button onClick={() => navigate('/movimientos')}>Ver movimientos</button>
        </div>
      </div>

      {/* ── GRÁFICAS ── */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Gastos por categoría</h2>
          {pieData ? <Pie data={pieData} /> : <p>Cargando gráfica...</p>}
        </div>
        <div className="dashboard-card">
          <h2>Flujo mensual (Ingresos vs Gastos)</h2>
          {barData ? <Bar data={barData} /> : <p>Cargando gráfica...</p>}
        </div>
      </div>

      {/* ── ÚLTIMOS MOVIMIENTOS ── */}
      <div className="dashboard-card">
        <div className="dashboard-movimientos-header">
          <h2>Últimos movimientos</h2>
          <button className="dashboard-btn-link" onClick={() => navigate('/movimientos')}>Ver todos</button>
        </div>
        {movimientos.length === 0 ? (
          <p className="dashboard-vacio">Sin movimientos recientes</p>
        ) : (
          <ul className="dashboard-movimientos-lista">
            {movimientos.map((m) => {
              const esGasto = m.Tipo === 'gasto';
              return (
                <li key={m.IDTransaccion} className="dashboard-movimiento-item">
                  <div className="dashboard-movimiento-info">
                    <span className="dashboard-movimiento-desc">{m.Descripcion || m.Tipo}</span>
                    <span className="dashboard-movimiento-meta">
                      {m.categoria ?? 'Ingresos'} · {etiquetarFecha(m.Fecha)}
                    </span>
                  </div>
                  <span className={`dashboard-movimiento-monto ${esGasto ? 'negativo' : 'positivo'}`}>
                    {esGasto ? '−' : '+'} {fmt.format(m.Monto)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
