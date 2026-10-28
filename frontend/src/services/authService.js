// La URL base de tu backend
const API_URL = 'http://localhost:3000/api/auth';

export const login = async (correo, contrasena) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contrasena })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
    }

    // Si el login es exitoso, guardamos el token en el almacenamiento del navegador
    if (data.token) {
        localStorage.setItem('token', data.token);
    }

    return data;
};

export const register = async (nombre, apellido, correo, contrasena) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, apellido, correo, contrasena })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
    }

    return data;
};

export const logout = () => {
    // Para cerrar sesión, simplemente eliminamos el token
    localStorage.removeItem('token');
};