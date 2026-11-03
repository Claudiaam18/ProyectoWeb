import express from 'express';
import { getExpenses, createExpense } from './expenses.controller.js';
import { verificarToken } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(verificarToken);

router.get('/', getExpenses);
router.post('/', createExpense);

export default router;