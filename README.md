# Lab 2: Servidor HTTP simple
---
## Caracteristicas principales
- Servidor HTTP/1.1 simple que responde a peticiones GET (y BREW).
- Servidor maneja codigos de error correspondientes.
- Tipos de medio soportados: text/html, text/plain, text/css, text/javascript, image/png, image/jpeg.
- Puede correr en un puerto definido, o en el puerto por defecto (8080).

## Uso del programa
### Instalacion de dependencias necesarias
Basta con escribir:
```
npm install
```

### Ejecucion del servidor
El servidor corre por defecto en el localhost, puerto 8080.
Para ejecutarlo, basta con escribir:
```
npm run server
```

### Pagina HTML de prueba
Se incluye la pagina HTML de prueba, que incluye pagina index, pagina 404 y pagina alternativa.

* Pagina Indice http://localhost:8080/
* Pagina Alternativa http://localhost:8080/saikichueco/
* Pagina 404 Not Found
    * Se puede acceder entrando a una direccion que no existe.