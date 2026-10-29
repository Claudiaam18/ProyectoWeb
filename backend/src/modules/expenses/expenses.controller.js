// src/modules/expenses/expenses.controller.js
import sql from 'mssql';

// Configuración tomada de process.env
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // e.g., 'localhost' o dirección IP
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 1433),
    options: {
        encrypt: false, // Cambiar a true si usas Azure SQL
        trustServerCertificate: true, // Necesario para conexiones locales de desarrollo
    },
};


export const getExpenses = async (req, res) => {
    try {

        const pool = await sql.connect(dbConfig);

        // Consulta simple para obtener todo el historial de transacciones
        const result = await pool.request().query('SELECT * FROM Transaccion ORDER BY Fecha DESC');
        res.json(result.recordset);

    } catch (error) {

        console.error('Error al obtener el historial de gastos:', error);
        res.status(500).json({
            mensaje: 'Error interno al consultar el historial',
            error: error.message
        });

    }
};

export const createExpense = async (req, res) => {
    const { idUsuario, idCategoria, monto, descripcion } = req.body;

    // Validación rápida de parámetros de entrada
    if (!idUsuario || !idCategoria || !monto) {
        return res.status(400).json({
            mensaje: 'Los campos idUsuario, idCategoria y monto son obligatorios.'
        });
    }

    try {

        const pool = await sql.connect(dbConfig);

        // Ejecución del procedimiento almacenado pasando parámetros de forma segura
        const result = await pool.request()
            .input('IDUsuario', sql.Int, idUsuario)
            .input('IDCategoria', sql.Int, idCategoria)
            .input('Monto', sql.Decimal(18, 2), monto)
            .input('Descripcion', sql.VarChar(255), descripcion || '')
            .execute('sp_RegistrarGasto');

        res.status(201).json({
            mensaje: 'Gasto registrado con éxito',
            detalle: result.recordset[0]
        });

    } catch (error) {

        console.error('Error al registrar el gasto:', error);
        // Si el RAISERROR del Stored Procedure salta (ej. Saldo insuficiente), se captura aquí
        res.status(400).json({
            mensaje: 'No se pudo realizar el gasto',
            error: error.message
        });
        
    }
};