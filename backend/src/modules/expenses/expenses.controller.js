import { getPool, sql } from '../../config/db.js';

export const getExpenses = async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('idUsuario', sql.Int, req.usuario.id)
            .query(`
                SELECT t.IDTransaccion, t.Tipo, t.Monto, t.Descripcion, t.Fecha,
                       c.Nombre AS categoria
                FROM dbo.Transaccion t
                LEFT JOIN dbo.Categoria c ON c.IDCategoria = t.IDCategoria
                WHERE t.IDUsuario = @idUsuario
                ORDER BY t.Fecha DESC
            `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener transacciones', error: error.message });
    }
};

export const createExpense = async (req, res) => {
    const { idCategoria, monto, descripcion } = req.body;

    if (!idCategoria || !monto) {
        return res.status(400).json({ mensaje: 'Los campos idCategoria y monto son obligatorios.' });
    }

    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
        return res.status(400).json({ mensaje: 'El monto debe ser un número mayor que 0.' });
    }

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const catResult = await new sql.Request(transaction)
            .input('idUsuario', sql.Int, req.usuario.id)
            .input('idCategoria', sql.Int, Number(idCategoria))
            .input('monto', sql.Decimal(12, 2), montoNum)
            .query(`
                UPDATE dbo.Categoria
                SET SaldoDisponible = SaldoDisponible - @monto
                WHERE IDCategoria = @idCategoria AND IDUsuario = @idUsuario
                  AND Activo = 1 AND SaldoDisponible >= @monto
            `);

        if (catResult.rowsAffected[0] === 0) {
            throw { status: 400, message: 'Saldo insuficiente en la categoría o categoría no encontrada.' };
        }

        await new sql.Request(transaction)
            .input('idUsuario', sql.Int, req.usuario.id)
            .input('idCategoria', sql.Int, Number(idCategoria))
            .input('monto', sql.Decimal(12, 2), montoNum)
            .input('descripcion', sql.VarChar(200), descripcion?.toString().trim() || null)
            .query(`
                INSERT INTO dbo.Transaccion (IDUsuario, IDCategoria, Tipo, Monto, Descripcion)
                VALUES (@idUsuario, @idCategoria, 'gasto', @monto, @descripcion)
            `);

        await transaction.commit();
        res.status(201).json({ mensaje: 'Gasto registrado con éxito' });
    } catch (error) {
        await transaction.rollback();
        res.status(error.status || 500).json({ mensaje: error.message || 'No se pudo registrar el gasto' });
    }
};
