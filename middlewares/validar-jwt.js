const { response } = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = (req, res = response, next) => {
    //leer token

    const token = req.header('x-token');

    if (!token) {
        console.log('No hay token en la petición');
        return res.status(401).json({
            ok: false,
            msg: 'Acceso no autorizado!'
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.JWT_KEY);
        req.uid = uid;

        next();
    } catch (error) {
        console.log('token no válido');
        return res.status(401).json({
            ok: false,
            msg: 'Acceso no autorizado!'
        });
    }
}

module.exports = {
    validarJWT
}