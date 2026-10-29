const API_URL = 'http://localhost:3000/api/profile';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function manejarRespuesta(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

export const obtenerPerfil = () =>
  fetch(API_URL, { headers: getHeaders() }).then(manejarRespuesta);

export const actualizarPerfil = (nombre, apellido, correo) =>
  fetch(API_URL, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ nombre, apellido, correo }),
  }).then(manejarRespuesta);

export const cambiarContrasena = (contrasenaActual, contrasenaNueva) =>
  fetch(`${API_URL}/password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ contrasenaActual, contrasenaNueva }),
  }).then(manejarRespuesta);

export const obtenerPreferencias = () =>
  fetch(`${API_URL}/preferences`, { headers: getHeaders() }).then(manejarRespuesta);

export const actualizarPreferencias = (moneda, tema) =>
  fetch(`${API_URL}/preferences`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ moneda, tema }),
  }).then(manejarRespuesta);
