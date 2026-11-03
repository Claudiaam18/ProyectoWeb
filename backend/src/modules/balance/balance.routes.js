import {Router} from 'express';
import * as balanceController from './balance.controller.js';
import { verificarToken } from '../../middleware/auth.middleware.js';

const direccion = Router();
direccion.use(verificarToken);

direccion.get('/', balanceController.obtenerSaldo);
direccion.post('/income', balanceController.registrarIngreso);

export default direccion;

