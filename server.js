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
    
        if (request.protocol !== 'HTTP/1.1') {
            socket.write('HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nBad Request\r\n');
        } else if (request.method === 'GET') {
            let pagesDir = path.join(__dirname, 'pages');
            let pages = fs.readdirSync(pagesDir);
            let pageFound = false;
            let responseData = null;
            let responseHeaders = 'HTTP/1.1 200 OK\r\n';

            
            if (request.path === '/') request.path = '/index';
            if (request.path.endsWith('/favicon.ico')) {
                let faviconData = fs.readFileSync(path.join(__dirname, 'favicon.ico'));
                responseHeaders = 'HTTP/1.1 200 OK\r\nContent-Type: image/x-icon\r\n\r\n';
                responseData = faviconData;
                pageFound = true;
            } else {
                for (let page of pages) {
                    if (request.path === '/' + page) {
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
                                responseHeaders = 'HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\n';
                                responseData = 'Internal Server Error\r\n';
                            }
                        } else {
                            try {
                                let indexData = fs.readFileSync(path.join(pagesDir, page, 'index.html'), 'utf8');
                                responseHeaders = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n';
                                responseData = indexData;
                            } catch (err) {
                                responseHeaders = 'HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\n';
                                responseData = 'Internal Server Error\r\n';
                            }
                        }
                        break;
                    }
                }
            }
    
            if (!pageFound) {
                responseHeaders = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n';
                responseData = 'Not Found\r\n';
            }
    
            socket.write(responseHeaders);
            if (responseData) {
                socket.write(responseData);
            }
            socket.end();
        } else if (request.method === 'BREW') {
            socket.write("HTTP/1.1 418 I'm a teapot\r\nContent-Type: text/plain\r\n\r\nI'm a teapot, I cannot brew coffee\r\n");
        } else {
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