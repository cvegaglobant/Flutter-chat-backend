const { usuarioConectado, usuarioDesconectado, grabarMensaje } = require('../controllers/socket');
const { comprobarJWT } = require('../helpers/jwt');
const { io } = require('../index');


// Mensajes de Sockets
io.on('connection', (client) => {

    console.log('Cliente conectado');

    const [valido, uid] = comprobarJWT(client.handshake.headers['x-token'])

    //verificar autenticación
    if (!valido) {
        return client.disconnect();
    }

    //Cliente autenticado
    usuarioConectado(uid);

    //ingresar al usuario a una sala en particular
    //sala global, client.id, 6226780186a2d35ef98a59ca
    client.join(uid);

    //escuchar del cliente el mensaje-personal
    client.on('mensaje-personal', async (payload) => {
        await grabarMensaje(payload);
        io.to(payload.para).emit('mensaje-personal', payload);
    });

    client.on('disconnect', () => {
        console.log('Cliente desconectado');
        usuarioDesconectado(uid);
    });

});
