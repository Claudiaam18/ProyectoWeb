import * as categoriesService from './categories.service.js';

const ID_USUARIO_PRUEBA = 1;

export async function listar (req,res){
    const categorias = await categoriesService.listarCategorias(ID_USUARIO_PRUEBA);
    res.json(categorias);
}

export async function crear (req,res){
    const {nombre} = req.body ?? {};
    const categoria = await categoriesService.crearCategoria(ID_USUARIO_PRUEBA,nombre);
    res.status(201).json(categoria);
}

export async function editar(req, res) {
    const {nombre} = req.body ?? {};
    const categoria =await categoriesService.editarCategoria(ID_USUARIO_PRUEBA, Number(req.params.id), nombre);
    res.json(categoria);
}

export async function desactivar(req,res) {
    await categoriesService.desactivarCategoria(ID_USUARIO_PRUEBA, Number(req.params.id));
    res.status(204).end();
}

export async function asignar(req, res) {
    const {monto, descripcion} = req.body ?? {};
    const categoria = await categoriesService.asignarPresupuesto(ID_USUARIO_PRUEBA, Number(req.params.id), monto, descripcion);
    res.status(201).json(categoria);
}
