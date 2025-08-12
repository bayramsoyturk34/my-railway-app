// Test script to add sample companies for demonstration
const sampleCompanies = [
  {
    companyName: "TechCorp Yazılım",
    contactPerson: "Ahmet Yılmaz",
    phone: "+90 532 123 4567",
    email: "info@techcorp.com",
    address: "Maslak Mahallesi, Teknoloji Caddesi No:15 Şişli/İstanbul",
    city: "İstanbul",
    industry: "Teknoloji",
    website: "www.techcorp.com",
    description: "Kurumsal yazılım çözümleri ve dijital dönüşüm hizmetleri",
    bio: "25 yıllık deneyimle Türkiye'nin önde gelen yazılım şirketlerinden biri. Enterprise çözümler, mobil uygulama geliştirme ve cloud hizmetlerinde uzman.",
    logoUrl: "https://via.placeholder.com/64/4CAF50/FFFFFF?text=TC",
    isActive: true,
    isProVisible: true,
    subscriptionStatus: "PRO",
    isVerified: true
  },
  {
    companyName: "Başkent İnşaat",
    contactPerson: "Fatma Özkan",
    phone: "+90 312 555 7890",
    email: "iletisim@baskentinsaat.com",
    address: "Çankaya Mahallesi, İnşaat Sokak No:42 Çankaya/Ankara",
    city: "Ankara",
    industry: "İnşaat",
    website: "www.baskentinsaat.com",
    description: "Konut ve ticari yapı inşaatı, tadilat ve restorasyon hizmetleri",
    bio: "1995'ten beri faaliyet gösteren köklü inşaat firması. Kaliteli yapı malzemeleri ve deneyimli ekibi ile güvenilir hizmet sunar.",
    logoUrl: "https://via.placeholder.com/64/FF9800/FFFFFF?text=Bİ",
    isActive: true,
    isProVisible: true,
    subscriptionStatus: "ENTERPRISE",
    isVerified: true
  },
  {
    companyName: "Ege Üretim Sanayi",
    contactPerson: "Mehmet Kaya",
    phone: "+90 232 444 1122",
    email: "satis@egeuretim.com",
    address: "Organize Sanayi Bölgesi, 15. Cadde No:78 Bornova/İzmir",
    city: "İzmir",
    industry: "Üretim",
    website: "www.egeuretim.com",
    description: "Plastik ve metal parça üretimi, endüstriyel çözümler",
    bio: "Modern teknoloji ve kalite standartları ile üretim yapan, uluslararası sertifikalara sahip üretim tesisi.",
    logoUrl: "https://via.placeholder.com/64/2196F3/FFFFFF?text=EÜ",
    isActive: true,
    isProVisible: false,
    subscriptionStatus: "FREE",
    isVerified: false
  },
  {
    companyName: "Bursa Lojistik",
    contactPerson: "Ayşe Demir",
    phone: "+90 224 333 5566",
    email: "info@bursalojistik.com",
    address: "Nilüfer Mahallesi, Lojistik Bulvarı No:23 Nilüfer/Bursa",
    city: "Bursa",
    industry: "Hizmet",
    website: "www.bursalojistik.com",
    description: "Nakliye, depolama ve lojistik yönetim hizmetleri",
    bio: "Türkiye genelinde hızlı ve güvenilir lojistik çözümleri sunan, 20+ yıl deneyimli ekibi olan firma.",
    logoUrl: "https://via.placeholder.com/64/9C27B0/FFFFFF?text=BL",
    isActive: true,
    isProVisible: true,
    subscriptionStatus: "PRO",
    isVerified: true
  }
];

console.log("Sample companies data prepared:", sampleCompanies.length, "companies");