# Lab 2: Servidor HTTP simple
---

Para ejecutar el código se escribe en la terminal: "node server.js"

Luego en el buscador de google para buscar la página se escribe: "http://localhost:8080"

Para verificar que los códigos de respuesta funcionan correctamente en Powershell, primero que todo, hay que asegurarse de que se esté ejecutando la página y en otro terminal escribir los siguientes comandos para cada caso:

200 OK: Invoke-WebRequest -Uri "http://localhost:8080"
301 Moved Permanently: Invoke-WebRequest -Uri "http://localhost:8080/moved" -MaximumRedirection 0
400 Bad Request: Invoke-WebRequest -Uri "http://localhost:8080" -Method POST
404 Not Found: Invoke-WebRequest -Uri "http://localhost:8080/unknown"
405 Method Not Allowed: Invoke-WebRequest -Uri http://localhost:8080/ -Method POST
505 HTTP Version Not Supported: Invoke-WebRequest -Uri "http://localhost:8080" -Method PUT




