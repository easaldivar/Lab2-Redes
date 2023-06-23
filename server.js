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

const server = net.createServer((socket) => {
    console.log('Cliente conectado');

    socket.on('data', (data) => {
        console.log(data.toString());
        const request = parseHTTPRequest(data.toString());
    
        console.log(request);
        
        // Verifica version HTTP.
        if (request.protocol !== 'HTTP/1.1') {
            socket.write('HTTP/1.1 505 HTTP Version Not Supported\r\nContent-Type: text/plain\r\n\r\nHTTP Version Not Supported\r\n');
            socket.end();
        // Verifica metodo.
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
            if (request.path === '/') request.path = '/index/';


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
                                responseHeaders = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n';
                                responseData = 'Not Found\r\n';
                                pageFound = false;
                            }
                        } else {
                            try {
                                let indexData = fs.readFileSync(path.join(pagesDir, page, 'index.html'), 'utf8');
                                responseHeaders = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n';
                                responseData = indexData;
                            } catch (err) {
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

function parseHTTPRequest(request) {
    const parsedRequest = {};

    const lines = request.split('\r\n');
  
    const [method, path, protocol] = lines[0].split(' ');
  
    parsedRequest.method = method;
    parsedRequest.protocol = protocol;
  
    const pathMatch = path.match(/^(\/[^\/]+)\/(.*)/);
    if (pathMatch) {
        parsedRequest.path = pathMatch[1];
        parsedRequest.file = pathMatch[2];
    } else {
        parsedRequest.path = path;
    }

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
  
    const requestBodyIndex = lines.indexOf('', 1);
    if (requestBodyIndex !== -1 && requestBodyIndex < lines.length - 1) {
      parsedRequest.body = lines.slice(requestBodyIndex + 1).join('\n');
    }
  
    return parsedRequest;
}