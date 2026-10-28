import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { getPool, probarConexion, cerrarConexion } from './config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = Number(process.env.PORT || 3001);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

app.use(express.json());

// Salud del servidor y de la base de datos
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS Funciona');

    res.json({
      mensaje: 'Backend de Cartera Digital funcionando',
      baseDatos: 'conectada',
    });
  } catch (err) {
    res.status(503).json({
      mensaje: 'Backend funcionando, pero sin conexion a la base de datos',
      baseDatos: 'sin conexion',
    });
  }
});

// Carga automática de rutas de los módulos
// Ejemplo: src/modules/auth/auth.routes.js -> /api/auth
async function montarModulos() {
  const base = path.join(__dirname, 'modules');
  if (!existsSync(base)) return;

  const carpetas = readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const nombre of carpetas) {
    const archivo = path.join(base, nombre, `${nombre}.routes.js`);
    if (!existsSync(archivo)) continue;

    try {
      const modulo = await import(pathToFileURL(archivo).href);
      app.use(`/api/${nombre}`, modulo.default);
      console.log(`[Rutas] /api/${nombre} montado`);
    } catch (err) {
      console.error(
        `[Rutas] No se pudo cargar el modulo "${nombre}": ${err.message}`
      );
    }
  }
}

await montarModulos();

// Rutas de API no encontradas
app.use('/api', (req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Iniciar servidor
const servidor = app.listen(port, async () => {
  console.log(`Servidor disponible en http://localhost:${port}`);

  const ok = await probarConexion();

  if (!ok) {
    console.warn(
      '[Servidor] Corriendo SIN base de datos. /api/health responde 503.'
    );
  }
});

// Cierre ordenado con Ctrl + C
process.on('SIGINT', async () => {
  console.log('\nCerrando servidor...');
  servidor.close();
  await cerrarConexion();
  process.exit(0);
});