const net = require('net');
const fs = require('fs');
const path = require('path');
const port = 8080;

const mimeTypes = {
    'html': 'text/html',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'js': 'text/javascript',
    'css': 'text/css'
};

// Crear servidor.
const server = net.createServer((socket) => {
    console.log('Cliente conectado');

    // Al recibir datos.
    socket.on('data', (data) => {

        // Parsea la request y retorna un objeto con los datos.
        console.log(data.toString());
        const request = parseHTTPRequest(data.toString());
        console.log(request);
        
        // Verifica version HTTP.
        if (request.protocol !== 'HTTP/1.1') {
            socket.write('HTTP/1.1 505 HTTP Version Not Supported\r\nContent-Type: text/plain\r\n\r\nHTTP Version Not Supported\r\n');
            socket.end();

        // Si esta bien, verifica metodo.
        } else if (request.method === 'GET') {
            let pagesDir = path.join(__dirname, 'pages');
            let pages = fs.readdirSync(pagesDir);
            let pageFound = false;
            let responseData = null;
            let responseHeaders = 'HTTP/1.1 200 OK\r\n';

            // Si URL no comienza con '/', error 400.
            if(request.path.startsWith('/') === false) {
                socket.write('HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nBad Request\r\n');
                socket.end();
            }
            if (request.path === '/pagina1') { 
                let responseHeaders = 'HTTP/1.1 301 Moved Permanently\r\nLocation: /index\r\n\r\n';
                socket.write(responseHeaders);
                socket.end();
            }
            // Si la request es '/', redirige a '/index'.
            if (request.path === '/') request.path = '/index';

            // Si cliente pide favicon, se lo envia.
            if (request.path.endsWith('/favicon.ico')) {
                let faviconData = fs.readFileSync(path.join(__dirname, 'favicon.ico'));
                responseHeaders = 'HTTP/1.1 200 OK\r\nContent-Type: image/x-icon\r\n\r\n';
                responseData = faviconData;
                pageFound = true;
                socket.write(responseHeaders);
                socket.write(responseData);
                socket.end();
                return;
            }else {
                // Busca la pagina en el directorio de paginas.
                for (let page of pages) {
                    if (request.path === '/' + page || request.path === '/' + page + '/') {
                        pageFound = true;
                        if (request.file) {
                            console.info(`REQUEST FILE ${request.file}`)
                            const filePath = path.join(pagesDir, page, request.file);
                            const fileExt = path.extname(filePath).slice(1);
                            const contentType = mimeTypes[fileExt] || 'application/octet-stream';
                            
                            try {
                                let fileData = fs.readFileSync(filePath);
                                responseHeaders = `HTTP/1.1 200 OK\r\nContent-Type: ${contentType}\r\n\r\n`;
                                responseData = fileData;
                            } catch (err) {
                                // Si no se encuentra el archivo, se marca como no encontrado
                                // Y se define el 404 como respuesta.
                                responseHeaders = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n';
                                responseData = 'Not Found\r\n';
                                pageFound = false;
                            }
                        } else {
                            try {
                                // Si no habia archivo, intenta enviar el index de el directorio.
                                let indexData = fs.readFileSync(path.join(pagesDir, page, 'index.html'), 'utf8');
                                responseHeaders = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n';
                                responseData = indexData;
                            } catch (err) {
                                // Si no se encuentra el index, se marca como no encontrado
                                // Y se define el 404 como respuesta.
                                responseHeaders = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n';
                                responseData = 'Not Found\r\n';
                                pageFound = false;
                            }
                        }
                        break;
                    }
                }
            }
    
            if (!pageFound) {
                // Si no se encuentra la pagina, se envia el index de not-found.
                let indexData = fs.readFileSync(path.join(pagesDir, "not-found", 'index.html'), 'utf8');
                responseHeaders = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\n\r\n';
                responseData = indexData;
            }
    
            socket.write(responseHeaders);
            if (responseData) {
                socket.write(responseData);
            }
            socket.end();
        
        // Si no es GET o BREW, codigo 405.
        } else {
            if (request.method === 'BREW') {
                // Metodo BREW con codigo 418.
                socket.write("HTTP/1.1 418 I'm a teapot\r\nContent-Type: text/plain\r\n\r\nI'm a teapot, I cannot brew coffee\r\n");
                socket.end();            
            } else
            socket.write('HTTP/1.1 405 Method Not Allowed\r\nContent-Type: text/plain\r\n\r\nMethod Not Allowed\r\n');
            socket.end();
        }
    });

    socket.on('end', () => {
        console.log('Cliente desconectado');
    });

    socket.on('error', (err) => {
        console.log(err);
    });
});

server.listen(port, () => {
    console.log("[SV] Servidor abierto en el puerto " + port);
});

// Funcion para parsear request del cliente.
function parseHTTPRequest(request) {
    // Crea un objeto parsedRequest, que va a contener los campos de la request.
    const parsedRequest = {};

    // Separa la request en lineas.
    const lines = request.split('\r\n');
    
    // Separa la primera linea en method, path y protocol.
    const [method, path, protocol] = lines[0].split(' ');
    
    // Asigna al objeto.
    parsedRequest.method = method;
    parsedRequest.protocol = protocol;
    
    // Regex para separar path y file.
    const pathMatch = path.match(/^(\/[^\/]+)\/(.*)/);
    if (pathMatch) {
        parsedRequest.path = pathMatch[1];
        parsedRequest.file = pathMatch[2];
    } else {
        parsedRequest.path = path;
    }

    // Guarda los headers en un objeto.
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
    
    // Guarda el body.
    const requestBodyIndex = lines.indexOf('', 1);
    if (requestBodyIndex !== -1 && requestBodyIndex < lines.length - 1) {
      parsedRequest.body = lines.slice(requestBodyIndex + 1).join('\n');
    }
  
    return parsedRequest;
}