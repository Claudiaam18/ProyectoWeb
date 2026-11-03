/**
 * db.js - Conexion a SQL Server con el paquete "mssql" (ES Modules)
 *
 * Uso en otros modulos:
 *   import { getPool, sql } from '../config/db.js';
 *   const pool = await getPool();
 *   const result = await pool.request()
 *     .input('id', sql.Int, idUsuario)
 *     .query('SELECT * FROM Usuario WHERE IDUsuario = @id');
 *
 * Requisitos (dentro de la carpeta backend/):
 *   npm install mssql dotenv
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sql from 'mssql';

// Carga backend/.env sin importar desde que carpeta se ejecute node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true })

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT !== 'false',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 15000,
};

// Una sola conexion compartida por toda la aplicacion
let poolPromise = null;

/**
 * Valida que las variables de entorno obligatorias existan.
 */
function validarConfig() {
  const faltantes = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'].filter(
    (variable) => !process.env[variable]
  );
  if (faltantes.length > 0) {
    throw new Error(
      `Faltan variables de entorno: ${faltantes.join(', ')}. ` +
        'Copia .env.example como .env (dentro de backend/) y completa los valores.'
    );
  }
}

/**
 * Devuelve el pool de conexiones (lo crea la primera vez).
 */
export function getPool() {
  if (!poolPromise) {
    validarConfig();
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        pool.on('error', (err) => {
          console.error('[DB] Error en el pool:', err.message);
        });
        return pool;
      })
      .catch((err) => {
        poolPromise = null; // permite reintentar en la siguiente llamada
        throw err;
      });
  }
  return poolPromise;
}

/**
 * Prueba la conexion con consultas simples, SIN tocar las tablas reales.
 * Devuelve true si todo esta bien, false si hubo error.
 */
export async function probarConexion() {
  try {
    const pool = await getPool();

    // 1. Conexión básica
    await pool.request().query('SELECT 1 AS FuncionaDB');

    // 2. Base de datos correcta
    const db = await pool.request().query('SELECT DB_NAME() AS baseDatos');
    console.log(`[DB] Conexion exitosa. Base de datos: ${db.recordset[0].baseDatos}`);
    return true;
  } catch (err) {
    console.error('[DB] No se pudo conectar a SQL Server:');
    console.error(`     ${err.message}`);
    console.error('     Revisa: contenedor corriendo, puerto 1433, credenciales del .env y DB_TRUST_CERT=true');
    return false;
  }
}

/**
 * Cierra el pool (útil al apagar el servidor o en pruebas).
 */
export async function cerrarConexion() {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
    poolPromise = null;
  }
}

export { sql };

// Prueba rapida: node db.js
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  probarConexion().then((ok) => {
    cerrarConexion().finally(() => process.exit(ok ? 0 : 1));
  });
}