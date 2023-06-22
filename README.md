# Lab 2: Servidor HTTP simple
---
## Caracteristicas
- Servidor HTTP simple que responde a peticiones GET
- Servidor maneja codigos de error 400, 404, 405 y 500, junto a codigo de no-error 200.
- Tipos de medio soportados: text/html, text/plain, text/css, text/javascript, image/png, image/jpeg.

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
http://localhost:8080