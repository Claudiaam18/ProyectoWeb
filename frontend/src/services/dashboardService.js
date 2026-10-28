const API_URL = 'http://localhost:3000/api/overview';

export const getExpensesByCategoryService = async (idUsuario) => {
  const response = await fetch(`${API_URL}/gastos-por-categoria?idUsuario=${idUsuario}`);
  if (!response.ok) throw new Error('Error al obtener gastos por categoría');
  return await response.json();
};

export const getMonthlySummaryService = async (idUsuario, anio) => {
  const response = await fetch(`${API_URL}/resumen-mensual?idUsuario=${idUsuario}&anio=${anio}`);
  if (!response.ok) throw new Error('Error al obtener resumen mensual');
  return await response.json();
};

