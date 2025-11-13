import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ArrowLeft, Megaphone, Plus, Edit2, Trash2, Eye,
  Calendar, User, AlertCircle, Send, Save
} from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminAnnouncements() {
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "normal",
  });
  const { toast } = useToast();

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/admin/announcements"],
  });

  // Create announcement
  const createMutation = useMutation({
    mutationFn: async (announcement: any) => {
      return await apiRequest("/api/admin/announcements", "POST", announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      setIsCreateOpen(false);
      setNewAnnouncement({ title: "", content: "", priority: "normal" });
      toast({
        title: "Başarılı",
        description: "Duyuru oluşturuldu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Duyuru oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete announcement
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/announcements/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({
        title: "Başarılı",
        description: "Duyuru silindi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Duyuru silinirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Hata",
        description: "Başlık ve içerik gereklidir.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newAnnouncement);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 border-red-400";
      case "medium":
        return "text-yellow-400 border-yellow-400";
      default:
        return "text-blue-400 border-blue-400";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <Eye className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Megaphone className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Duyurular yükleniyor...</p>
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
              <Megaphone className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Duyurular</h1>
                <p className="text-gray-400">Sistem duyurularını yönet</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Duyuru
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-secondary border-dark-accent">
              <DialogHeader>
                <DialogTitle className="text-white">Yeni Duyuru Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Başlık</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    className="bg-dark-primary border-gray-600 text-white"
                    placeholder="Duyuru başlığı"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-gray-300">İçerik</Label>
                  <Textarea
                    id="content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({
                      ...prev,
                      content: e.target.value
                    }))}
                    className="bg-dark-primary border-gray-600 text-white min-h-32"
                    placeholder="Duyuru içeriği"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-gray-300">Öncelik</Label>
                  <Select
                    value={newAnnouncement.priority}
                    onValueChange={(value) => setNewAnnouncement(prev => ({
                      ...prev,
                      priority: value
                    }))}
                  >
                    <SelectTrigger className="bg-dark-primary border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-accent border-gray-600">
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setIsCreateOpen(false)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Duyuru</p>
                  <p className="text-2xl font-bold text-white">{((announcements as any[]) || []).length || 0}</p>
                </div>
                <Megaphone className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Yüksek Öncelik</p>
                  <p className="text-2xl font-bold text-white">
                    {((announcements as any[]) || []).filter((a: any) => a.priority === "high").length || 0}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Bu Hafta</p>
                  <p className="text-2xl font-bold text-white">
                    {((announcements as any[]) || []).filter((a: any) => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(a.createdAt) >= weekAgo;
                    }).length || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <Card className="bg-dark-secondary border-dark-accent">
          <CardHeader>
            <CardTitle className="text-white">Duyuru Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Başlık</TableHead>
                  <TableHead className="text-gray-300">Öncelik</TableHead>
                  <TableHead className="text-gray-300">Oluşturma Tarihi</TableHead>
                  <TableHead className="text-gray-300">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {((announcements as any[]) || []).map((announcement: any) => (
                  <TableRow key={announcement.id} className="border-gray-600">
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{announcement.title}</p>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {announcement.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(announcement.priority)}
                      >
                        {getPriorityIcon(announcement.priority)}
                        <span className="ml-1">
                          {announcement.priority === "high" 
                            ? "Yüksek" 
                            : announcement.priority === "medium" 
                              ? "Orta" 
                              : "Normal"}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="h-4 w-4" />
                        {new Date(announcement.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMutation.mutate(announcement.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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