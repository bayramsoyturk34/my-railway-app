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

# Debug: mevcut dosyaları kontrol et
RUN echo "=== BEFORE BUILD ===" && \
    ls -la && \
    echo "=== SERVER FILES ===" && \
    ls -la server/ && \
    echo "=== CLIENT FILES ===" && \
    ls -la client/

# Build server first, then client
RUN echo "=== BUILDING SERVER ===" && \
    npm run build:server && \
    echo "=== SERVER BUILD COMPLETE ===" && \
    ls -la dist/ && \
    echo "=== BUILDING CLIENT ===" && \
    npm run build:client && \
    echo "=== CLIENT BUILD COMPLETE ===" && \
    ls -la client/dist/ || echo "client/dist not found"

# Copy client build to dist/public
RUN mkdir -p dist/public && \
    if [ -d "client/dist" ]; then \
        echo "Found client/dist, copying to dist/public..."; \
        cp -r client/dist/* dist/public/; \
    else \
        echo "client/dist not found, creating empty public dir"; \
    fi && \
    echo "=== FINAL DIST STRUCTURE ===" && \
    ls -la dist/ && \
    ls -la dist/public/

# Production için gereksiz dev dependencies'leri temizle
RUN npm prune --production

# Port'u expose et
EXPOSE $PORT

# Start script ile database migration + app başlatma
CMD ["sh", "-c", "npm run db:push && npm start"]