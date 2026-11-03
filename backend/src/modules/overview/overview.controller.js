import { getPool, sql } from '../../config/db.js';

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
 * 1. Gastos agrupados por Categoría (gráfica de pastel)
 * GET /api/overview/gastos-por-categoria?idUsuario=1
 */
export const getExpensesByCategory = async (req, res) => {
  const { idUsuario } = req.query;
  if (!idUsuario) return res.status(400).json({ mensaje: 'El parámetro idUsuario es requerido.' });

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('IDUsuario', sql.Int, idUsuario)
      .query(`
        SELECT c.Nombre AS categoria, SUM(t.Monto) AS total
        FROM Transaccion t
        INNER JOIN Categoria c ON t.IDCategoria = c.IDCategoria
        WHERE t.IDUsuario = @IDUsuario AND t.Tipo = 'Gasto'
        GROUP BY c.Nombre
        ORDER BY total DESC;
      `);

    const labels = result.recordset.map(item => item.categoria);
    const data = result.recordset.map(item => item.total);
    res.json({ raw: result.recordset, chartData: { labels, data } });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener datos del resumen', error: error.message });
  }
};

/**
 * 2. Comparativa mensual ingresos vs gastos (gráfica de barras)
 * GET /api/overview/resumen-mensual?idUsuario=1&anio=2026
 */
export const getMonthlySummary = async (req, res) => {
  const { idUsuario, anio } = req.query;
  const targetYear = anio || new Date().getFullYear();
  if (!idUsuario) return res.status(400).json({ mensaje: 'El parámetro idUsuario es requerido.' });

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('IDUsuario', sql.Int, idUsuario)
      .input('Anio', sql.Int, targetYear)
      .query(`
        SELECT
          MONTH(Fecha) AS MesNumero,
          DATENAME(MONTH, Fecha) AS MesNombre,
          SUM(CASE WHEN Tipo = 'Ingreso' THEN Monto ELSE 0 END) AS Ingresos,
          SUM(CASE WHEN Tipo = 'Gasto'   THEN Monto ELSE 0 END) AS Gastos
        FROM Transaccion
        WHERE IDUsuario = @IDUsuario AND YEAR(Fecha) = @Anio
        GROUP BY MONTH(Fecha), DATENAME(MONTH, Fecha)
        ORDER BY MesNumero ASC;
      `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar datos mensuales', error: error.message });
  }
};

/**
 * 3. Tarjetas de resumen: saldo, ingresos del mes, gastos del mes, balance
 * GET /api/overview/resumen-tarjetas
 */
export const getResumenTarjetas = async (req, res) => {
  try {
    const pool = await getPool();
    const ahora = new Date();
    const mes  = ahora.getMonth() + 1;
    const anio = ahora.getFullYear();

    const result = await pool.request()
      .input('idUsuario', sql.Int, req.usuario.id)
      .input('mes',       sql.Int, mes)
      .input('anio',      sql.Int, anio)
      .query(`
        SELECT
          u.SaldoPrincipal AS saldo,
          ISNULL(SUM(CASE WHEN t.Tipo = 'ingresoSaldo' AND MONTH(t.Fecha) = @mes AND YEAR(t.Fecha) = @anio THEN t.Monto END), 0) AS ingresosMes,
          ISNULL(SUM(CASE WHEN t.Tipo = 'gasto'        AND MONTH(t.Fecha) = @mes AND YEAR(t.Fecha) = @anio THEN t.Monto END), 0) AS gastosMes
        FROM dbo.Usuario u
        LEFT JOIN dbo.Transaccion t ON t.IDUsuario = u.IDUsuario
        WHERE u.IDUsuario = @idUsuario
        GROUP BY u.SaldoPrincipal
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { saldo, ingresosMes, gastosMes } = result.recordset[0];
    res.json({ saldo, ingresosMes, gastosMes, balanceMes: ingresosMes - gastosMes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 4. Últimos 5 movimientos del usuario
 * GET /api/overview/ultimos-movimientos
 */
export const getUltimosMovimientos = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('idUsuario', sql.Int, req.usuario.id)
      .query(`
        SELECT TOP 5
          t.IDTransaccion,
          t.Tipo,
          t.Monto,
          t.Descripcion,
          t.Fecha,
          c.Nombre AS categoria
        FROM dbo.Transaccion t
        LEFT JOIN dbo.Categoria c ON c.IDCategoria = t.IDCategoria
        WHERE t.IDUsuario = @idUsuario
        ORDER BY t.Fecha DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
