import {getPool, sql} from '../../config/db.js';

function crearError(mensaje, status){
    const error = new Error (mensaje);
    error.status = status;
    return error;
}
function validarMonto(monto){
    if(typeof monto !== 'number' || !Number.isFinite(monto) || monto <= 0){
        throw crearError('El monto debe ser un número mayor que 0', 400);
    }
    if(Math.round(monto * 100) / 100 !== monto){
        throw crearError('El monto no puede tener más de 2 decimales', 400);
    }
    if(monto > 9999999999.99 /*creo JAJAJA xd*/){
        throw crearError ('El monto es demasiado grande :D', 400);
    }
}

export async function obtenerSaldo(idUsuario){
    const pool = await getPool();
    const result = await pool.request().input('idUsuario', sql.Int, idUsuario)
    .query(
        `SELECT u.SaldoPrincipal AS saldoPrincipal, 
            ISNULL(
                SUM(
                    CASE WHEN t.Tipo = 'ingresoSaldo' THEN t.Monto END), 
                0) AS totalIngresos, 

            ISNULL(
                SUM(
                    CASE WHEN t.tipo = 'asignacion' THEN t.Monto END), 
                0) AS totalAsignado, 

            ISNULL(
                SUM(
                    CASE WHEN t.Tipo = 'gasto' THEN t.Monto END),
                0) AS totalGastado 

            FROM dbo.Usuario u LEFT JOIN dbo.Transaccion t ON t.IDUsuario = u.IDUsuario 
                WHERE u.IDUsuario = @idUsuario GROUP BY u.SaldoPrincipal`
        );
        if(result.recordset.length === 0){
            throw crearError('Usuario no encontrado', 404);
        }
        return result.recordset[0];
}

export async function registrarIngreso(idUsuario, monto, descripcion){
    validarMonto(monto);
    if(descripcion != null && (typeof descripcion !== 'string' || descripcion.length > 200)){
        throw crearError('La descripcion debe ser texto de maximo 200 caracteres', 400);
    }

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try{
        const actualizado = await new sql.Request(transaction)
        .input('idUsuario', sql.Int, idUsuario)
        .input('monto', sql.Decimal(12,2), monto)
        .query(`UPDATE dbo.Usuario
            SET SaldoPrincipal = SaldoPrincipal + @monto
            WHERE IDUsuario = @idUsuario
            `);
        
        if(actualizado.rowsAffected[0] === 0){
            throw crearError ('Usuario no encontrado', 404);
        }

        await new sql.Request(transaction)
        .input('idUsuario', sql.Int, idUsuario)
        .input('monto', sql.Decimal (12,2), monto)
        .input('descripcion', sql.VarChar(200), descripcion?.trim()||null)
        .query(`INSERT INTO dbo.Transaccion(IDUsuario, IDCategoria, Tipo, Monto, Descripcion) VALUES (@idUsuario, NULL, 'ingresoSaldo', @monto, @descripcion)`);
        
        await transaction.commit();
    } catch(error){
        await transaction.rollback();
        throw error;
    }
    return obtenerSaldo(idUsuario);
}
