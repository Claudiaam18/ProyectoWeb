import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // Extraemos el token de la cabecera "Authorization"
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: "Acceso denegado. No hay token." });
    }

    // El formato HTTP estándar es "Bearer <token>", así que separamos la palabra Bearer del código
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Formato de token inválido." });
    }

    try {
        // Verificamos el token con la misma clave secreta que usamos al crearlo en el login
        const verificado = jwt.verify(token, "secreto_temporal_proyecto_web");

        // Guardamos los datos decodificados en la petición para que los controladores puedan saber quién es
        req.usuario = verificado;

        // Damos luz verde para que la petición continúe
        next();
    } catch (error) {
        res.status(400).json({ error: "Token inválido o expirado." });
    }
};