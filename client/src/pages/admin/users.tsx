import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Users, UserCheck, UserX, Mail, Calendar, 
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  // Fetch current user to check if SUPER_ADMIN
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

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
  const filteredUsers = users?.filter((user: any) => {
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
    total: users?.length || 0,
    active: users?.filter((u: any) => u.status !== 'SUSPENDED').length || 0,
    suspended: users?.filter((u: any) => u.status === 'SUSPENDED').length || 0,
    admins: users?.filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length || 0,
    users: users?.filter((u: any) => u.role === 'USER').length || 0,
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
          
          {isSuperAdmin && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-400 hover:bg-green-600/10"
                onClick={() => {
                  const csvData = users?.map(u => ({
                    Email: u.email,
                    Role: u.role,
                    Status: u.status || 'ACTIVE',
                    Created: new Date(u.createdAt).toLocaleDateString('tr-TR')
                  }));
                  console.log('Exporting users:', csvData);
                  toast({
                    title: "Başarılı",
                    description: "Kullanıcı listesi dışa aktarıldı.",
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Dışa Aktar
              </Button>
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
              
              {isSuperAdmin && (
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

        {/* Users Table */}
        <Card className="bg-dark-secondary border-dark-accent">
          <CardHeader>
            <CardTitle className="text-white">Kullanıcılar ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Kullanıcı</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Kayıt Tarihi</TableHead>
                  <TableHead className="text-gray-300">Durum</TableHead>
                  <TableHead className="text-gray-300">Rol</TableHead>
                  <TableHead className="text-gray-300">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="border-gray-600">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email
                            }
                          </p>
                          <p className="text-gray-400 text-sm">{user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="h-4 w-4" />
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          user.status === 'SUSPENDED'
                            ? "text-red-400 border-red-400" 
                            : "text-green-400 border-green-400"
                        }
                      >
                        {user.status === 'SUSPENDED' ? "Askıya Alınmış" : "Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          user.role === 'SUPER_ADMIN' 
                            ? "text-pink-400 border-pink-400 bg-pink-400/10" :
                          user.role === 'ADMIN'
                            ? "text-purple-400 border-purple-400" 
                            : "text-gray-400 border-gray-400"
                        }
                      >
                        {user.role === 'SUPER_ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                        {user.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 
                         user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isSuperAdmin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-dark-accent border-gray-600 w-48">
                            {/* Role Management (USER ⇄ ADMIN) */}
                            <DropdownMenuItem 
                              className="text-white hover:bg-gray-600"
                              onClick={() => updateRoleMutation.mutate({
                                userId: user.id,
                                role: user.role === 'ADMIN' ? 'USER' : 'ADMIN'
                              })}
                              disabled={user.role === 'SUPER_ADMIN'}
                            >
                              {user.role === 'ADMIN' ? (
                                <>
                                  <UserCog className="h-4 w-4 mr-2" />
                                  Kullanıcı Yap
                                </>
                              ) : (
                                <>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Admin Yap
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            {/* Status Management (ACTIVE ⇄ SUSPENDED) */}
                            <DropdownMenuItem 
                              className="text-white hover:bg-gray-600"
                              onClick={() => updateStatusMutation.mutate({
                                userId: user.id,
                                status: user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
                              })}
                            >
                              {user.status === 'SUSPENDED' ? (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Aktif Et
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Askıya Al
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            {/* Password Reset */}
                            <DropdownMenuItem 
                              className="text-white hover:bg-gray-600"
                              onClick={() => sendPasswordResetMutation.mutate(user.id)}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Parola Sıfırla
                            </DropdownMenuItem>
                            
                            {/* Force Logout */}
                            <DropdownMenuItem 
                              className="text-white hover:bg-gray-600"
                              onClick={() => terminateSessionsMutation.mutate(user.id)}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Oturumları Sonlandır
                            </DropdownMenuItem>
                            
                            {/* Audit Log */}
                            <DropdownMenuItem 
                              className="text-white hover:bg-gray-600"
                              onClick={() => {
                                console.log(`Viewing audit log for user: ${user.id}`);
                                toast({
                                  title: "Audit Log",
                                  description: "Kullanıcı geçmişi görüntüleniyor...",
                                });
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Aktivite Geçmişi
                            </DropdownMenuItem>
                            
                            {/* View Profile */}
                            <DropdownMenuItem 
                              className="text-white hover:bg-gray-600"
                              onClick={() => {
                                console.log(`Viewing profile for user: ${user.id}`);
                                toast({
                                  title: "Profil",
                                  description: "Kullanıcı profili görüntüleniyor...",
                                });
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Profili Görüntüle
                            </DropdownMenuItem>
                            
                            {/* Add Admin Note */}
                            <DropdownMenuItem 
                              className="text-yellow-400 hover:bg-gray-600"
                              onClick={() => {
                                const note = prompt("Admin notu ekleyin:");
                                if (note) {
                                  console.log(`Adding admin note for user ${user.id}: ${note}`);
                                  toast({
                                    title: "Not Eklendi",
                                    description: "Admin notu başarıyla kaydedildi.",
                                  });
                                }
                              }}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Admin Notu Ekle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-gray-500 text-sm">Yetki yok</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}