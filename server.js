const http = require('http');

//Se crea el servidor
const server = http.createServer((req, res) => {
  const { method, url } = req;

  //Se definen las respuestas del servidor 
  if (method === 'GET') {
    if (url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Hello, World!\n');
    } else if (url === '/moved') {
      res.statusCode = 301;
      res.setHeader('Location', 'http://localhost:8080/');
      res.end();
    } else if (url === '/notfound') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found\n');
    } else {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Method Not Allowed\n');
    }
  } else if (method === 'POST') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Bad Request\n');
  } else {
    res.statusCode = 505;
    res.setHeader('Content-Type', 'text/plain');
    res.end('HTTP Version Not Supported\n');
  }
});

//Se define el puerto donde se ejecutará el servidor 
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
