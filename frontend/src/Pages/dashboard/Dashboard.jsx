import { useEffect, useState } from 'react';
import { getExpensesByCategoryService, getMonthlySummaryService } from '../../services/dashboardService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import '../../styles/dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [pieData, setPieData] = useState(null);
  const [barData, setBarData] = useState(null);

  useEffect(() => {
    const idUsuario = 1;

    getExpensesByCategoryService(idUsuario).then((res) => {
      setPieData({
        labels: res.chartData.labels,
        datasets: [{
          label: 'Monto Gastado (Q)',
          data: res.chartData.data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      });
    });

    getMonthlySummaryService(idUsuario, 2026).then((res) => {
      const labels = res.map(i => i.MesNombre);
      const ingresos = res.map(i => i.Ingresos);
      const gastos = res.map(i => i.Gastos);

      setBarData({
        labels,
        datasets: [
          { label: 'Ingresos', data: ingresos, backgroundColor: '#4BC0C0' },
          { label: 'Gastos', data: gastos, backgroundColor: '#FF6384' }
        ]
      });
    });
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Resumen financiero</h1>

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
    </div>
  );
}