# Dockerfile pour Fly.io
FROM node:20-slim

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le reste de l'application
COPY . .

# Builder l'application
RUN npm run build

# Exposer le port
EXPOSE 8080

# Démarrer l'application
CMD ["npm", "start"]
