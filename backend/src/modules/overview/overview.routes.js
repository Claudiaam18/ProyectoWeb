import express from 'express';
import { getExpensesByCategory, getMonthlySummary, getResumenTarjetas, getUltimosMovimientos } from './overview.controller.js';
import { verificarToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verificarToken);

router.get('/gastos-por-categoria', getExpensesByCategory);
router.get('/resumen-mensual', getMonthlySummary);
router.get('/resumen-tarjetas', getResumenTarjetas);
router.get('/ultimos-movimientos', getUltimosMovimientos);

export default router;