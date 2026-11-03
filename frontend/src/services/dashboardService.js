const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/overview`;

function getHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export const getExpensesByCategoryService = async (idUsuario) => {
  const res = await fetch(`${API_URL}/gastos-por-categoria?idUsuario=${idUsuario}`);
  if (!res.ok) throw new Error('Error al obtener gastos por categoría');
  return res.json();
};

export const getMonthlySummaryService = async (idUsuario, anio) => {
  const res = await fetch(`${API_URL}/resumen-mensual?idUsuario=${idUsuario}&anio=${anio}`);
  if (!res.ok) throw new Error('Error al obtener resumen mensual');
  return res.json();
};

export const getResumenTarjetasService = async () => {
  const res = await fetch(`${API_URL}/resumen-tarjetas`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener resumen de tarjetas');
  return res.json();
};

export const getUltimosMovimientosService = async () => {
  const res = await fetch(`${API_URL}/ultimos-movimientos`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error al obtener últimos movimientos');
  return res.json();
};
