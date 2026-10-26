import { loginUser, registerUser } from './auth.service.js';

// ... (aquí mantienes tu función login intacta) ...

export const register = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasena } = req.body;
        
        // Validación básica exigida por el documento
        if (!nombre || !apellido || !correo || !contrasena) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const resultado = await registerUser(nombre, apellido, correo, contrasena);
        
        res.status(201).json(resultado);
    } catch (error) {
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

export const login = async (req, res) => {
    try {
        // Extraemos los datos que enviaremos desde el Body de Postman
        const { correo, contrasena } = req.body;
        
        if (!correo || !contrasena) {
            return res.status(400).json({ error: "El correo y la contraseña son obligatorios" });
        }

        // Llamamos al servicio
        const token = await loginUser(correo, contrasena);
        
        // Respondemos con el token
        res.json({ mensaje: "Login exitoso", token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
