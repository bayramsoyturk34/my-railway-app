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
RUN npm run build:client && npm run build:server && echo "Build complete, checking outputs..." && ls -la client/ && ls -la client/dist/ || echo "client/dist not found" && ls -la dist/ || echo "dist not found"

# Copy from actual build location to expected location
RUN mkdir -p dist/public && \
    if [ -d "client/dist/public" ]; then \
        echo "Found client/dist/public, copying to dist/public..."; \
        cp -r client/dist/public/* dist/public/; \
    elif [ -f "client/dist/index.html" ]; then \
        echo "Found files in client/dist, copying to dist/public..."; \
        cp -r client/dist/* dist/public/; \
    else \
        echo "Build files not found in expected locations"; \
    fi && ls -la dist/public/

# Production için gereksiz dev dependencies'leri temizle
RUN npm prune --production

# Port'u expose et
EXPOSE $PORT

# Start script ile database migration + app başlatma
CMD ["sh", "-c", "npm run db:push && npm start"]