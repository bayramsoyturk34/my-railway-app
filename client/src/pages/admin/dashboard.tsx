import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Shield, Users, MessageSquare, Database, TrendingUp, 
  Activity, Settings, Bell, Calendar, BarChart3, Home,
  UserCheck, UserX, HardDrive, Zap, RefreshCw, AlertTriangle, DollarSign, Trash2
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import MaintenanceBanner from "@/components/maintenance-banner";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClientInstance = useQueryClient();
  const { user } = useAuth();

  // Admin dashboard stats with enhanced auto-refresh
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    refetchInterval: autoRefresh ? 15000 : false, // 15 seconds when enabled
    onSuccess: () => setLastUpdateTime(new Date()),
  });

  // System metrics with real-time monitoring
  const { data: systemMetrics } = useQuery({
    queryKey: ["/api/admin/system-metrics"],
    refetchInterval: autoRefresh ? 10000 : false, // 10 seconds when enabled
  });

  // Recent admin logs with live updates
  const { data: adminLogs } = useQuery({
    queryKey: ["/api/admin/logs"],
    refetchInterval: autoRefresh ? 8000 : false, // 8 seconds when enabled
  });

  // System settings to check maintenance mode
  const { data: systemSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds when enabled
  });

  // Delete all users except super admin mutation
  const deleteAllUsersMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/users/delete-all-except-super");
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: `${data.deletedCount} kullanıcı başarıyla silindi (süper admin korundu)`,
      });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClientInstance.invalidateQueries({ queryKey: ["/api/admin/dashboard-stats"] });
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Kullanıcıları silerken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const settingsMap = systemSettings?.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {}) || {};

  const isMaintenanceMode = settingsMap.maintenance_mode === "true";

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Admin panel yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = dashboardStats || {
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalStorage: 0,
    registrationsThisMonth: 0,
    messagesThisMonth: 0,
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const adminActions = [
    { 
      title: "Kullanıcı Yönetimi", 
      description: "Kullanıcıları görüntüle ve yönet",
      icon: Users, 
      color: "bg-blue-500",
      route: "/admin/users" 
    },
    { 
      title: "Sistem Ayarları", 
      description: "Genel sistem ayarlarını düzenle",
      icon: Settings, 
      color: "bg-green-500",
      route: "/admin/settings" 
    },
    { 
      title: "Duyurular", 
      description: "Sistem duyurularını yönet",
      icon: Bell, 
      color: "bg-yellow-500",
      route: "/admin/announcements" 
    },
    { 
      title: "Admin Logları", 
      description: "Sistem aktivitelerini incele",
      icon: Activity, 
      color: "bg-purple-500",
      route: "/admin/logs" 
    },
    { 
      title: "Metrikler", 
      description: "Sistem performansını izle",
      icon: BarChart3, 
      color: "bg-red-500",
      route: "/admin/metrics" 
    },
    { 
      title: "Oturumlar", 
      description: "Aktif kullanıcı oturumları",
      icon: UserCheck, 
      color: "bg-indigo-500",
      route: "/admin/sessions" 
    },
    { 
      title: "Ödeme Bildirimleri", 
      description: "Kullanıcı ödeme bildirimlerini onayla/reddet",
      icon: DollarSign, 
      color: "bg-cyan-500",
      route: "/admin/payment-notifications" 
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Maintenance Mode Banner */}
        {isMaintenanceMode && <MaintenanceBanner isAdmin={true} />}
        
        {/* Enhanced Header with Live Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>Sistem yönetimi ve izleme</span>
                <span>•</span>
                <span>Son güncelleme: {lastUpdateTime.toLocaleTimeString('tr-TR')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`border transition-colors ${
                autoRefresh 
                  ? 'border-green-500 text-green-400 hover:bg-green-500/10' 
                  : 'border-gray-500 text-gray-400 hover:bg-gray-500/10'
              }`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Canlı' : 'Manuel'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard-stats"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });
                setLastUpdateTime(new Date());
              }}
              className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Badge variant="outline" className="px-3 py-1 text-purple-400 border-purple-400">
              Yönetici
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-green-400 text-xs mt-1">
                    +{stats.registrationsThisMonth} bu ay
                  </p>
                </div>
                <Users className="h-10 w-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-green-400 text-xs">Çevrimiçi</p>
                  </div>
                </div>
                <UserCheck className="h-10 w-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Mesaj</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                  <p className="text-blue-400 text-xs mt-1">
                    +{stats.messagesThisMonth} bu ay
                  </p>
                </div>
                <MessageSquare className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Kullanılan Depolama</p>
                  <p className="text-2xl font-bold text-white">{formatBytes(stats.totalStorage)}</p>
                  <Progress value={75} className="mt-2 h-1" />
                </div>
                <HardDrive className="h-10 w-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminActions.map((action) => (
            <Card 
              key={action.route}
              className="bg-dark-secondary border-dark-accent hover:bg-dark-accent transition-colors cursor-pointer"
              onClick={() => setLocation(action.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Admin Logs */}
          <Card className="bg-dark-secondary border-dark-accent">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Canlı Admin Aktiviteleri
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs ${autoRefresh ? 'text-green-400' : 'text-gray-400'}`}>
                    {autoRefresh ? 'Canlı' : 'Durduruldu'}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminLogs && adminLogs.length > 0 ? (
                  adminLogs.slice(0, 5).map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border border-gray-600 rounded">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{log.action}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(log.createdAt).toLocaleString('tr-TR')}
                        </p>
                        {log.targetEntity && (
                          <p className="text-gray-400 text-xs">
                            Hedef: {log.targetEntity}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz admin aktivitesi yok</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-600">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-dark-accent"
                  onClick={() => setLocation("/admin/logs")}
                >
                  Tüm Logları Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-dark-secondary border-dark-accent">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Sistem Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">API Durumu</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    Çalışıyor
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Veritabanı</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    Bağlı
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">SMS Servisi</span>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    Beklemede
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Mesajlaşma</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    Aktif
                  </Badge>
                </div>
                
                <div className="mt-6 p-4 bg-dark-accent rounded border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-white text-sm font-medium">Sistem Performansı</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">CPU</span>
                      <span className="text-white">45%</span>
                    </div>
                    <Progress value={45} className="h-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Bellek</span>
                      <span className="text-white">62%</span>
                    </div>
                    <Progress value={62} className="h-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}