import { Router } from 'express';
import * as categoriesController from './categories.controller.js';
import { verificarToken } from '../../middleware/auth.middleware.js';

const direccion = Router();
direccion.use(verificarToken);

direccion.get('/', categoriesController.listar);
direccion.post('/', categoriesController.crear);
direccion.post('/:id/allocate', categoriesController.asignar);
direccion.put('/:id/allocate', categoriesController.ajustar);
direccion.put('/:id', categoriesController.editar);
direccion.delete('/:id', categoriesController.desactivar);

export default direccion;