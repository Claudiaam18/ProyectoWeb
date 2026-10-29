import { getPool, sql } from '../../config/db.js';
import bcrypt from 'bcryptjs';

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

export async function obtenerPerfil(idUsuario) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, idUsuario)
    .query(`SELECT IDUsuario AS id, Nombre AS nombre, Apellido AS apellido,
                   Correo AS correo, FechaRegistro AS fechaRegistro
            FROM dbo.Usuario
            WHERE IDUsuario = @id`);

  if (result.recordset.length === 0) throw crearError('Usuario no encontrado', 404);
  return result.recordset[0];
}

export async function actualizarPerfil(idUsuario, nombre, apellido, correo) {
  if (!nombre?.trim()) throw crearError('El nombre es obligatorio', 400);
  if (!apellido?.trim()) throw crearError('El apellido es obligatorio', 400);
  if (!correo?.trim()) throw crearError('El correo es obligatorio', 400);

  const pool = await getPool();

  // Verificar que el correo no lo use otro usuario
  const existe = await pool.request()
    .input('correo', sql.VarChar(200), correo.trim())
    .input('id', sql.Int, idUsuario)
    .query(`SELECT IDUsuario FROM dbo.Usuario WHERE Correo = @correo AND IDUsuario <> @id`);

  if (existe.recordset.length > 0) throw crearError('El correo ya está en uso', 409);

  await pool.request()
    .input('id', sql.Int, idUsuario)
    .input('nombre', sql.VarChar(100), nombre.trim())
    .input('apellido', sql.VarChar(100), apellido.trim())
    .input('correo', sql.VarChar(200), correo.trim())
    .query(`UPDATE dbo.Usuario
            SET Nombre = @nombre, Apellido = @apellido, Correo = @correo
            WHERE IDUsuario = @id`);

  return obtenerPerfil(idUsuario);
}

export async function cambiarContrasena(idUsuario, contrasenaActual, contrasenaNueva) {
  if (!contrasenaActual) throw crearError('La contraseña actual es obligatoria', 400);
  if (!contrasenaNueva || contrasenaNueva.length < 8)
    throw crearError('La nueva contraseña debe tener al menos 8 caracteres', 400);

  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, idUsuario)
    .query(`SELECT Contrasena AS hash FROM dbo.Usuario WHERE IDUsuario = @id`);

  if (result.recordset.length === 0) throw crearError('Usuario no encontrado', 404);

  const coincide = await bcrypt.compare(contrasenaActual, result.recordset[0].hash);
  if (!coincide) throw crearError('La contraseña actual es incorrecta', 401);

  const nuevoHash = await bcrypt.hash(contrasenaNueva, 10);
  await pool.request()
    .input('id', sql.Int, idUsuario)
    .input('hash', sql.VarChar(255), nuevoHash)
    .query(`UPDATE dbo.Usuario SET ContrasenaHash = @hash WHERE IDUsuario = @id`);

  return { mensaje: 'Contraseña actualizada correctamente' };
}

export async function obtenerPreferencias(idUsuario) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, idUsuario)
    .query(`SELECT Moneda AS moneda, Tema AS tema
            FROM dbo.PreferenciasUsuario
            WHERE IDUsuario = @id`);

  // Si no tiene preferencias guardadas, devolver valores por defecto
  if (result.recordset.length === 0) return { moneda: 'GTQ', tema: 'claro' };
  return result.recordset[0];
}

export async function actualizarPreferencias(idUsuario, moneda, tema) {
  const monedasValidas = ['GTQ', 'USD'];
  const temasValidos = ['claro', 'oscuro'];

  if (!monedasValidas.includes(moneda)) throw crearError('Moneda no válida', 400);
  if (!temasValidos.includes(tema)) throw crearError('Tema no válido', 400);

  const pool = await getPool();

  // UPSERT: actualiza si existe, inserta si no
  await pool.request()
    .input('id', sql.Int, idUsuario)
    .input('moneda', sql.VarChar(10), moneda)
    .input('tema', sql.VarChar(20), tema)
    .query(`IF EXISTS (SELECT 1 FROM dbo.PreferenciasUsuario WHERE IDUsuario = @id)
              UPDATE dbo.PreferenciasUsuario SET Moneda = @moneda, Tema = @tema WHERE IDUsuario = @id
            ELSE
              INSERT INTO dbo.PreferenciasUsuario (IDUsuario, Moneda, Tema) VALUES (@id, @moneda, @tema)`);

  return { moneda, tema };
}
