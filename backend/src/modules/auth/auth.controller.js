import { loginUser, registerUser } from './auth.service.js';

export const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
        }

        const data = await loginUser(correo, contrasena);
        res.json({ mensaje: 'Login exitoso', ...data });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

export const register = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasena } = req.body;
        if (!nombre || !apellido || !correo || !contrasena) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const data = await registerUser(nombre, apellido, correo, contrasena);
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};