import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT || 3000);

// Importar las rutas de autenticación
import authRoutes from './modules/auth/auth.routes.js';

// 1. PRIMERO los middlewares (el orden importa)
app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(express.json());

// 2. DESPUÉS conectamos las rutas
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    mensaje: 'Backend de Cartera Digital funcionando',
  });
});

app.listen(port, () => {
  console.log(`Servidor disponible en http://localhost:${port}`);
});