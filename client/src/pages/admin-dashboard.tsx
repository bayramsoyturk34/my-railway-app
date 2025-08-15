import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  MoreHorizontal,
  Calendar,
  Mail,
  Shield,
  Activity,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all users and admin stats
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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

  // Filter users based on search
  const filteredUsers = (allUsers || []).filter((user: any) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = adminData || {
    totalUsers: 0,
    activeUsers: 0,
    demoUsers: 0,
    todayRegistrations: 0
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Yönetim Paneli
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kullanıcı yönetimi ve sistem istatistikleri
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Yönetici
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı kullanıcı sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Son 30 günde giriş yapmış
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demo Kullanıcı</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.demoUsers}</div>
            <p className="text-xs text-muted-foreground">
              Demo hesabı kullanan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Kayıt</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Bugün kayıt olan
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="users">Kullanıcı Listesi</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>
          
          {/* Delete All Users Button - Only for SUPER_ADMIN */}
          {user?.isAdmin && (
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Tüm Kullanıcıları Sil
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Tehlikeli İşlem
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Bu işlem süper admin hariç <strong>TÜM KULLANICILAR</strong>ı ve onlara ait 
                  <strong> TÜM VERİLERİ</strong> kalıcı olarak silecektir.
                  <br/><br/>
                  Bu işlem <strong>GERİ ALINAMAZ</strong>. Emin misiniz?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleteAllUsersMutation.isPending}
                >
                  İptal
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteAllUsersMutation.mutate()}
                  disabled={deleteAllUsersMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {deleteAllUsersMutation.isPending && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Evet, Tüm Kullanıcıları Sil
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Kullanıcı ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead>Son Giriş</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {user.firstName ? user.firstName[0]?.toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {user.firstName || user.lastName ? 
                                `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                                'İsimsiz Kullanıcı'
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.email.includes('demo') ? 'secondary' : 'default'}>
                          {user.email.includes('demo') ? 'Demo' : 'Kayıtlı'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(user.createdAt), { 
                          addSuffix: true, 
                          locale: tr 
                        })}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? 
                          formatDistanceToNow(new Date(user.lastLoginAt), { 
                            addSuffix: true, 
                            locale: tr 
                          }) : 
                          'Hiç giriş yapmamış'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              Profil Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Verileri İndir
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Kullanıcı Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UserX className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Kullanıcı bulunamadı
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Arama kriterlerinize uygun kullanıcı yok.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Analitiği</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Analitik Geliştiriliyor
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Kullanıcı davranış analitikleri yakında eklenecek.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}