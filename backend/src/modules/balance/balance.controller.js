import * as balanceService from './balance.service.js';

const ID_USUARIO_PRUEBA = 1;

export async function obtenerSaldo(req,res){
    const saldo = await balanceService.obtenerSaldo(ID_USUARIO_PRUEBA);
    res.json(saldo);
}

export async function registrarIngreso(req,res){
    const {monto, descripcion} = req.body ?? {};
    const saldo = await balanceService.registrarIngreso(ID_USUARIO_PRUEBA, monto, descripcion);
    res.status(201).json(saldo);
}