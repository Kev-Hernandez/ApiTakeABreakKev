# 1. Usamos una imagen oficial de Node.js ligera (versión LTS)
FROM node:20-alpine

# 2. Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de definición de dependencias primero
# Esto aprovecha la caché de Docker para que las builds sean más rápidas
COPY package*.json ./

# 4. Instalamos las dependencias del proyecto
RUN npm install

# 5. Copiamos el resto del código fuente (src, public, etc.)
COPY . .

# 6. Exponemos el puerto que usa tu app (3002 por defecto en tu app.js)
EXPOSE 3002

# 7. Definimos el comando para iniciar la aplicación
# IMPORTANTE: Apuntamos directamente a src/app.js como corregimos antes
CMD ["node", "src/app.js"]