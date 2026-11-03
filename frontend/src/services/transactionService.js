const API_URL = 'http://localhost:3000/api/expenses';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getExpensesService = async () => {
  const response = await fetch(API_URL, { headers: { ...authHeader() } });
  if (!response.ok) throw new Error('Error al obtener gastos');
  return await response.json();
};

export const createExpenseService = async (expenseData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(expenseData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.mensaje);
  return data;
};