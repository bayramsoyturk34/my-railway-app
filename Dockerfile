# Railway için optimize edilmiş Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Node modules cache temizle ve fresh install
RUN npm ci --verbose

# Uygulama kodunu kopyala
COPY . .

# Build client to client/dist first, then copy to dist/public
RUN npm run build:client && npm run build:server

# Copy client build to expected location
RUN mkdir -p dist/public && cp -r client/dist/* dist/public/ && ls -la dist/public/

# Production için gereksiz dev dependencies'leri temizle
RUN npm prune --production

# Port'u expose et
EXPOSE $PORT

# Start script ile database migration + app başlatma
CMD ["sh", "-c", "npm run db:push && npm start"]