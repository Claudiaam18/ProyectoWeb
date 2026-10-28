import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

/**
 * 1. Datos para Gráfica de Pastel / Dona: Gastos agrupados por Categoría
 * Endpoint: GET /api/overview/expenses-by-category?idUsuario=1
 */
export const getExpensesByCategory = async (req, res) => {
  const { idUsuario } = req.query;

  if (!idUsuario) {
    return res.status(400).json({ mensaje: 'El parámetro idUsuario es requerido.' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    
    // Suma todos los gastos agrupados por categoría para el usuario
    const query = `
      SELECT 
        c.Nombre AS categoria,
        SUM(t.Monto) AS total
      FROM Transaccion t
      INNER JOIN Categoria c ON t.IDCategoria = c.IDCategoria
      WHERE t.IDUsuario = @IDUsuario 
        AND t.Tipo = 'Gasto'
      GROUP BY c.Nombre
      ORDER BY total DESC;
    `;

    const result = await pool.request()
      .input('IDUsuario', sql.Int, idUsuario)
      .query(query);

    // Formateamos para consumir directo en React (labels y data)
    const labels = result.recordset.map(item => item.categoria);
    const data = result.recordset.map(item => item.total);

    res.json({
      raw: result.recordset, // Formato [{ categoria: 'Comida', total: 500 }]
      chartData: { labels, data } // Formato directo para librerías de gráficas
    });

  } catch (error) {
    console.error('Error al obtener gastos por categoría:', error);
    res.status(500).json({ mensaje: 'Error al obtener datos del resumen', error: error.message });
  }
};

/**
 * 2. Datos para Gráfica de Barras / Líneas: Comparativa Mensual Ingresos vs Gastos
 * Endpoint: GET /api/overview/monthly-summary?idUsuario=1&anio=2026
 */
export const getMonthlySummary = async (req, res) => {
  const { idUsuario, anio } = req.query;
  const targetYear = anio || new Date().getFullYear();

  if (!idUsuario) {
    return res.status(400).json({ mensaje: 'El parámetro idUsuario es requerido.' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    const query = `
      SELECT 
        MONTH(Fecha) AS MesNumero,
        DATENAME(MONTH, Fecha) AS MesNombre,
        SUM(CASE WHEN Tipo = 'Ingreso' THEN Monto ELSE 0 END) AS Ingresos,
        SUM(CASE WHEN Tipo = 'Gasto' THEN Monto ELSE 0 END) AS Gastos
      FROM Transaccion
      WHERE IDUsuario = @IDUsuario 
        AND YEAR(Fecha) = @Anio
      GROUP BY MONTH(Fecha), DATENAME(MONTH, Fecha)
      ORDER BY MesNumero ASC;
    `;

    const result = await pool.request()
      .input('IDUsuario', sql.Int, idUsuario)
      .input('Anio', sql.Int, targetYear)
      .query(query);

    res.json(result.recordset);

  } catch (error) {
    console.error('Error al obtener el resumen mensual:', error);
    res.status(500).json({ mensaje: 'Error al consultar datos mensuales', error: error.message });
  }
};