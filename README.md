# Puantropls - Employee Management System

Modern, full-stack employee management and project tracking application built with React, TypeScript, Node.js, and PostgreSQL.

## 🚀 Features

- **Employee Management** - Personnel records, timesheets, salary tracking
- **Project Management** - Project creation, task assignment, progress tracking  
- **Financial Management** - Transaction tracking, payment management, reporting
- **Customer Management** - Client records, quotes, task management
- **Admin Dashboard** - System metrics, user management, logs
- **Real-time Updates** - Live notifications and data synchronization
- **JWT Authentication** - Secure user authentication and authorization

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **React Hook Form** for form handling

### Backend  
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **JWT** for authentication
- **bcrypt** for password hashing

## 🚀 Railway Deployment

### Quick Deploy to Railway

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Railway deployment ready"
   git push origin main
   ```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Add PostgreSQL database
   - Set environment variables:
     - `JWT_SECRET=your-secure-jwt-secret`
     - `NODE_ENV=production`
   - Deploy automatically!

📋 **Detailed deployment guide:** [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- **Müşteri Portal**: Firma dizini, mesajlaşma
- **Raporlar**: Detaylı finansal ve operasyonel raporlar

## 🛠️ Teknolojiler

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **Auth**: JWT tabanlı kimlik doğrulama
- **UI**: Radix UI, Lucide Icons

## 📦 Kurulum

### Gereksinimler

- Node.js 18+ 
- PostgreSQL 14+
- npm veya yarn

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd puantropls
```

### 2. Dependencies'leri Yükleyin

```bash
npm install
```

### 3. Environment Dosyasını Oluşturun

`.env.example` dosyasını `.env` olarak kopyalayın ve değerleri düzenleyin:

```bash
cp .env.example .env
```

### 4. PostgreSQL Veritabanı Ayarlayın

PostgreSQL'de yeni bir database oluşturun:

```sql
CREATE DATABASE puantropls;
CREATE USER puantropls_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE puantropls TO puantropls_user;
```

`.env` dosyasındaki DATABASE_URL'yi güncelleyin:

```env
DATABASE_URL=postgresql://puantropls_user:your_password@localhost:5432/puantropls
```

### 5. Database Migration'ları Çalıştırın

```bash
npm run db:push
```

### 6. Uygulamayı Başlatın

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

Uygulama http://localhost:5000 adresinde çalışacaktır.

## 🔐 Demo Hesap

Demo hesap bilgileri:
- **Email**: demo@puantajpro.com
- **Şifre**: demo123

## 🗂️ Proje Yapısı

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI bileşenleri
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Yardımcı fonksiyonlar
├── server/                # Express backend
│   ├── auth.ts           # Kimlik doğrulama
│   ├── routes.ts         # API rotaları
│   ├── storage.ts        # Database işlemleri
│   └── db.ts            # Database bağlantısı
├── shared/               # Ortak kod
│   └── schema.ts        # Database şeması
└── package.json
```

## 🔧 Geliştirme

### Yeni Özellik Ekleme

1. Database şemasını güncelleyin (`shared/schema.ts`)
2. Migration'ları çalıştırın (`npm run db:push`)
3. Backend API'sını güncelleyin (`server/routes.ts`)
4. Frontend bileşenlerini ekleyin

### Database Değişiklikleri

```bash
# Şemayı değiştirdikten sonra:
npm run db:generate  # Migration dosyası oluştur
npm run db:migrate   # Migration'ları çalıştır
```

## 🚀 Production Deployment

### Environment Variables

Production'da aşağıdaki environment variables'ları ayarlayın:

```env
NODE_ENV=production
DATABASE_URL=<production-postgresql-url>
JWT_SECRET=<strong-random-secret>
COOKIE_SECRET=<strong-random-secret>
PORT=5000
```

### Build ve Deploy

```bash
npm run build
npm start
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `GET /api/auth/user` - Mevcut kullanıcı bilgisi
- `POST /api/auth/logout` - Çıkış

### Personnel
- `GET /api/personnel` - Personel listesi
- `POST /api/personnel` - Yeni personel
- `PUT /api/personnel/:id` - Personel güncelleme
- `DELETE /api/personnel/:id` - Personel silme

### Projects
- `GET /api/projects` - Proje listesi
- `POST /api/projects` - Yeni proje
- `PUT /api/projects/:id` - Proje güncelleme
- `DELETE /api/projects/:id` - Proje silme

## 🐛 Troubleshooting

### Database Bağlantı Sorunu
- PostgreSQL servisinin çalıştığından emin olun
- DATABASE_URL'nin doğru olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### Build Hataları
- `node_modules` klasörünü silin ve `npm install` çalıştırın
- Node.js sürümünüzün 18+ olduğundan emin olun

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 License

Bu proje MIT lisansı altında lisanslanmıştır.