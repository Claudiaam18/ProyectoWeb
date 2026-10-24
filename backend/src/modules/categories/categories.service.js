import { getPool, sql } from '../../config/db.js';

function crearError (mensaje, status){
    const error = new Error (mensaje);
    error.status = status;
    return error;
}

function validarId(idCategoria){
    if(!Number.isInteger(idCategoria) || idCategoria <=0){
        throw crearError('Categoria no valida', 400);
    }
}

function validarNombre(nombre){
    if(typeof nombre !== 'string' || nombre.trim() === ''){
        throw crearError('El nombre es obligatorio', 400);
    }
    if(nombre.trim().length > 50){
        throw crearError ('El nombre no puede pasar de 50 caracteres', 400);
    }
    return nombre.trim();
}

function validarMonto(monto){
    if(typeof monto !== 'number' || !Number.isFinite(monto) || monto <= 0){
        throw crearError('El monto debe ser un numero mayor que 0', 400);

    }
    if(Math.round(monto * 100) / 100 !== monto){
        throw crearError('El monto no puede tener mas de 2 decimales', 400);
    }
}

function esNombreDuplicado(error){
    return error.number === 2601 || error.number === 2627;
}

const CONSULTA_CATEGORIAS = `
    SELECT c.IDCategoria AS id,
        c.Nombre AS nombre,
        c.FechaCreacion AS fechaCreacion,
        c.SaldoDisponible AS disponible,
        ISNULL(SUM(CASE WHEN t.Tipo = 'asignacion' THEN t.Monto END), 0) AS asignado,
        ISNULL(SUM(CASE WHEN t.Tipo = 'gasto' THEN t.Monto END), 0) AS gastado
        FROM dbo.Categoria c 
        LEFT JOIN dbo.Transaccion t ON t.IDCategoria = c.IDCategoria
        WHERE c.IDUsuario = @idUsuario AND c.Activo = 1`;

const AGRUPAR = ' GROUP BY c.IDCategoria, c.Nombre, c.FechaCreacion, c.SaldoDisponible';

export async function listarCategorias(idUsuario){
    const pool = await getPool();
    const result = await pool.request()
        .input('idUsuario', sql.Int, idUsuario)
        .query(CONSULTA_CATEGORIAS + AGRUPAR + ' ORDER BY c.Nombre');
    return result.recordset;
}

export async function obtenerCategoria(idUsuario, idCategoria){
    validarId(idCategoria);
    const pool = await getPool();
    const result = await pool.request()
    .input('idUsuario', sql.Int, idUsuario)
    .input('idCategoria', sql.Int, idCategoria)
    .query(CONSULTA_CATEGORIAS + ' AND c.IDCategoria = @idCategoria' + AGRUPAR);

    if(result.recordset.length === 0){
        throw crearError('Categoria no encontrada', 404);
    }
    return result.recordset[0];
}

export async function crearCategoria(idUsuario, nombre){
    const nombreLimpio = validarNombre(nombre);
    const pool = await getPool();
    let idNuevo;

    try{
        const result = await pool.request()
        .input ('idUsuario', sql.Int, idUsuario)
        .input ('nombre', sql.VarChar(50), nombreLimpio)
        .query(`INSERT INTO dbo.Categoria(IDUsuario, Nombre) OUTPUT INSERTED.IDCategoria AS id VALUES (@idUsuario, @nombre)`);
        idNuevo = result.recordset[0].id;
    } catch (error){
        if(esNombreDuplicado(error)){
            throw crearError ('Ya tienes una categoria con ese nombre, checa eso pls', 409);
        }
        throw error;
    }
    return obtenerCategoria(idUsuario, idNuevo);
}

export async function editarCategoria(idUsuario, idCategoria, nombre){
    validarId(idCategoria);
    const nombreLimpio = validarNombre(nombre);
    const pool = await getPool();
    let result;
    
    try{
        result = await pool.request()
        .input('idUsuario', sql.Int, idUsuario)
        .input('idCategoria', sql.Int, idCategoria)
        .input('nombre', sql.VarChar(50), nombreLimpio)
        .query(`
            UPDATE dbo.Categoria SET Nombre = @nombre 
            WHERE IDCategoria = @idCategoria AND IDUsuario = @idUsuario AND Activo = 1`);
            
    } catch (error){
        if(esNombreDuplicado(error)){
            throw crearError('Ya tienes una categoria con ese nombre', 409);
        }
        throw error;
    }

    if(result.rowsAffected[0] === 0){
        throw crearError ('Categoria no encontrada', 404);
    }
    return obtenerCategoria(idUsuario, idCategoria);
}

export async function desactivarCategoria(idUsuario, idCategoria){
    await obtenerCategoria(idUsuario, idCategoria);

    const pool = await getPool();
    const result = await pool.request()
    .input('idUsuario', sql.Int, idUsuario)
    .input('idCategoria', sql.Int, idCategoria)
    .query(`UPDATE dbo.Categoria 
            SET Activo = 0
            WHERE IDCategoria = @idCategoria AND IDUsuario = @idUsuario AND Activo = 1 AND SaldoDisponible = 0`);

    if(result.rowsAffected[0] === 0){
        throw crearError('No se puede desactivar: la categoria todavia tiene dinero disponible', 409);
    }
}

export async function asignarPresupuesto(idUsuario, idCategoria, monto, descripcion){
    validarId (idCategoria);
    validarMonto(monto);

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try{
        const categoria = await new sql.Request(transaction)
        .input ('idUsuario', sql.Int, idUsuario)
        .input ('idCategoria', sql.Int, idCategoria)
        .input ('monto', sql.Decimal(12,2), monto)
        .query(`UPDATE dbo.Categoria SET SaldoDisponible = SaldoDisponible + @monto WHERE IDCategoria = @idCategoria AND IDUsuario = @idUsuario AND Activo =1`);

        if(categoria.rowsAffected[0] === 0){
            throw crearError('Categoria no encontrada', 404);
        }

        const usuario = await new sql.Request(transaction)
        .input('idUsuario', sql.Int, idUsuario)
        .input('monto', sql.Decimal(12,2), monto)
        .query(`UPDATE dbo.Usuario
                SET SaldoPrincipal = SaldoPrincipal - @monto
                WHERE IDUsuario = @idUsuario AND SaldoPrincipal >= @monto
                `);
        
        if(usuario.rowsAffected[0] === 0) {
            throw crearError('No tiene suficiente dinero sin asignar', 400);
        }
        
        await new sql.Request(transaction)
        .input('idUsuario', sql.Int, idUsuario)
        .input('idCategoria', sql.Int, idCategoria)
        .input('monto', sql.Decimal(12,2), monto)
        .input('descripcion', sql.VarChar(200), typeof descripcion === 'string' ? descripcion.trim().slice(0,200) || null:null)
        .query (`INSERT INTO dbo.Transaccion(IDUsuario, IDCategoria, Tipo, Monto, Descripcion) VALUES (@idUsuario, @idCategoria, 'asignacion', @monto, @descripcion)`);

        await transaction.commit();

    }  catch (error){
        await transaction.rollback();
        throw error;
    }
    return obtenerCategoria(idUsuario, idCategoria);
}