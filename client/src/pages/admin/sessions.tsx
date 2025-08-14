import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Users, Clock, Monitor, Globe, 
  Search, RefreshCw, X, AlertTriangle
} from "lucide-react";
import Header from "@/components/layout/header";
import { queryClient } from "@/lib/queryClient";

interface SessionData {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: string;
  createdAt: string;
  isActive: boolean;
  location?: string;
}

export default function AdminSessions() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const { data: sessions, isLoading } = useQuery<SessionData[]>({
    queryKey: ["/api/admin/sessions"],
  });

  const filteredSessions = sessions?.filter((session) => {
    const matchesSearch = 
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ipAddress.includes(searchTerm) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "active" && session.isActive) ||
      (filterStatus === "inactive" && !session.isActive);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm("Bu oturumu sonlandırmak istediğinizden emin misiniz?")) return;
    
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
      }
    } catch (error) {
      console.error("Oturum sonlandırma hatası:", error);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      return "📱";
    } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
      return "📱";
    } else {
      return "💻";
    }
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Bilinmeyen";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Oturumlar yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: sessions?.length || 0,
    active: sessions?.filter(s => s.isActive).length || 0,
    inactive: sessions?.filter(s => !s.isActive).length || 0,
    uniqueUsers: new Set(sessions?.map(s => s.userId)).size || 0,
  };

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
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Oturumlar</h1>
                <p className="text-gray-400">Aktif kullanıcı oturumlarını yönet</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Oturum</p>
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
                  <p className="text-gray-400 text-sm">Aktif Oturumlar</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pasif Oturumlar</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.inactive}</p>
                </div>
                <Monitor className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Benzersiz Kullanıcı</p>
                  <p className="text-2xl font-bold text-white">{stats.uniqueUsers}</p>
                </div>
                <Globe className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Email, IP veya oturum ID ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-secondary border-dark-accent text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className={filterStatus === "all" ? "bg-purple-600 hover:bg-purple-700" : "border-gray-600 text-gray-300"}
            >
              Tümü
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
              className={filterStatus === "active" ? "bg-green-600 hover:bg-green-700" : "border-gray-600 text-gray-300"}
            >
              Aktif
            </Button>
            <Button
              variant={filterStatus === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("inactive")}
              className={filterStatus === "inactive" ? "bg-orange-600 hover:bg-orange-700" : "border-gray-600 text-gray-300"}
            >
              Pasif
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <Card className="bg-dark-secondary border-dark-accent">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Oturum Listesi ({filteredSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Oturum Bulunamadı</h3>
                <p className="text-gray-500">Arama kriterlerinize uygun oturum bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-accent">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="p-6 hover:bg-dark-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">
                          {getDeviceIcon(session.userAgent)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{session.userEmail}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.isActive 
                                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                : "bg-gray-600/20 text-gray-400 border border-gray-600/30"
                            }`}>
                              {session.isActive ? "Aktif" : "Pasif"}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-400">
                            <p>
                              <span className="font-medium">IP:</span> {session.ipAddress}
                              {session.location && <span className="ml-2">({session.location})</span>}
                            </p>
                            <p>
                              <span className="font-medium">Tarayıcı:</span> {getBrowserName(session.userAgent)}
                            </p>
                            <p>
                              <span className="font-medium">Son Aktivite:</span> {new Date(session.lastActivity).toLocaleString('tr-TR')}
                            </p>
                            <p>
                              <span className="font-medium">Başlangıç:</span> {new Date(session.createdAt).toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={() => handleTerminateSession(session.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Sonlandır
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}