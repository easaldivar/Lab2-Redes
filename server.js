const net = require('net');
const port = 7070;

const server = net.createServer((socket) => {
    console.log('Cliente conectado');

    socket.on('data', (data) => {
        console.log(data.toString());
    });

    socket.on('end', () => {
        console.log('Cliente desconectado');
        socket.end();
    });

    socket.on('error', (err) => {
        console.log(err);
    });
});