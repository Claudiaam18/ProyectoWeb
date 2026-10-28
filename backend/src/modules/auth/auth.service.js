import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const loginUser = async (correo, contrasena) => {
    // Simulación de base de datos usando los datos de prueba de Tony
    if (correo === "maria@test.com" && contrasena === "Test1234!") {

        // Creamos el payload con los datos del usuario
        const payload = {
            id: 1,
            nombre: "Maria",
            correo: correo
        };

        // Generamos el JWT (luego moveremos el texto secreto al archivo .env)
        const token = jwt.sign(payload, "secreto_temporal_proyecto_web", { expiresIn: '2h' });

        return token;
    } else {
        throw new Error("Credenciales inválidas");
    }
};

export const registerUser = async (nombre, apellido, correo, contrasena) => {
    // 1. Generamos un "salt" (un valor aleatorio para hacer el hash más seguro)
    const salt = await bcrypt.genSalt(10);

    // 2. Encriptamos la contraseña
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

    // 3. Simulamos guardar en la base de datos (luego lo conectaremos con db.js)
    const nuevoUsuario = {
        nombre,
        apellido,
        correo,
        hash: contrasenaEncriptada
    };

    console.log("Simulación de guardado en BD:", nuevoUsuario);

    return { mensaje: "Usuario registrado con éxito" };
};