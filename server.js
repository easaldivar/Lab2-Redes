const net = require('net');
const port = 8080;

const server = net.createServer((socket) => {
    console.log('Cliente conectado');

    socket.on('data', (data) => {
        console.log(data.toString());
        const request = parseHTTPRequest(data.toString());

        console.log(request);

        if(request.path === '/'){
            console.log('Peticion a /');
            socket.write('HTTP/1.1 200 OK\r\nContent-Length: 12\r\nContent-Type: text/plain\r\n\r\nHello world!');
        }
    });

    socket.on('end', () => {
        console.log('Cliente desconectado');
        socket.end();
    });

    socket.on('error', (err) => {
        console.log(err);
    });
});
server.listen(port, () => {
    console.log("[SV] Servidor abierto en el puerto " + port);
});


// Parse HTTP request
function parseHTTPRequest(request) {
    const parsedRequest = {};
  
    // Divide la request en lineas
    const lines = request.split('\r\n');
  
    // Extrae metodo, path y protocolo de la primera linea
    const [method, path, protocol] = lines[0].split(' ');
  
    parsedRequest.method = method;
    parsedRequest.path = path;
    parsedRequest.protocol = protocol;
  
    // Headers
    parsedRequest.headers = {};
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line === '') {
        break;
      }
  
      const [headerName, headerValue] = line.split(':');
      const trimmedHeaderName = headerName.trim();
      const trimmedHeaderValue = headerValue.trim();
  
      parsedRequest.headers[trimmedHeaderName] = trimmedHeaderValue;
    }
  
    // Body
    const requestBodyIndex = lines.indexOf('', 1);
    if (requestBodyIndex !== -1 && requestBodyIndex < lines.length - 1) {
      parsedRequest.body = lines.slice(requestBodyIndex + 1).join('\n');
    }
  
    // Retorna objeto request
    return parsedRequest;
}