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
  Home
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const paymentFormSchema = z.object({
  paymentDate: z.string().min(1, "Ödeme tarihi gereklidir"),
  senderName: z.string().min(2, "Gönderen adı en az 2 karakter olmalıdır"),
  senderBank: z.string().min(2, "Banka adı en az 2 karakter olmalıdır"),
  amount: z.string().min(1, "Tutar gereklidir"),
  description: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;
type PaymentFormData = z.infer<typeof paymentFormSchema>;

export default function Account() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // User preferences state - Load from localStorage
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
    return saved ? JSON.parse(saved) : true;
  });

  // Apply theme and compact view effects
  useEffect(() => {
    const root = document.documentElement;
    if (darkTheme) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkTheme', JSON.stringify(darkTheme));
  }, [darkTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (compactView) {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }
    localStorage.setItem('compactView', JSON.stringify(compactView));
  }, [compactView]);

  useEffect(() => {
    localStorage.setItem('autoSave', JSON.stringify(autoSave));
  }, [autoSave]);

  // Fetch payment settings for normal users
  const { data: paymentSettings } = useQuery({
    queryKey: ["/api/payment-info"],
    retry: false,
  });

  // Profile form - MUST be defined before early returns
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Payment form
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentDate: "",
      senderName: "",
      senderBank: "",
      amount: "99",
      description: "",
    },
  });

  // Update form values when user data changes
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
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("/api/auth/profile", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Profil güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      return await apiRequest("/api/auth/change-password", "POST", data);
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Başarılı",
        description: "Şifreniz başarıyla değiştirildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Şifre değiştirilirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Payment notification mutation
  const paymentNotificationMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      return await apiRequest("/api/payment/notify", "POST", data);
    },
    onSuccess: () => {
      paymentForm.reset();
      toast({
        title: "Başarılı",
        description: "Ödeme bildiriminiz alındı. En kısa sürede işleme alınacaktır.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Ödeme bildirimi gönderilirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Profile photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Use the same authentication mechanism as other API calls
      const token = localStorage.getItem('sessionId');
      const response = await fetch('/api/auth/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Fotoğraf yüklenirken hata oluştu');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız güncellendi.",
      });
      setProfilePicture(null);
      setPreviewUrl(null);
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Fotoğraf yüklenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const onPaymentSubmit = (data: PaymentFormData) => {
    paymentNotificationMutation.mutate(data);
  };

  // Handle photo file selection
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Hata",
          description: "Dosya boyutu 5MB'dan büyük olamaz.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast({
          title: "Hata", 
          description: "Sadece JPG ve PNG formatları desteklenmektedir.",
          variant: "destructive",
        });
        return;
      }

      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      uploadPhotoMutation.mutate(file);
    }
  };

  // Trigger file input
  const triggerPhotoUpload = () => {
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    fileInput?.click();
  };

  // Show loading state - moved after hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  // Redirect if not authenticated - moved after hooks
  if (!user) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Hesabım</h1>
              <p className="text-gray-400">Hesap bilgilerinizi yönetin</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="icon" className="bg-dark-secondary border-dark-border hover:bg-dark-accent">
              <Home className="h-4 w-4 text-white" />
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-dark-secondary">
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-dark-accent">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-dark-accent">
              <Lock className="h-4 w-4 mr-2" />
              Güvenlik
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-dark-accent">
              <Bell className="h-4 w-4 mr-2" />
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-white data-[state=active]:bg-dark-accent">
              <Globe className="h-4 w-4 mr-2" />
              Tercihler
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-white data-[state=active]:bg-dark-accent">
              <CreditCard className="h-4 w-4 mr-2" />
              Ödeme
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profil Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={previewUrl || user?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-dark-accent text-white text-lg">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-600 text-gray-300"
                        onClick={triggerPhotoUpload}
                        disabled={uploadPhotoMutation.isPending}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {uploadPhotoMutation.isPending ? "Yükleniyor..." : "Fotoğraf Değiştir"}
                      </Button>
                      <p className="text-sm text-gray-400">
                        JPG, PNG formatında, maksimum 5MB
                      </p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
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
                                  className="bg-dark-primary border-gray-600 text-white"
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
                                  className="bg-dark-primary border-gray-600 text-white"
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
                                type="email"
                                className="bg-dark-primary border-gray-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={updateProfileMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Profili Güncelle
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Güvenlik Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
                                className="bg-dark-primary border-gray-600 text-white pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
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
                                className="bg-dark-primary border-gray-600 text-white pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
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
                          <FormLabel className="text-gray-300">Yeni Şifre (Tekrar)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                className="bg-dark-primary border-gray-600 text-white pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
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

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-red-600 hover:bg-red-700"
                        disabled={changePasswordMutation.isPending}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Şifreyi Değiştir
                      </Button>
                    </div>
                  </form>
                </Form>

                <div className="pt-6 border-t border-gray-600">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-gray-300">İki Faktörlü Doğrulama</Label>
                        <p className="text-sm text-gray-400">Hesabınızı ekstra güvenlik katmanıyla koruyun</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Bildirim Tercihleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Email Bildirimleri</Label>
                      <p className="text-sm text-gray-400">Önemli güncellemeler için email gönder</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">SMS Bildirimleri</Label>
                      <p className="text-sm text-gray-400">Kritik olaylar için SMS gönder</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Tarayıcı Bildirimleri</Label>
                      <p className="text-sm text-gray-400">Tarayıcıda anlık bildirimler göster</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Pazarlama Emailları</Label>
                      <p className="text-sm text-gray-400">Yeni özellikler ve güncellemeler hakkında bilgi al</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <div className="grid gap-6">
              {/* Subscription Status */}
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Abonelik Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-primary rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        Mevcut Plan: <span className={`${(user as any)?.subscriptionType === 'PRO' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {(user as any)?.subscriptionType === 'PRO' ? 'PRO Plan' : 'DEMO'}
                        </span>
                      </p>
                      <p className="text-gray-400 text-sm">
                        {(user as any)?.subscriptionType === 'PRO' 
                          ? 'Tüm özelliklere erişim var' 
                          : 'Sınırlı özelliklere erişiminiz var'
                        }
                      </p>
                    </div>
                    {(user as any)?.subscriptionType === 'DEMO' && (
                      <div className="flex items-center gap-2 text-orange-400">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm">Yükseltme Gerekli</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* PRO Subscription Card - Only show for DEMO users */}
              {(user as any)?.subscriptionType !== 'PRO' && (
                <Card className="bg-dark-secondary border-dark-accent">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      PRO Abonelik Satın Al
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-lg border border-blue-500/30">
                      <h3 className="text-white font-bold text-xl mb-2">PRO Üyelik - {paymentSettings?.amount || "99 TL"}/Ay</h3>
                      <ul className="text-gray-300 space-y-2 mb-4">
                        <li>• Sınırsız personel ekleme</li>
                        <li>• Sınırsız proje yönetimi</li>
                        <li>• Detaylı raporlama</li>
                        <li>• Firma rehberi ve mesajlaşma</li>
                        <li>• Toplu SMS gönderimi</li>
                        <li>• Öncelikli müşteri desteği</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information - Always show */}
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Ödeme Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Ödeme Yöntemi: {paymentSettings?.paymentMethod || "EFT/Havale"}</h4>
                    
                    <div className="bg-dark-primary p-4 rounded-lg space-y-3">
                      <p className="text-gray-300 font-medium">Banka Bilgileri:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Banka:</span>
                          <span className="text-white">{paymentSettings?.bankName || "Ziraat Bankası"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hesap Sahibi:</span>
                          <span className="text-white">{paymentSettings?.accountHolder || "puantropls Ltd."}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">IBAN:</span>
                          <span className="text-white font-mono text-xs">{paymentSettings?.iban || "TR64 0001 0017 4513 6456 7890 01"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tutar:</span>
                          <span className="text-white font-bold">{paymentSettings?.amount || "99 TL"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
                      <p className="text-orange-400 font-medium mb-2">Önemli Bilgi:</p>
                      <p className="text-gray-300 text-sm">
                        Ödemenizi yaptıktan sonra aşağıdaki formu doldurarak bize bildiriniz. 
                        Ödemeniz onaylandıktan sonra hesabınız PRO'ya yükseltilecektir.
                      </p>
                    </div>

                    <Form {...paymentForm}>
                      <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                        <FormField
                          control={paymentForm.control}
                          name="paymentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Havale/EFT Tarihi</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-dark-primary border-gray-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="senderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Gönderen Hesap Sahibi Adı</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ödemeyi yapan kişinin adı soyadı"
                                  className="bg-dark-primary border-gray-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="senderBank"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Gönderen Banka</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ödemenin yapıldığı banka adı"
                                  className="bg-dark-primary border-gray-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Havale/EFT Tutarı</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="99 TL"
                                  className="bg-dark-primary border-gray-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Ek Açıklama (İsteğe bağlı)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Varsa ek bilgiler veya notlar"
                                  className="bg-dark-primary border-gray-600 text-white"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={paymentNotificationMutation.isPending}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {paymentNotificationMutation.isPending ? "Gönderiliyor..." : "Ödeme Bildirimini Gönder"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Kullanıcı Tercihleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Dil</Label>
                    <Input
                      defaultValue="Türkçe"
                      className="bg-dark-primary border-gray-600 text-white"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Saat Dilimi</Label>
                    <Input
                      defaultValue="Turkey (UTC+3)"
                      className="bg-dark-primary border-gray-600 text-white"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Karanlık Tema</Label>
                      <p className="text-sm text-gray-400">Karanlık arayüz temasını kullan</p>
                    </div>
                    <Switch 
                      checked={darkTheme} 
                      onCheckedChange={(checked) => {
                        console.log('🎨 Dark theme changing to:', checked);
                        setDarkTheme(checked);
                        // Manual immediate effect
                        const root = document.documentElement;
                        if (checked) {
                          root.classList.add('dark');
                          console.log('✅ Added dark class');
                        } else {
                          root.classList.remove('dark');
                          console.log('✅ Removed dark class');
                        }
                        if (autoSave) {
                          toast({
                            title: "Tema Değiştirildi",
                            description: checked ? "Karanlık tema aktifleştirildi" : "Açık tema aktifleştirildi",
                          });
                        }
                      }} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Kompakt Görünüm</Label>
                      <p className="text-sm text-gray-400">Daha sıkışık arayüz kullan</p>
                    </div>
                    <Switch 
                      checked={compactView} 
                      onCheckedChange={(checked) => {
                        console.log('📏 Compact view changing to:', checked);
                        setCompactView(checked);
                        // Manual immediate effect
                        const root = document.documentElement;
                        if (checked) {
                          root.classList.add('compact');
                          console.log('✅ Added compact class');
                        } else {
                          root.classList.remove('compact');
                          console.log('✅ Removed compact class');
                        }
                        if (autoSave) {
                          toast({
                            title: "Görünüm Değiştirildi",
                            description: checked ? "Kompakt görünüm aktifleştirildi" : "Normal görünüm aktifleştirildi",
                          });
                        }
                      }} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Otomatik Kaydetme</Label>
                      <p className="text-sm text-gray-400">Değişiklikleri otomatik olarak kaydet</p>
                    </div>
                    <Switch 
                      checked={autoSave} 
                      onCheckedChange={(checked) => {
                        setAutoSave(checked);
                        toast({
                          title: "Otomatik Kaydetme",
                          description: checked ? "Otomatik kaydetme aktifleştirildi" : "Otomatik kaydetme kapatıldı",
                        });
                      }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}