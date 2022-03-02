const { response } = require('express');
const bcrypt = require('bcryptjs');

const { Usuario } = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');

const crearUsuario = async (req, res = response) => {

    const { email, password } = req.body;

    try {

        const existeEmail = await Usuario.findOne({ email: email });
        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            })
        }


        const usuario = new Usuario(req.body);

        //Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();

        //Generar mi JWT
        const token = await generarJWT(usuario.id);

        res.json({
            ok: true,
            usuario,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const login = async (req, res = response) => {
    const { email, password } = req.body;

    try {

        const usuarioDB = await Usuario.findOne({ email: email });
        if (!usuarioDB) {
            console.log('Email no encontrado');
            return res.status(404).json({
                ok: false,
                msg: 'Credenciales inválidas'
            });
        }

        //Validar password
        const validPassword = bcrypt.compareSync(password, usuarioDB.password);
        if (!validPassword) {
            console.log('Password inválido');
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales inválidas'
            });
        }

        //Generar JWT
        const token = await generarJWT(usuarioDB.id);

        res.json({
            ok: true,
            usuarioDB,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const renewToken = async (req, res = response) => {
    const uidUsuario = req.uid;

    try {
        const usuarioDB = await Usuario.findById({ _id: uidUsuario });
        if (!usuarioDB) {
            console.log('usuario no encontrado');
            return res.status(404).json({
                ok: false,
                msg: 'Credenciales inválidas'
            });
        }

        //Generar JWT
        const token = await generarJWT(uidUsuario);

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

module.exports = {
    crearUsuario,
    login,
    renewToken,
}