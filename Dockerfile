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

# Build işlemini yap (verbose output ile debug)
RUN npx vite build --outDir=dist/public --config=vite.config.ts && npm run build:server

# Build output debug
RUN echo "=== BUILD OUTPUT DEBUG ===" && \
    ls -la dist/ && \
    echo "=== CLIENT DIST DEBUG ===" && \
    ls -la client/dist/ && \
    echo "=== DIST PUBLIC DEBUG ===" && \
    ls -la dist/public/ || echo "dist/public not found"

# Production için gereksiz dev dependencies'leri temizle
RUN npm prune --production

# Port'u expose et
EXPOSE $PORT

# Start script ile database migration + app başlatma
CMD ["sh", "-c", "npm run db:push && npm start"]