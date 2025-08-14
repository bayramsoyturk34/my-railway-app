import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Settings, Save, RotateCcw, Database, 
  Mail, Bell, Lock, Globe, Server
} from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDirty, setIsDirty] = useState(false);

  // Fetch system settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
  });

  // Save settings
  const saveSettingMutation = useMutation({
    mutationFn: async (setting: any) => {
      return await apiRequest("/api/admin/settings", "POST", setting);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setIsDirty(false);
      toast({
        title: "Başarılı",
        description: "Sistem ayarları kaydedildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Ayarlar kaydedilirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const settingsMap = settings?.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {}) || {};

  const handleSettingChange = (key: string, value: string) => {
    setIsDirty(true);
  };

  const saveSetting = (key: string, value: string, category: string, description: string) => {
    saveSettingMutation.mutate({
      key,
      value,
      category,
      description,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Sistem ayarları yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={() => setLocation("/admin")}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Sistem Ayarları</h1>
                <p className="text-gray-400">Genel sistem ayarlarını yapılandır</p>
              </div>
            </div>
          </div>
          {isDirty && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
                  setIsDirty(false);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Sıfırla
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={saveSettingMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-dark-secondary">
            <TabsTrigger value="general" className="text-white data-[state=active]:bg-dark-accent">
              <Globe className="h-4 w-4 mr-2" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="database" className="text-white data-[state=active]:bg-dark-accent">
              <Database className="h-4 w-4 mr-2" />
              Veritabanı
            </TabsTrigger>
            <TabsTrigger value="email" className="text-white data-[state=active]:bg-dark-accent">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-dark-accent">
              <Bell className="h-4 w-4 mr-2" />
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-dark-accent">
              <Lock className="h-4 w-4 mr-2" />
              Güvenlik
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid gap-6">
              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white">Genel Ayarlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="app-name" className="text-gray-300">Uygulama Adı</Label>
                      <Input
                        id="app-name"
                        defaultValue={settingsMap.app_name || "PuantajPro"}
                        className="bg-dark-primary border-gray-600 text-white"
                        onChange={(e) => handleSettingChange("app_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app-version" className="text-gray-300">Versiyon</Label>
                      <Input
                        id="app-version"
                        defaultValue={settingsMap.app_version || "1.0.0"}
                        className="bg-dark-primary border-gray-600 text-white"
                        onChange={(e) => handleSettingChange("app_version", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app-description" className="text-gray-300">Uygulama Açıklaması</Label>
                    <Textarea
                      id="app-description"
                      defaultValue={settingsMap.app_description || "Türk işgücü yönetim platformu"}
                      className="bg-dark-primary border-gray-600 text-white"
                      onChange={(e) => handleSettingChange("app_description", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Bakım Modu</Label>
                      <p className="text-sm text-gray-400">Sistemi geçici olarak devre dışı bırak</p>
                    </div>
                    <Switch defaultChecked={settingsMap.maintenance_mode === "true"} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-dark-accent">
                <CardHeader>
                  <CardTitle className="text-white">Performans Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout" className="text-gray-300">Oturum Süresi (dakika)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        defaultValue={settingsMap.session_timeout || "30"}
                        className="bg-dark-primary border-gray-600 text-white"
                        onChange={(e) => handleSettingChange("session_timeout", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-file-size" className="text-gray-300">Maks. Dosya Boyutu (MB)</Label>
                      <Input
                        id="max-file-size"
                        type="number"
                        defaultValue={settingsMap.max_file_size || "10"}
                        className="bg-dark-primary border-gray-600 text-white"
                        onChange={(e) => handleSettingChange("max_file_size", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Veritabanı Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-interval" className="text-gray-300">Yedekleme Aralığı (saat)</Label>
                    <Input
                      id="backup-interval"
                      type="number"
                      defaultValue={settingsMap.backup_interval || "24"}
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-retention" className="text-gray-300">Yedek Saklama (gün)</Label>
                    <Input
                      id="backup-retention"
                      type="number"
                      defaultValue={settingsMap.backup_retention || "7"}
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Otomatik Yedekleme</Label>
                    <p className="text-sm text-gray-400">Veritabanı otomatik yedekleme etkin</p>
                  </div>
                  <Switch defaultChecked={settingsMap.auto_backup === "true"} />
                </div>

                <div className="pt-4 border-t border-gray-600">
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Database className="h-4 w-4 mr-2" />
                    Manuel Yedekleme Başlat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host" className="text-gray-300">SMTP Sunucu</Label>
                    <Input
                      id="smtp-host"
                      defaultValue={settingsMap.smtp_host || ""}
                      placeholder="smtp.gmail.com"
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port" className="text-gray-300">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      defaultValue={settingsMap.smtp_port || "587"}
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-user" className="text-gray-300">SMTP Kullanıcı</Label>
                    <Input
                      id="smtp-user"
                      defaultValue={settingsMap.smtp_user || ""}
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email" className="text-gray-300">Gönderen Email</Label>
                    <Input
                      id="from-email"
                      type="email"
                      defaultValue={settingsMap.from_email || ""}
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-gray-300">Email Bildirimleri</Label>
                    <p className="text-sm text-gray-400">Sistem email bildirimlerini etkinleştir</p>
                  </div>
                  <Switch defaultChecked={settingsMap.email_notifications === "true"} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Bildirim Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">SMS Bildirimleri</Label>
                      <p className="text-sm text-gray-400">SMS bildirimleri gönder</p>
                    </div>
                    <Switch defaultChecked={settingsMap.sms_notifications === "true"} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Push Bildirimleri</Label>
                      <p className="text-sm text-gray-400">Tarayıcı push bildirimleri</p>
                    </div>
                    <Switch defaultChecked={settingsMap.push_notifications === "true"} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Admin Uyarıları</Label>
                      <p className="text-sm text-gray-400">Önemli sistem olayları için uyarı gönder</p>
                    </div>
                    <Switch defaultChecked={settingsMap.admin_alerts === "true"} />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-600">
                  <div className="space-y-2">
                    <Label htmlFor="notification-retention" className="text-gray-300">Bildirim Saklama (gün)</Label>
                    <Input
                      id="notification-retention"
                      type="number"
                      defaultValue={settingsMap.notification_retention || "30"}
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Güvenlik Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password-min-length" className="text-gray-300">Min. Şifre Uzunluğu</Label>
                    <Input
                      id="password-min-length"
                      type="number"
                      defaultValue={settingsMap.password_min_length || "8"}
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-attempts" className="text-gray-300">Maks. Giriş Denemesi</Label>
                    <Input
                      id="login-attempts"
                      type="number"
                      defaultValue={settingsMap.max_login_attempts || "5"}
                      className="bg-dark-primary border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">İki Faktörlü Doğrulama</Label>
                      <p className="text-sm text-gray-400">Kullanıcılar için 2FA zorunlu tut</p>
                    </div>
                    <Switch defaultChecked={settingsMap.require_2fa === "true"} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">IP Kısıtlama</Label>
                      <p className="text-sm text-gray-400">Belirli IP adreslerinden erişim sınırla</p>
                    </div>
                    <Switch defaultChecked={settingsMap.ip_restriction === "true"} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Audit Logları</Label>
                      <p className="text-sm text-gray-400">Tüm kullanıcı aktivitelerini kaydet</p>
                    </div>
                    <Switch defaultChecked={settingsMap.audit_logs === "true"} />
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