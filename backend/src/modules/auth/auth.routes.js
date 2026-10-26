import express from 'express';
import { login, register } from './auth.controller.js';
import { verificarToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Ahora la ruta POST /login ejecuta la función de nuestro controlador
router.post('/login', login);
router.post('/register', register);
router.get('/perfil-prueba', verificarToken, (req, res) => {
    res.json({ 
        mensaje: "¡Entraste a la zona protegida!", 
        datosUsuario: req.usuario 
    });
});

export default router;