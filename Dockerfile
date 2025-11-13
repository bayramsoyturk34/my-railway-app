# Railway için optimize edilmiş Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Tüm dependencies'leri kur (build için gerekli)
RUN npm ci

# Uygulama kodunu kopyala
COPY . .

# Build işlemini yap
RUN npm run build

# Production için gereksiz dev dependencies'leri temizle
RUN npm prune --production

# Port'u expose et
EXPOSE $PORT

# Uygulamayı başlat
CMD ["npm", "start"]