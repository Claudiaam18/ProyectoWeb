// src/modules/expenses/expenses.routes.js
import express from 'express';
import { getExpenses, createExpense } from './expenses.controller.js';

const router = express.Router();

router.get('/', getExpenses); // GET http://localhost:3000/api/expenses/obtenerGastos
router.post('/', createExpense);   // POST http://localhost:3000/api/expenses

export default router;          