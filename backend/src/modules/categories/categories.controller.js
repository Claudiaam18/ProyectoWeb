import * as categoriesService from './categories.service.js';

export async function listar(req, res) {
  try {
    const categorias = await categoriesService.listarCategorias(req.usuario.id);
    res.json(categorias);
  } catch (err) {
    res.status(err.status || 500).json({ mensaje: err.message });
  }
}

export async function crear(req, res) {
  try {
    const { nombre } = req.body ?? {};
    const categoria = await categoriesService.crearCategoria(req.usuario.id, nombre);
    res.status(201).json(categoria);
  } catch (err) {
    res.status(err.status || 500).json({ mensaje: err.message });
  }
}

export async function editar(req, res) {
  try {
    const { nombre } = req.body ?? {};
    const categoria = await categoriesService.editarCategoria(req.usuario.id, Number(req.params.id), nombre);
    res.json(categoria);
  } catch (err) {
    res.status(err.status || 500).json({ mensaje: err.message });
  }
}

export async function desactivar(req, res) {
  try {
    await categoriesService.desactivarCategoria(req.usuario.id, Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ mensaje: err.message });
  }
}

export async function ajustar(req, res) {
  try {
    const { monto } = req.body ?? {};
    const categoria = await categoriesService.ajustarPresupuesto(req.usuario.id, Number(req.params.id), monto);
    res.json(categoria);
  } catch (err) {
    res.status(err.status || 500).json({ mensaje: err.message });
  }
}

export async function asignar(req, res) {
  try {
    const { monto, descripcion } = req.body ?? {};
    const categoria = await categoriesService.asignarPresupuesto(req.usuario.id, Number(req.params.id), monto, descripcion);
    res.status(201).json(categoria);
  } catch (err) {
    res.status(err.status || 500).json({ mensaje: err.message });
  }
}
