import express from 'express';
import { getExpensesByCategory, getMonthlySummary } from './overview.controller.js';

const router = express.Router();

// GET http://localhost:3000/api/overview/expenses-by-category?idUsuario=1
router.get('/gastos-por-categoria', getExpensesByCategory);

// GET http://localhost:3000/api/overview/monthly-summary?idUsuario=1&anio=2026
router.get('/resumen-mensual', getMonthlySummary);

export default router;