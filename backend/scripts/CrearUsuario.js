/**
 * CrearUsuario.js
 * Crea (o actualiza) el usuario de la aplicacion en SQL Server usando
 * las credenciales del archivo .env LOCAL. Ninguna contrasena queda en el repo.
 *
 * Uso (desde la carpeta backend/):
 *   npm run db:crear-usuario
 *
 * Requisitos previos:
 *   - Contenedor de SQL Server corriendo
 *   - Ya se ejecuto database/01_estructura.sql (la BD debe existir)
 *   - .env con DB_ADMIN_USER / DB_ADMIN_PASSWORD (admin) y
 *     DB_USER / DB_PASSWORD (usuario de la app a crear)
 *
 * Es idempotente: si el usuario ya existe, solo actualiza su contrasena
 * con la del .env y se asegura de que tenga los permisos correctos.
 *
 * Permisos que recibe el usuario de la app (solo sobre DB_NAME):
 *   db_datareader (SELECT) y db_datawriter (INSERT / UPDATE / DELETE).
 *   No puede crear ni borrar tablas, ni crear usuarios.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sql from 'mssql';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const {
  DB_SERVER = 'localhost',
  DB_PORT = '1433',
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_ADMIN_USER,
  DB_ADMIN_PASSWORD,
  DB_TRUST_CERT,
  DB_ENCRYPT,
} = process.env;

function fallar(mensaje) {
  console.error(`[crear-usuario] ERROR: ${mensaje}`);
  process.exit(1);
}

function validar() {
  const faltantes = [
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'DB_ADMIN_USER',
    'DB_ADMIN_PASSWORD',
  ].filter((v) => !process.env[v]);
  if (faltantes.length > 0) {
    fallar(
      `Faltan variables en el .env: ${faltantes.join(', ')}. ` +
        'Revisa .env.example.'
    );
  }
  if (DB_USER.toLowerCase() === 'sa') {
    fallar('DB_USER no debe ser "sa". Usa un usuario propio, por ejemplo app_cartera.');
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(DB_USER)) {
    fallar('DB_USER solo puede tener letras, numeros y guion bajo (sin espacios).');
  }
  if (DB_PASSWORD.length < 8 || DB_PASSWORD.length > 128) {
    fallar('DB_PASSWORD debe tener entre 8 y 128 caracteres.');
  }
  if (DB_PASSWORD.toLowerCase().includes(DB_USER.toLowerCase())) {
    fallar(
      'DB_PASSWORD no puede contener el nombre del usuario (DB_USER). ' +
        'SQL Server la rechaza. Elige otra contrasena.'
    );
  }

  const categorias = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) =>
    r.test(DB_PASSWORD)
  ).length;
  if (categorias < 3) {
    fallar(
      'DB_PASSWORD debe combinar al menos 3 de estos grupos: minusculas, ' +
        'mayusculas, numeros y simbolos.'
    );
  }
}

function configConexion(usuario, password) {
  return {
    server: DB_SERVER,
    port: parseInt(DB_PORT, 10) || 1433,
    database: DB_NAME,
    user: usuario,
    password,
    options: {
      encrypt: DB_ENCRYPT !== 'false',
      trustServerCertificate: DB_TRUST_CERT === 'true',
    },
    connectionTimeout: 15000,
  };
}

// Los nombres y la contrasena se pasan como parametros y se arman con
// QUOTENAME dentro de SQL dinamico: asi no hay inyeccion ni problemas con
// comillas o simbolos en la contrasena.
const SCRIPT_USUARIO = `
SET XACT_ABORT ON;  -- el primer error detiene todo y es el que se muestra
DECLARE @sql NVARCHAR(MAX);

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = @login)
BEGIN
    SET @sql = N'CREATE LOGIN ' + QUOTENAME(@login)
             + N' WITH PASSWORD = ' + QUOTENAME(@pwd, '''')
             + N', CHECK_POLICY = ON, DEFAULT_DATABASE = ' + QUOTENAME(@db);
    EXEC (@sql);
END
ELSE
BEGIN
    SET @sql = N'ALTER LOGIN ' + QUOTENAME(@login)
             + N' WITH PASSWORD = ' + QUOTENAME(@pwd, '''');
    EXEC (@sql);
END

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @login)
BEGIN
    SET @sql = N'CREATE USER ' + QUOTENAME(@login) + N' FOR LOGIN ' + QUOTENAME(@login);
    EXEC (@sql);
END

SET @sql = N'ALTER ROLE db_datareader ADD MEMBER ' + QUOTENAME(@login);
EXEC (@sql);
SET @sql = N'ALTER ROLE db_datawriter ADD MEMBER ' + QUOTENAME(@login);
EXEC (@sql);
`;

async function main() {
  validar();

  // 1. Conexion como administrador para crear/actualizar el usuario
  let admin;
  try {
    admin = await new sql.ConnectionPool(
      configConexion(DB_ADMIN_USER, DB_ADMIN_PASSWORD)
    ).connect();
  } catch (err) {
    fallar(
      `No se pudo conectar como administrador (${DB_ADMIN_USER}): ${err.message}\n` +
        '          Revisa: contenedor corriendo, DB_ADMIN_PASSWORD, y que la BD exista ' +
        '(ejecuta database/01_estructura.sql primero).'
    );
  }

  try {
    await admin
      .request()
      .input('login', sql.NVarChar(128), DB_USER)
      .input('pwd', sql.NVarChar(128), DB_PASSWORD)
      .input('db', sql.NVarChar(128), DB_NAME)
      .query(SCRIPT_USUARIO);
    console.log(`[crear-usuario] Usuario "${DB_USER}" creado/actualizado en ${DB_NAME}.`);
  } catch (err) {
    await admin.close();
    const previos = (err.precedingErrors || [])
      .map((e) => `            - ${e.message}`)
      .join('\n');
    fallar(
      `No se pudo crear el usuario: ${err.message}\n` +
        (previos ? `          Errores previos:\n${previos}\n` : '') +
        '          Causas comunes: contrasena que no cumple la politica de SQL Server,\n' +
        '          o DB_ADMIN_USER sin permisos de administrador (debe ser "sa").'
    );
  }
  await admin.close();

  // 2. Verificación: conectarse como el usuario de la app y consultar
  try {
    const pool = await new sql.ConnectionPool(
      configConexion(DB_USER, DB_PASSWORD)
    ).connect();
    const r = await pool.request().query(
      'SELECT SUSER_SNAME() AS usuario, DB_NAME() AS baseDatos'
    );
    console.log(
      `[crear-usuario] Verificado: conectado como ${r.recordset[0].usuario} ` +
        `en ${r.recordset[0].baseDatos}.`
    );
    await pool.close();
  } catch (err) {
    fallar(`El usuario se creo pero no pudo iniciar sesion: ${err.message}`);
  }
}

main();