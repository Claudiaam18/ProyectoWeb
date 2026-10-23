import {Router} from 'express';
import * as balanceController from './balance.controller.js';

const direccion = Router();

direccion.get('/', balanceController.obtenerSaldo);
direccion.post('/income', balanceController.registrarIngreso);

export default direccion;

