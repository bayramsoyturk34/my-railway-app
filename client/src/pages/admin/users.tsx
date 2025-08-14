import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Users, UserCheck, UserX, Mail, Calendar, Clock,
  Shield, ShieldOff, Search, Filter, MoreVertical, Ban, 
  Key, LogOut, FileText, Eye, AlertTriangle, Crown, 
  UserCog, Building, Download, Plus, UserPlus
} from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const { toast } = useToast();

  // Fetch current user to check if SUPER_ADMIN
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch all users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // User has admin access if they are either SUPER_ADMIN, ADMIN, or have isAdmin flag
  const hasAdminAccess = (currentUser as any)?.role === 'SUPER_ADMIN' || 
                        (currentUser as any)?.role === 'ADMIN' || 
                        (currentUser as any)?.isAdmin === true;
  
  const isSuperAdmin = (currentUser as any)?.role === 'SUPER_ADMIN';
  
  console.log('Current user data:', currentUser);
  console.log('Has Admin Access:', hasAdminAccess);
  console.log('Is Super Admin:', isSuperAdmin);

  // SUPER_ADMIN: Role management
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) => {
      return await apiRequest(`/api/admin/users/${userId}/role`, "PUT", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı rolü güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Rol güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // SUPER_ADMIN: Status management (ACTIVE ⇄ SUSPENDED)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'ACTIVE' | 'SUSPENDED' }) => {
      return await apiRequest(`/api/admin/users/${userId}/status`, "PUT", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı durumu güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Durum güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // SUPER_ADMIN: Force logout all sessions
  const terminateSessionsMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}/terminate-sessions`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kullanıcının tüm oturumları sonlandırıldı.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Oturum sonlandırma başarısız.",
        variant: "destructive",
      });
    },
  });

  // SUPER_ADMIN: Send password reset
  const sendPasswordResetMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}/reset-password`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Parola sıfırlama bağlantısı gönderildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Parola sıfırlama başarısız.",
        variant: "destructive",
      });
    },
  });

  // SUPER_ADMIN: Create invitation
  const createInvitationMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'USER' | 'ADMIN' }) => {
      return await apiRequest(`/api/admin/invitations`, "POST", { email, role });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Davet bağlantısı oluşturuldu ve gönderildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Davet oluşturma başarısız.",
        variant: "destructive",
      });
    },
  });

  // Toggle user active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return await apiRequest(`/api/admin/users/${userId}/active`, "PUT", { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı durumu güncellendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı durumu güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Kullanıcılar yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced filtering with role and status
  const filteredUsers = (users as any[])?.filter((user: any) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.status !== 'SUSPENDED') ||
      (statusFilter === "suspended" && user.status === 'SUSPENDED');
    
    const matchesRole = roleFilter === "all" ||
      (roleFilter === "admin" && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) ||
      (roleFilter === "user" && user.role === 'USER');
    
    return matchesSearch && matchesStatus && matchesRole;
  }) || [];

  const stats = {
    total: (users as any[])?.length || 0,
    active: (users as any[])?.filter((u: any) => u.status !== 'SUSPENDED').length || 0,
    suspended: (users as any[])?.filter((u: any) => u.status === 'SUSPENDED').length || 0,
    admins: (users as any[])?.filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length || 0,
    users: (users as any[])?.filter((u: any) => u.role === 'USER').length || 0,
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header for SUPER_ADMIN */}
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
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
                  {isSuperAdmin && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      SUPER ADMIN
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400">
                  {isSuperAdmin ? 'Tam sistem kontrolü ve kullanıcı yönetimi' : 'Kullanıcıları görüntüle ve yönet'}
                </p>
              </div>
            </div>
          </div>
          
          {hasAdminAccess && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-400 hover:bg-green-600/10"
                onClick={() => {
                  try {
                    if (!users || users.length === 0) {
                      toast({
                        title: "Hata",
                        description: "Dışa aktarılacak kullanıcı bulunamadı.",
                        variant: "destructive",
                      });
                      return;
                    }

                    const csvData = (users as any[]).map(u => ({
                      Email: u.email,
                      "Ad Soyad": `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                      Rol: u.role === 'SUPER_ADMIN' ? 'Süper Admin' : u.role === 'ADMIN' ? 'Admin' : 'Kullanıcı',
                      Durum: u.status === 'SUSPENDED' ? 'Askıya Alındı' : 'Aktif',
                      "Kayıt Tarihi": new Date(u.createdAt).toLocaleDateString('tr-TR'),
                      "Son Güncelleme": new Date(u.updatedAt).toLocaleDateString('tr-TR')
                    }));

                    // Create CSV content with Turkish headers
                    const headers = Object.keys(csvData[0]);
                    const csvContent = [
                      headers.join(','),
                      ...csvData.map(row => 
                        Object.values(row).map(value => {
                          const str = value === null || value === undefined ? '' : String(value);
                          return str.includes(',') ? `"${str}"` : str;
                        }).join(',')
                      )
                    ].join('\n');

                    // Create and download file
                    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `kullanicilar_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    toast({
                      title: "Başarılı",
                      description: `${users.length} kullanıcı CSV formatında dışa aktarıldı.`,
                    });
                  } catch (error) {
                    console.error('Export error:', error);
                    toast({
                      title: "Hata",
                      description: "Dışa aktarma sırasında hata oluştu.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Dışa Aktar
              </Button>
              {isSuperAdmin && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                  onClick={() => {
                    const email = prompt("Davet gönderilecek e-posta adresini girin:");
                    if (email) {
                      createInvitationMutation.mutate({ email, role: 'USER' });
                    }
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Davet Gönder
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Aktif</p>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Admin</p>
                  <p className="text-2xl font-bold text-white">{stats.admins}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Askıya Alınmış</p>
                  <p className="text-2xl font-bold text-white">{stats.suspended}</p>
                </div>
                <Ban className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filters for SUPER_ADMIN */}
        <Card className="bg-dark-secondary border-dark-accent mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Email, isim veya soyisimle ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-dark-primary border-gray-600 text-white"
                />
              </div>
              
              {hasAdminAccess && (
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-dark-primary border border-gray-600 text-white rounded-md text-sm"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="suspended">Askıya Alınmış</option>
                  </select>
                  
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-dark-primary border border-gray-600 text-white rounded-md text-sm"
                  >
                    <option value="all">Tüm Roller</option>
                    <option value="user">Kullanıcı</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-600 text-gray-300"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setRoleFilter("all");
                    }}
                  >
                    Temizle
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Dropdown Selector */}
        <Card className="bg-dark-secondary border-dark-accent">
          <CardHeader>
            <CardTitle className="text-white">Kullanıcı Seçimi ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* User Dropdown */}
              <div className="w-full">
                <select
                  value={selectedUser?.id || ""}
                  onChange={(e) => {
                    const user = filteredUsers.find((u: any) => u.id === e.target.value);
                    setSelectedUser(user || null);
                  }}
                  className="w-full px-3 py-2 bg-dark-primary border border-gray-600 text-white rounded-md"
                >
                  <option value="">Kullanıcı Seçin...</option>
                  {(filteredUsers as any[]).map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName} (${user.email})` 
                        : user.email
                      } - {user.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected User Info */}
              {selectedUser && (
                <Card className="bg-dark-accent border-gray-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                        {selectedUser.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">
                          {selectedUser.firstName && selectedUser.lastName 
                            ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                            : selectedUser.email
                          }
                        </h3>
                        <p className="text-gray-400">{selectedUser.email}</p>
                        <p className="text-gray-500 text-sm">ID: {selectedUser.id.slice(0, 12)}...</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={
                            selectedUser.status === 'SUSPENDED'
                              ? "text-red-400 border-red-400" 
                              : "text-green-400 border-green-400"
                          }
                        >
                          {selectedUser.status === 'SUSPENDED' ? "Askıya Alınmış" : "Aktif"}
                        </Badge>
                        <br />
                        <Badge 
                          variant="outline" 
                          className={
                            selectedUser.role === 'SUPER_ADMIN' 
                              ? "text-pink-400 border-pink-400 bg-pink-400/10 mt-2" :
                            selectedUser.role === 'ADMIN'
                              ? "text-purple-400 border-purple-400 mt-2" 
                              : "text-gray-400 border-gray-400 mt-2"
                          }
                        >
                          {selectedUser.role === 'SUPER_ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                          {selectedUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 
                           selectedUser.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                        </Badge>
                      </div>
                    </div>

                    {/* User Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-400">Kayıt Tarihi</p>
                        <p className="text-white">{new Date(selectedUser.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Son Güncelleme</p>
                        <p className="text-white">{new Date(selectedUser.updatedAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {hasAdminAccess && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-600">
                        {/* Engelle/Aktif Et */}
                        <Button
                          size="sm"
                          variant={selectedUser.status === 'SUSPENDED' ? "outline" : "destructive"}
                          className={
                            selectedUser.status === 'SUSPENDED'
                              ? "border-green-600 text-green-400 hover:bg-green-600/10"
                              : "bg-red-600 hover:bg-red-700"
                          }
                          onClick={async () => {
                            try {
                              await updateStatusMutation.mutateAsync({
                                userId: selectedUser.id,
                                status: selectedUser.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
                              });
                              toast({
                                title: "Başarılı",
                                description: selectedUser.status === 'SUSPENDED' 
                                  ? "Kullanıcı aktif edildi" 
                                  : "Kullanıcı engellendi",
                              });
                            } catch (error) {
                              toast({
                                title: "Hata",
                                description: "İşlem başarısız oldu",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? (
                            <>
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              İşleniyor...
                            </>
                          ) : selectedUser.status === 'SUSPENDED' ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Aktif Et
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              Engelle
                            </>
                          )}
                        </Button>

                        {/* Askıya Al - Separate action */}
                        {selectedUser.status !== 'SUSPENDED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                            onClick={async () => {
                              const confirmed = confirm("Bu kullanıcıyı askıya almak istediğinizden emin misiniz?");
                              if (confirmed) {
                                try {
                                  await updateStatusMutation.mutateAsync({
                                    userId: selectedUser.id,
                                    status: 'SUSPENDED'
                                  });
                                  toast({
                                    title: "Başarılı",
                                    description: "Kullanıcı askıya alındı",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Hata",
                                    description: "Askıya alma işlemi başarısız oldu",
                                    variant: "destructive"
                                  });
                                }
                              }
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            {updateStatusMutation.isPending ? (
                              <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                                İşleniyor...
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Askıya Al
                              </>
                            )}
                          </Button>
                        )}

                        {/* Role Toggle */}
                        {isSuperAdmin && selectedUser.role !== 'SUPER_ADMIN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
                            onClick={() => updateRoleMutation.mutate({
                              userId: selectedUser.id,
                              role: selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN'
                            })}
                            disabled={updateRoleMutation.isPending}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            {selectedUser.role === 'ADMIN' ? 'Admin Kaldır' : 'Admin Yap'}
                          </Button>
                        )}

                        {/* Oturumları Sonlandır */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-600 text-orange-400 hover:bg-orange-600/10"
                          onClick={async () => {
                            const confirmed = confirm("Bu kullanıcının tüm oturumlarını sonlandırmak istediğinizden emin misiniz?");
                            if (confirmed) {
                              try {
                                await terminateSessionsMutation.mutateAsync(selectedUser.id);
                                toast({
                                  title: "Başarılı",
                                  description: "Kullanıcının tüm oturumları sonlandırıldı",
                                });
                              } catch (error) {
                                toast({
                                  title: "Hata",
                                  description: "Oturum sonlandırma işlemi başarısız oldu",
                                  variant: "destructive"
                                });
                              }
                            }
                          }}
                          disabled={terminateSessionsMutation.isPending}
                        >
                          {terminateSessionsMutation.isPending ? (
                            <>
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
                              Sonlandırılıyor...
                            </>
                          ) : (
                            <>
                              <LogOut className="h-4 w-4 mr-2" />
                              Oturumları Sonlandır
                            </>
                          )}
                        </Button>

                        {/* View Profile */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                          onClick={() => setShowUserProfile(true)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Profil Detayları
                        </Button>

                        {/* Activity History */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
                          onClick={() => setShowAuditLog(true)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Aktivite Geçmişi
                        </Button>

                        {/* Add Admin Note */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                          onClick={async () => {
                            const note = prompt("Admin notu ekleyin:");
                            if (note && note.trim()) {
                              try {
                                await apiRequest(`/api/admin/users/${selectedUser.id}/notes`, "POST", { note: note.trim(), category: "general" });
                                toast({
                                  title: "Başarılı",
                                  description: "Admin notu başarıyla kaydedildi.",
                                });
                              } catch (error) {
                                toast({
                                  title: "Hata",
                                  description: "Admin notu kaydedilemedi.",
                                  variant: "destructive"
                                });
                              }
                            }
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Admin Notu Ekle
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Profile Dialog - Compact */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="bg-dark-secondary border-gray-600 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Kullanıcı Profili
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              {/* Compact User Header */}
              <div className="flex items-center gap-3 p-3 bg-dark-accent rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {selectedUser.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {selectedUser.firstName} {selectedUser.lastName || selectedUser.email}
                  </h3>
                  <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      className={
                        selectedUser.role === 'SUPER_ADMIN' ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs" :
                        selectedUser.role === 'ADMIN' ? "bg-blue-600 text-white text-xs" : 
                        "bg-gray-600 text-white text-xs"
                      }
                    >
                      {selectedUser.role === 'SUPER_ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                      {selectedUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 
                       selectedUser.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                    </Badge>
                    <Badge className={selectedUser.status === 'SUSPENDED' ? "bg-red-600 text-xs" : "bg-green-600 text-xs"}>
                      {selectedUser.status === 'SUSPENDED' ? 'Engellenmiş' : 'Aktif'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Compact Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-dark-accent p-3 rounded">
                  <p className="text-gray-400 text-xs mb-1">Kayıt Tarihi</p>
                  <p className="text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="bg-dark-accent p-3 rounded">
                  <p className="text-gray-400 text-xs mb-1">Son Güncelleme</p>
                  <p className="text-white">
                    {selectedUser.updatedAt 
                      ? new Date(selectedUser.updatedAt).toLocaleDateString('tr-TR')
                      : 'Bilinmiyor'
                    }
                  </p>
                </div>
              </div>

              {/* Compact Activity */}
              <div className="bg-dark-accent p-3 rounded">
                <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Aktivite Özeti
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-lg font-bold text-purple-400">0</p>
                    <p className="text-gray-400">Oturum</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-400">0</p>
                    <p className="text-gray-400">İşlem</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-400">0</p>
                    <p className="text-gray-400">Giriş</p>
                  </div>
                </div>
              </div>

              {/* Compact Admin Actions */}
              {hasAdminAccess && (
                <div className="space-y-3 pt-3 border-t border-gray-600">
                  {/* Primary Actions Row */}
                  <div className="flex justify-center gap-2">
                    <Button
                      variant={selectedUser.status === 'SUSPENDED' ? "outline" : "destructive"}
                      size="sm"
                      className={
                        selectedUser.status === 'SUSPENDED'
                          ? "border-green-600 text-green-400 hover:bg-green-600/10 text-xs px-2"
                          : "bg-red-600 hover:bg-red-700 text-xs px-2"
                      }
                      onClick={async () => {
                        const action = selectedUser.status === 'SUSPENDED' ? 'aktif et' : 'engelle';
                        const confirmed = confirm(`Bu kullanıcıyı ${action}mek istediğinizden emin misiniz?`);
                        if (confirmed) {
                          try {
                            await updateStatusMutation.mutateAsync({
                              userId: selectedUser.id,
                              status: selectedUser.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
                            });
                            toast({
                              title: "Başarılı",
                              description: selectedUser.status === 'SUSPENDED' 
                                ? "Kullanıcı aktif edildi" 
                                : "Kullanıcı engellendi",
                            });
                            setShowUserProfile(false);
                          } catch (error) {
                            toast({
                              title: "Hata",
                              description: "İşlem başarısız oldu",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? (
                        <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : selectedUser.status === 'SUSPENDED' ? (
                        <UserCheck className="h-3 w-3 mr-1" />
                      ) : (
                        <Ban className="h-3 w-3 mr-1" />
                      )}
                      {selectedUser.status === 'SUSPENDED' ? 'Aktif Et' : 'Engelle'}
                    </Button>

                    {/* Askıya Al - Only show if user is active */}
                    {selectedUser.status !== 'SUSPENDED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10 text-xs px-2"
                        onClick={async () => {
                          const confirmed = confirm("Bu kullanıcıyı askıya almak istediğinizden emin misiniz?");
                          if (confirmed) {
                            try {
                              await updateStatusMutation.mutateAsync({
                                userId: selectedUser.id,
                                status: 'SUSPENDED'
                              });
                              toast({
                                title: "Başarılı",
                                description: "Kullanıcı askıya alındı",
                              });
                              setShowUserProfile(false);
                            } catch (error) {
                              toast({
                                title: "Hata",
                                description: "Askıya alma işlemi başarısız oldu",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? (
                          <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        Askıya Al
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-600 text-orange-400 hover:bg-orange-600/10 text-xs px-2"
                      onClick={async () => {
                        const confirmed = confirm("Bu kullanıcının tüm oturumlarını sonlandırmak istediğinizden emin misiniz?");
                        if (confirmed) {
                          try {
                            await terminateSessionsMutation.mutateAsync(selectedUser.id);
                            toast({
                              title: "Başarılı",
                              description: "Kullanıcının tüm oturumları sonlandırıldı",
                            });
                            setShowUserProfile(false);
                          } catch (error) {
                            toast({
                              title: "Hata",
                              description: "Oturum sonlandırma işlemi başarısız oldu",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                      disabled={terminateSessionsMutation.isPending}
                    >
                      {terminateSessionsMutation.isPending ? (
                        <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
                      ) : (
                        <LogOut className="h-3 w-3 mr-1" />
                      )}
                      Oturumları Sonlandır
                    </Button>
                  </div>

                  {/* Secondary Actions Row */}
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline" 
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-600 text-xs px-2"
                      onClick={() => {
                        setShowUserProfile(false);
                        setShowAuditLog(true);
                      }}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Geçmiş
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10 text-xs px-2"
                      onClick={async () => {
                        const note = prompt("Admin notu ekleyin:");
                        if (note && note.trim()) {
                          try {
                            await apiRequest(`/api/admin/users/${selectedUser.id}/notes`, "POST", { note: note.trim(), category: "general" });
                            setShowUserProfile(false);
                            toast({
                              title: "Başarılı",
                              description: "Admin notu başarıyla kaydedildi.",
                            });
                          } catch (error) {
                            toast({
                              title: "Hata",
                              description: "Admin notu kaydedilemedi.",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Not Ekle
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
        <DialogContent className="bg-dark-secondary border-gray-600 max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aktivite Geçmişi - {selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              {/* User Info Header */}
              <div className="flex items-center gap-3 p-3 bg-dark-accent rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {selectedUser.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {selectedUser.firstName} {selectedUser.lastName || selectedUser.email}
                  </h3>
                  <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                </div>
              </div>

              {/* Activity Log */}
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {/* Sample audit entries - in real app would come from API */}
                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-dark-accent/50 rounded-r">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Oturum Açma</p>
                        <p className="text-gray-400 text-sm">Kullanıcı sisteme giriş yaptı</p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date().toLocaleDateString('tr-TR')} 11:40
                      </span>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2 bg-dark-accent/50 rounded-r">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Profil Güncelleme</p>
                        <p className="text-gray-400 text-sm">Kullanıcı bilgileri güncellendi</p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(Date.now() - 3600000).toLocaleDateString('tr-TR')} 10:15
                      </span>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 py-2 bg-dark-accent/50 rounded-r">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Veri İşlemi</p>
                        <p className="text-gray-400 text-sm">Yeni kayıt oluşturuldu</p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(Date.now() - 7200000).toLocaleDateString('tr-TR')} 09:30
                      </span>
                    </div>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-dark-accent/50 rounded-r">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Ayar Değişikliği</p>
                        <p className="text-gray-400 text-sm">Kullanıcı tercihlerini değiştirdi</p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(Date.now() - 86400000).toLocaleDateString('tr-TR')} 14:20
                      </span>
                    </div>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2 bg-dark-accent/50 rounded-r">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Başarısız Giriş</p>
                        <p className="text-gray-400 text-sm">Yanlış şifre ile giriş denemesi</p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(Date.now() - 172800000).toLocaleDateString('tr-TR')} 08:45
                      </span>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2 bg-dark-accent/50 rounded-r">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Hesap Oluşturma</p>
                        <p className="text-gray-400 text-sm">Kullanıcı hesabı sisteme eklendi</p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR')} 16:00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-4 gap-3 p-3 bg-dark-accent rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-400">24</p>
                  <p className="text-gray-400 text-xs">Toplam Giriş</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-400">18</p>
                  <p className="text-gray-400 text-xs">Başarılı İşlem</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-400">3</p>
                  <p className="text-gray-400 text-xs">Ayar Değişikliği</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-400">1</p>
                  <p className="text-gray-400 text-xs">Başarısız Deneme</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-600">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  onClick={() => {
                    console.log(`Exporting audit log for user: ${selectedUser.id}`);
                    toast({
                      title: "Başarılı",
                      description: "Aktivite geçmişi dışa aktarıldı.",
                    });
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Dışa Aktar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                  onClick={() => setShowAuditLog(false)}
                >
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}