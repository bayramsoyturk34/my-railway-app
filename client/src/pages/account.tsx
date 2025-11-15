import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  Eye, 
  EyeOff,
  Shield,
  Bell,
  Globe,
  CreditCard,
  AlertCircle,
  Home,
  Menu,
  X,
  ChevronRight,
  Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Form schemas
const profileFormSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string().min(6, "Şifre doğrulama gereklidir"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function Account() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("profil");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // User preferences state
  const [compactView, setCompactView] = useState(() => {
    const saved = localStorage.getItem('compactView');
    return saved ? JSON.parse(saved) : false;
  });
  const [autoSave, setAutoSave] = useState(() => {
    const saved = localStorage.getItem('autoSave');
    return saved ? JSON.parse(saved) : true;
  });
  const [darkTheme, setDarkTheme] = useState(() => {
    const saved = localStorage.getItem('darkTheme');
    return saved ? JSON.parse(saved) : false;  // Default to light theme
  });
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = localStorage.getItem('emailNotifications');
    return saved ? JSON.parse(saved) : true;
  });
  const [smsNotifications, setSmsNotifications] = useState(() => {
    const saved = localStorage.getItem('smsNotifications');
    return saved ? JSON.parse(saved) : false;
  });
  const [pushNotifications, setPushNotifications] = useState(() => {
    const saved = localStorage.getItem('pushNotifications');
    return saved ? JSON.parse(saved) : true;
  });
  const [marketingNotifications, setMarketingNotifications] = useState(() => {
    const saved = localStorage.getItem('marketingNotifications');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Profile image upload state
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Apply theme effects
  useEffect(() => {
    const root = document.documentElement;
    if (darkTheme) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkTheme', JSON.stringify(darkTheme));
  }, [darkTheme]);

  // Listen for section changes from external sources (like dashboard menu)
  useEffect(() => {
    const handleSectionChange = (event: any) => {
      if (event.detail) {
        setActiveSection(event.detail);
        setSidebarOpen(false); // Close sidebar if open
      }
    };

    window.addEventListener('setAccountSection', handleSectionChange);
    return () => {
      window.removeEventListener('setAccountSection', handleSectionChange);
    };
  }, []);

  // Form instances
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    }
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user, profileForm]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiRequest("/api/user/profile", "PUT", data),
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => apiRequest("/api/user/password", "PUT", data),
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Şifreniz güncellendi",
      });
      passwordForm.reset();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Şifre güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Update profile image mutation
  const updateProfileImageMutation = useMutation({
    mutationFn: (profileImageUrl: string) => apiRequest("/api/user/profile-image", "PUT", { profileImageUrl }),
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Profil resminiz güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setSelectedProfileImage(null);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil resmi güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: (settings: any) => apiRequest("/api/user/notifications", "PUT", settings),
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Bildirim ayarlarınız güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Bildirim ayarları güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  const handleProfileImageUpload = async (file: File) => {
    setUploadingImage(true);
    console.log("Starting file upload:", file.name, file.size);
    
    try {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Sadece resim dosyaları yüklenebilir');
      }

      const formData = new FormData();
      formData.append('image', file);
      
      console.log("Sending upload request...");
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      console.log("Upload response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Upload successful, URL:", result.url);
        updateProfileImageMutation.mutate(result.url);
      } else {
        const errorData = await response.text();
        console.error("Upload failed:", response.status, errorData);
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Profile image upload error:", error);
      toast({
        title: "Hata",
        description: error.message || "Resim yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    const settings = {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      marketingNotifications,
      [type]: value
    };
    
    // Update local state
    switch(type) {
      case 'emailNotifications':
        setEmailNotifications(value);
        localStorage.setItem('emailNotifications', JSON.stringify(value));
        break;
      case 'smsNotifications':
        setSmsNotifications(value);
        localStorage.setItem('smsNotifications', JSON.stringify(value));
        break;
      case 'pushNotifications':
        setPushNotifications(value);
        localStorage.setItem('pushNotifications', JSON.stringify(value));
        break;
      case 'marketingNotifications':
        setMarketingNotifications(value);
        localStorage.setItem('marketingNotifications', JSON.stringify(value));
        break;
    }
    
    // Update on server
    updateNotificationsMutation.mutate(settings);
  };

  const menuItems = [
    { id: "profil", label: "Profil", icon: User },
    { id: "guvenlik", label: "Güvenlik", icon: Shield },
    { id: "abonelik", label: "Abonelik", icon: CreditCard },
    { id: "bildirimler", label: "Bildirimler", icon: Bell },
    { id: "tercihler", label: "Tercihler", icon: Settings },
    { id: "odeme", label: "Ödeme", icon: CreditCard },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profil":
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedProfileImage(file);
                        handleProfileImageUpload(file);
                      }
                    }}
                    className="hidden"
                    id="profile-image-input"
                  />
                  <label htmlFor="profile-image-input">
                    <Button 
                      variant="outline" 
                      className="text-gray-300 border-gray-600 cursor-pointer"
                      disabled={uploadingImage}
                      asChild
                    >
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        {uploadingImage ? "Yükleniyor..." : "Fotoğraf Değiştir"}
                      </span>
                    </Button>
                  </label>
                  {selectedProfileImage && (
                    <p className="text-sm text-gray-400">{selectedProfileImage.name}</p>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Ad</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-gray-700 border-gray-600 text-white"
                              style={{ color: 'white' }}
                              placeholder="Adınız"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Soyad</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-gray-700 border-gray-600 text-white"
                              style={{ color: 'white' }}
                              placeholder="Soyadınız"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-gray-700 border-gray-600 text-white"
                            style={{ color: 'white' }}
                            placeholder="email@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "guvenlik":
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Güvenlik Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Mevcut Şifre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field}
                              type={showCurrentPassword ? "text" : "password"}
                              className="bg-gray-700 border-gray-600 text-white pr-10"
                              style={{ color: 'white' }}
                              placeholder="Mevcut \u015fifreniz"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Yeni Şifre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field}
                              type={showNewPassword ? "text" : "password"}
                              className="bg-gray-700 border-gray-600 text-white pr-10"
                              style={{ color: 'white' }}
                              placeholder="Yeni \u015fifreniz"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Şifre Doğrulama</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              className="bg-gray-700 border-gray-600 text-white pr-10"
                              style={{ color: 'white' }}
                              placeholder="\u015eifrenizi tekrar giriniz"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={updatePasswordMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {updatePasswordMutation.isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case "abonelik":
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Abonelik Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-white">PRO Üyelik</span>
                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">Aktif</span>
                </div>
                <p className="text-gray-300 text-sm">Tüm premium özelliklere erişiminiz bulunuyor</p>
                <p className="text-gray-400 text-xs mt-2">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
              <Button className="w-full" variant="outline">
                Abonelik Detayları
              </Button>
            </CardContent>
          </Card>
        );

      case "bildirimler":
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Email Bildirimleri</Label>
                    <p className="text-sm text-gray-500">Önemli güncellemeleri email ile alın</p>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">SMS Bildirimleri</Label>
                    <p className="text-sm text-gray-500">Acil durumlar için SMS bildirim</p>
                  </div>
                  <Switch 
                    checked={smsNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Push Bildirimleri</Label>
                    <p className="text-sm text-gray-500">Tarayıcı bildirimleri</p>
                  </div>
                  <Switch 
                    checked={pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Pazarlama Bildirimleri</Label>
                    <p className="text-sm text-gray-500">Yeni özellik ve kampanyalar</p>
                  </div>
                  <Switch 
                    checked={marketingNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('marketingNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "odeme":
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ödeme Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-white">Kredi Kartı</span>
                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">Aktif</span>
                </div>
                <p className="text-gray-300 text-sm">**** **** **** 1234</p>
                <p className="text-gray-400 text-xs mt-2">Son kullanma: 12/26</p>
              </div>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  Kart Bilgilerini Güncelle
                </Button>
                <Button className="w-full" variant="outline">
                  Yeni Kart Ekle
                </Button>
                <Button className="w-full" variant="outline">
                  Ödeme Geçmişi
                </Button>
                <Button className="w-full" variant="outline">
                  Fatura İndirme
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "tercihler":
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Uygulama Tercihleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Karanlık Tema</Label>
                  <Switch 
                    checked={darkTheme}
                    onCheckedChange={(checked) => setDarkTheme(checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Kompakt Görünüm</Label>
                  <Switch 
                    checked={compactView}
                    onCheckedChange={(checked) => {
                      setCompactView(checked);
                      localStorage.setItem('compactView', JSON.stringify(checked));
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Otomatik Kaydetme</Label>
                  <Switch 
                    checked={autoSave}
                    onCheckedChange={(checked) => {
                      setAutoSave(checked);
                      localStorage.setItem('autoSave', JSON.stringify(checked));
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return <div className="text-white">Sayfa bulunamadı</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {/* Mobile Layout */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out pt-16 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:w-64`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Hesap Ayarları</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-white">
              {menuItems.find(item => item.id === activeSection)?.label || 'Hesabım'}
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-gray-700"
              onClick={() => setLocation("/")}
            >
              <Home className="h-6 w-6" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}