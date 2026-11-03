import * as profileService from './profile.service.js';

export async function getPerfil(req, res) {
  try {
    const perfil = await profileService.obtenerPerfil(req.usuario.id);
    res.json(perfil);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function putPerfil(req, res) {
  try {
    const { nombre, apellido, correo } = req.body;
    const perfil = await profileService.actualizarPerfil(req.usuario.id, nombre, apellido, correo);
    res.json(perfil);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function putContrasena(req, res) {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;
    const resultado = await profileService.cambiarContrasena(req.usuario.id, contrasenaActual, contrasenaNueva);
    res.json(resultado);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function getPreferencias(req, res) {
  try {
    const prefs = await profileService.obtenerPreferencias(req.usuario.id);
    res.json(prefs);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function putPreferencias(req, res) {
  try {
    const { moneda, tema } = req.body;
    const prefs = await profileService.actualizarPreferencias(req.usuario.id, moneda, tema);
    res.json(prefs);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
