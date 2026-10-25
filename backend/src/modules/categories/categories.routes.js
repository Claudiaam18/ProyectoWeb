import { Router } from 'express';
import * as categoriesController from './categories.controller.js';

const direccion = Router();

direccion.get('/', categoriesController.listar);
direccion.post('/', categoriesController.crear);
direccion.put('/:id', categoriesController.editar);
direccion.delete('/:id', categoriesController.desactivar);
direccion.post('/:id/allocate', categoriesController.asignar);

export default direccion;