# Railway için optimize edilmiş Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Dependencies'leri kur
RUN npm ci --omit=dev

# Uygulama kodunu kopyala
COPY . .

# Build işlemini yap
RUN npm run build

# Port'u expose et
EXPOSE $PORT

# Uygulamayı başlat
CMD ["npm", "start"]