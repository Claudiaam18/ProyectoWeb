const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function solicitar(ruta, opciones = {}){
    const respuesta = await fetch(`${API_URL}${ruta}`,{
        ...opciones,
        headers: { 'Content-Type': 'application/json', ...authHeader(), ...opciones.headers},
    });
    const datos = await respuesta.json().catch(()=> null);

    if(!respuesta.ok){
        throw new Error(datos?.mensaje || 'Ocurrio un error, intenta de nuevo');
    }
    return datos;
}
export function obtenerSaldo(){
    return solicitar('/balance');
}

export function registrarIngreso(monto, descripcion){
    return solicitar ('/balance/income', {
        method: 'POST',
        body: JSON.stringify({monto,descripcion})
    });
}