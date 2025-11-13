import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { queryClient } from "@/lib/queryClient";

export default function AdminLogs() {
  const [, setLocation] = useLocation();
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs, isLoading } = useQuery({ queryKey: ["/api/admin/logs"] });
  const logsArr = (logs as any[]) || [];

  const filteredLogs = logsArr.filter((log: any) => {
    const matchesFilter = filterAction === "all" || log.action === filterAction;
    const matchesSearch =
      (log.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLogTypeColor = (action: string) => {
    switch (action) {
      case "login":
      case "logout":
        return "text-blue-400 border-blue-400";
      case "create":
      case "update":
        return "text-green-400 border-green-400";
      case "delete":
        return "text-red-400 border-red-400";
      case "view":
        return "text-gray-400 border-gray-400";
      default:
        return "text-yellow-400 border-yellow-400";
    }
  };

  const getLogTypeIcon = (action: string) => {
    switch (action) {
      case "login":
      case "logout":
        return <User className="h-4 w-4" />;
      case "create":
      case "update":
        return <CheckCircle className="h-4 w-4" />;
      case "delete":
        return <AlertTriangle className="h-4 w-4" />;
      case "view":
        return <Info className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] });

  const handleExport = () => {
    const csvContent = [
      ["Tarih", "Kullanıcı", "İşlem", "Detaylar"],
      ...filteredLogs.map((log: any) => [
        new Date(log.createdAt).toLocaleString("tr-TR"),
        log.userId,
        log.action,
        log.details || "",
      ]),
    ]
      .map((row) => row.map((field: any) => '"' + field + '"').join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", 'admin_logs_' + new Date().toISOString().split("T")[0] + '.csv');
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Admin logları yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: logsArr.length || 0,
    today:
      logsArr.filter((log: any) => {
        const today = new Date();
        const logDate = new Date(log.createdAt);
        return logDate.toDateString() === today.toDateString();
      }).length || 0,
    errors: logsArr.filter((log: any) => log.action === "error").length || 0,
    users: new Set(logsArr.map((log: any) => log.userId)).size || 0,
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      <Header />
      <div className="container mx-auto px-4 py-8">
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
              <FileText className="h-8 w-8 text-indigo-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Logları</h1>
                <p className="text-gray-400">Sistem aktivitelerini izle</p>
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
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Log</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Bugün</p>
                  <p className="text-2xl font-bold text-white">{stats.today}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Hatalar</p>
                  <p className="text-2xl font-bold text-white">{stats.errors}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Aktif Kullanıcılar</p>
                  <p className="text-2xl font-bold text-white">{stats.users}</p>
                </div>
                <User className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-dark-secondary border-dark-accent mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Log ara (işlem, kullanıcı, detay)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-dark-primary border-gray-600 text-white"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-48 bg-dark-primary border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-accent border-gray-600">
                  <SelectItem value="all">Tüm İşlemler</SelectItem>
                  <SelectItem value="login">Giriş</SelectItem>
                  <SelectItem value="logout">Çıkış</SelectItem>
                  <SelectItem value="create">Oluşturma</SelectItem>
                  <SelectItem value="update">Güncelleme</SelectItem>
                  <SelectItem value="delete">Silme</SelectItem>
                  <SelectItem value="view">Görüntüleme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-dark-secondary border-dark-accent">
          <CardHeader>
            <CardTitle className="text-white">Sistem Logları ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Tarih</TableHead>
                  <TableHead className="text-gray-300">Kullanıcı</TableHead>
                  <TableHead className="text-gray-300">İşlem</TableHead>
                  <TableHead className="text-gray-300">Detay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any) => (
                  <TableRow key={log.id} className="border-gray-600">
                    <TableCell>{new Date(log.createdAt).toLocaleString("tr-TR")}</TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell>
                      <Badge className={getLogTypeColor(log.action)}>
                        {getLogTypeIcon(log.action)}
                        <span className="ml-2">{log.action}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Gösterilecek log kaydı bulunamadı.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
