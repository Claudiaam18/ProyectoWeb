import * as balanceService from './balance.service.js';

export async function obtenerSaldo(req, res) {
    try {
        const saldo = await balanceService.obtenerSaldo(req.usuario.id);
        res.json(saldo);
    } catch (err) {
        res.status(err.status || 500).json({ mensaje: err.message });
    }
}

export async function registrarIngreso(req, res) {
    try {
        const { monto, descripcion } = req.body ?? {};
        const saldo = await balanceService.registrarIngreso(req.usuario.id, monto, descripcion);
        res.status(201).json(saldo);
    } catch (err) {
        res.status(err.status || 500).json({ mensaje: err.message });
    }
}