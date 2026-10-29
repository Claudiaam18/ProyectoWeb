import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal_proyecto_web';

// 1. INICIAR SESIÓN
export const loginUser = async (correo, contrasena) => {
    const pool = await getPool();

    // Consultamos la tabla Usuario configurada por la Persona 2
    const resultado = await pool.request()
        .input('correo', sql.VarChar(100), correo)
        .query('SELECT IDUsuario, Nombre, Apellido, Correo, Contrasena, SaldoPrincipal FROM Usuario WHERE Correo = @correo');

    const usuario = resultado.recordset[0];

    if (!usuario) {
        throw new Error('Credenciales inválidas');
    }

    // Comparamos la contraseña usando bcrypt
    const esValida = await bcrypt.compare(contrasena, usuario.Contrasena);
    if (!esValida) {
        throw new Error('Credenciales inválidas');
    }

    const payload = {
        id: usuario.IDUsuario,
        nombre: usuario.Nombre,
        apellido: usuario.Apellido,
        correo: usuario.Correo
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    return {
        token,
        usuario: {
            id: usuario.IDUsuario,
            nombre: usuario.Nombre,
            apellido: usuario.Apellido,
            correo: usuario.Correo,
            saldo: usuario.SaldoPrincipal
        }
    };
};

// 2. CREAR CUENTA
export const registerUser = async (nombre, apellido, correo, contrasena) => {
    const pool = await getPool();

    const usuarioExistente = await pool.request()
        .input('correo', sql.VarChar(100), correo)
        .query('SELECT IDUsuario FROM Usuario WHERE Correo = @correo');

    if (usuarioExistente.recordset.length > 0) {
        throw new Error('El correo electrónico ya está registrado');
    }

    // Hashear la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    // Insertar el nuevo usuario en SQL Server
    await pool.request()
        .input('nombre', sql.VarChar(50), nombre)
        .input('apellido', sql.VarChar(50), apellido)
        .input('correo', sql.VarChar(100), correo)
        .input('contrasena', sql.VarChar(255), hash)
        .query(`
            INSERT INTO Usuario (Nombre, Apellido, Correo, Contrasena, SaldoPrincipal, FechaRegistro, UltimaEdicion)
            VALUES (@nombre, @apellido, @correo, @contrasena, 0.00, GETDATE(), GETDATE())
        `);

    return { mensaje: 'Usuario registrado exitosamente' };
};