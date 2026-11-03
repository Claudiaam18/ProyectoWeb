import express from 'express';
import { getExpensesByCategory, getMonthlySummary, getResumenTarjetas, getUltimosMovimientos } from './overview.controller.js';
import { verificarToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/gastos-por-categoria', getExpensesByCategory);
router.get('/resumen-mensual', getMonthlySummary);
router.get('/resumen-tarjetas', verificarToken, getResumenTarjetas);
router.get('/ultimos-movimientos', verificarToken, getUltimosMovimientos);

export default router;