const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function solicitar (ruta, opciones = {}){
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...opciones.headers},
    });
    const datos = await respuesta.json().catch(() => null);

    if(!respuesta.ok){
        throw new Error(datos?.mensaje || 'Ocurrio un error, intenta de nuevo');
    }
    return datos;
}

export function listarCategorias(){
    return solicitar('/categories');
}

export function crearCategoria(nombre){
    return solicitar('/categories', {method: 'POST', body: JSON.stringify({nombre})});
}

export function editarCategoria(id, nombre){
    return solicitar(`/categories/${id}`, {method: 'PUT', body: JSON.stringify({nombre})});
}

export function desactivarCategoria(id){
    return solicitar(`/categories/${id}`, {method: 'DELETE'});
}

export function ajustarPresupuesto(id, monto){
    return solicitar(`/categories/${id}/allocate`, {method: 'PUT', body: JSON.stringify({monto})});
}

export function asignarPresupuesto(id, monto){
    return solicitar (`/categories/${id}/allocate`, {method: 'POST', body: JSON.stringify({monto})});
}