# Imagen oficial de Node 22
FROM node:22-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y lock para instalar dependencias
COPY package*.json .

# Instala dependencias (solo producción si corresponde)
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Exponer puerto (cambia si tu app usa otro)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
