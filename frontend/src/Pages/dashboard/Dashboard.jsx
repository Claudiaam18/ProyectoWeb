// IMPORTANTE INSTALAR EL PAQUETE DE MODULOS DE CHART.JS Y REACT-CHART.JS
// Comando:  "npm install chart.js react-chartjs-2"

import { useEffect, useState } from 'react';
import { getExpensesByCategoryService, getMonthlySummaryService } from '../../services/dashboardService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [pieData, setPieData] = useState(null);
  const [barData, setBarData] = useState(null);

  useEffect(() => {
    const idUsuario = 1; // ID de usuario de prueba

    // 1. Cargar Gastos por Categoría
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

    // 2. Cargar Resumen Mensual
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
    <div>
      <h2>Resumen Financiero (Dashboard)</h2>

      <section>
        <h3>Gastos por Categoría</h3>
        {pieData ? <Pie data={pieData} /> : <p>Cargando gráfica...</p>}
      </section>

      <hr />

      <section>
        <h3>Flujo Mensual (Ingresos vs Gastos)</h3>
        {barData ? <Bar data={barData} /> : <p>Cargando gráfica...</p>}
      </section>
    </div>
  );
}