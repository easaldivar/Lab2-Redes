const net = require('net');

// Crea el servidor TCP
const server = net.createServer((socket) => {
  // Maneja la conexión entrante

  // Registra el evento de datos recibidos
  socket.on('data', (data) => {
    const request = data.toString();

    const [method, url] = parseRequest(request);

    // Define la respuesta del servidor
    let response = '';
    if (method === 'GET') {
      if (url === '/') {
        response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nHello, World!\r\n';
      } else if (url === '/moved') {
        response = 'HTTP/1.1 301 Moved Permanently\r\nLocation: http://localhost:8080/\r\n\r\n';
      } else if (url === '/notfound') {
        response = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nNot Found\r\n';
      } else {
        response = 'HTTP/1.1 405 Method Not Allowed\r\nContent-Type: text/plain\r\n\r\nMethod Not Allowed\r\n';
      }
    } else if (method === 'POST') {
      response = 'HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nBad Request\r\n';
    } else {
      response = 'HTTP/1.1 505 HTTP Version Not Supported\r\nContent-Type: text/plain\r\n\r\nHTTP Version Not Supported\r\n';
    }

    // Envía la respuesta al cliente
    socket.write(response);
    socket.end();
  });
});

// Inicia el servidor en el puerto 8080
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// Función para analizar la solicitud HTTP y extraer el método y la URL
function parseRequest(request) {
  const lines = request.split('\r\n');
  const [method, url] = lines[0].split(' ');

  return [method, url];
}