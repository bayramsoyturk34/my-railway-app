import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Search, MessageCircle, Bell, Filter, Star, Building2, X, Send, ImageIcon, CheckCheck, Check, Circle, MoreVertical, Flag, BellOff, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CompanyDirectory, InsertCompanyDirectory, DirectMessage, Notification, FirmInvite, Conversation } from "@shared/schema";

export default function EnhancedCompanyDirectory() {
  const [activeTab, setActiveTab] = useState("directory");
  const [showDirectoryForm, setShowDirectoryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CompanyDirectory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [draftText, setDraftText] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Companies query
  const { data: companies = [] } = useQuery<CompanyDirectory[]>({
    queryKey: ["/api/company-directory"],
    queryFn: () => apiRequest("/api/company-directory", "GET"),
  });

  // Get current user's companies
  const { data: userCompanies } = useQuery({
    queryKey: ["/api/company-directory/my-companies"],
    queryFn: () => apiRequest("/api/company-directory/my-companies", "GET"),
  });
  
  const currentUserFirmId = userCompanies?.[0]?.id;

  // Notifications query
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 3000,
  });

  // URL parametrelerini kontrol et ve aktif thread'i ayarla
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activeThreadParam = urlParams.get('activeThread');
    
    if (activeThreadParam) {
      console.log("🔥 URL'den activeThread parametresi bulundu:", activeThreadParam);
      setActiveThread(activeThreadParam);
      setActiveTab("messaging");
      
      // URL'yi temizle (parametre kaldır)
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Debug notifications
  useEffect(() => {
    console.log("🔔 All notifications:", notifications);
    console.log("🔔 Notifications count:", notifications.length);
    console.log("🔔 First notification:", notifications[0]);
  }, [notifications]);

  // Messages query for active thread
  const { data: messages = [] } = useQuery<DirectMessage[]>({
    queryKey: [`/api/messages/${activeThread}`],
    refetchInterval: 3000,
    enabled: !!activeThread,
    staleTime: 0,
    gcTime: 0,
  });

  // Company mutations
  const createCompanyMutation = useMutation({
    mutationFn: (entry: InsertCompanyDirectory) =>
      apiRequest("/api/company-directory", "POST", entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-directory"] });
      setShowDirectoryForm(false);
      setEditingEntry(null);
      toast({ title: "Başarılı", description: "Firma bilgileri kaydedildi." });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, ...entry }: { id: string } & Partial<InsertCompanyDirectory>) =>
      apiRequest(`/api/company-directory/${id}`, "PATCH", entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-directory"] });
      setShowDirectoryForm(false);
      setEditingEntry(null);
      toast({ title: "Başarılı", description: "Firma bilgileri güncellendi." });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/company-directory/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-directory"] });
      toast({ title: "Başarılı", description: "Firma silindi." });
    },
  });

  // Message mutations
  const sendMessageMutation = useMutation({
    mutationFn: (message: { receiverFirmId: string; body: string }) =>
      apiRequest("/api/messages", "POST", message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${activeThread}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setMessageText("");
      setDraftText("");
    },
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest(`/api/notifications/${notificationId}/read`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Send message handler
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeThread) return;
    
    sendMessageMutation.mutate({
      receiverFirmId: activeThread,
      body: messageText.trim(),
    });
  };

  // Filter companies
  const filteredCompanies = (Array.isArray(companies) ? companies : []).filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.city || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "" || selectedSector === "all" || company.industry === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <a href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            PuantajPro
          </a>
          <h1 className="text-3xl font-bold">Firma Rehberi</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Bildirimler
            {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="directory">Firma Rehberi</TabsTrigger>
          <TabsTrigger value="messaging">Mesajlaşma</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Firma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sektör filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Sektörler</SelectItem>
                <SelectItem value="İnşaat">İnşaat</SelectItem>
                <SelectItem value="Teknoloji">Teknoloji</SelectItem>
                <SelectItem value="Gıda">Gıda</SelectItem>
                <SelectItem value="Tekstil">Tekstil</SelectItem>
                <SelectItem value="Otomotiv">Otomotiv</SelectItem>
                <SelectItem value="Diğer">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{company.companyName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{company.industry || "Sektör belirtilmemiş"}</p>
                    </div>
                    <Badge variant={company.subscriptionStatus === "PRO" ? "default" : "secondary"}>
                      {company.subscriptionStatus === "PRO" ? "PRO" : "Basic"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{company.contactPerson}</p>
                    {company.phone && <p className="text-sm text-muted-foreground">{company.phone}</p>}
                    {company.email && <p className="text-sm text-muted-foreground">{company.email}</p>}
                  </div>
                  <div>
                    {company.address && <p className="text-sm">{company.address}</p>}
                    {company.city && <p className="text-sm text-muted-foreground">{company.city}</p>}
                  </div>
                  {company.description && (
                    <p className="text-sm text-muted-foreground">{company.description}</p>
                  )}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveThread(company.id);
                        setActiveTab("messaging");
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Mesaj
                    </Button>
                    {userCompanies?.some((myComp: any) => myComp.id === company.id) && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEntry(company);
                            setShowDirectoryForm(true);
                          }}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCompanyMutation.mutate(company.id)}
                        >
                          Sil
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sohbetler</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <Button
                        key={company.id}
                        variant={activeThread === company.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveThread(company.id)}
                      >
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>
                            {company.companyName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-medium">{company.companyName}</p>
                          <p className="text-xs text-muted-foreground">{company.contactPerson}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              {activeThread ? (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>
                          {companies.find(c => c.id === activeThread)?.companyName}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                          <span>Çevrimiçi</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <ScrollArea className="h-[350px] mb-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Henüz mesaj yok. İlk mesajı gönderin!</p>
                          </div>
                        ) : (
                          messages.map((message) => {
                            const isOutgoing = (message as any).fromCompanyId === currentUserFirmId;
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                  isOutgoing 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted text-foreground'
                                }`}>
                                  <p>{(message as any).message || (message as any).content}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs opacity-70">
                                      {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) : ''}
                                    </span>
                                    {isOutgoing && (
                                      message.isRead ? (
                                        <CheckCheck className="h-3 w-3 opacity-70" />
                                      ) : (
                                        <Check className="h-3 w-3 opacity-70" />
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="border-t bg-muted/10 p-3">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            value={messageText}
                            onChange={(e) => {
                              setMessageText(e.target.value);
                              setDraftText(e.target.value);
                            }}
                            placeholder="Mesajınızı yazın ve Enter'a basın..."
                            className="pr-10"
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          {messageText && (
                            <Button
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                              onClick={handleSendMessage}
                              disabled={sendMessageMutation.isPending}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-[500px]">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Mesajlaşmaya başlamak için bir firma seçin</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="fixed top-20 right-6 w-80 max-h-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Bildirimler</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Henüz bildirim yok
                </p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded border cursor-pointer hover:bg-muted/30 transition-colors ${
                        notification.isRead ? 'bg-muted/50' : 'bg-primary/10 border-primary/20'
                      }`}
                      onClick={(e) => {
                        console.log("🔥 NOTIFICATION CLICKED!", notification);
                        console.log("🔥 Type:", notification.type);
                        console.log("🔥 Payload:", notification.payload);
                        
                        // Mesaj bildirimi ise mesajlaşma tabını aç
                        if (notification.type === "NEW_MESSAGE" || notification.type === "NEW_DM") {
                          const payload = notification.payload as any;
                          console.log("🔥 Found message notification");
                          console.log("🔥 FromCompanyId:", payload?.fromCompanyId);
                          if (payload?.fromCompanyId) {
                            console.log("🔥 Switching to messaging tab with thread:", payload.fromCompanyId);
                            setActiveThread(payload.fromCompanyId);
                            setActiveTab("messaging");
                            setShowNotifications(false);
                          } else {
                            console.log("🔥 No fromCompanyId found in payload");
                          }
                        } else {
                          console.log("🔥 Not a message notification, type is:", notification.type);
                        }
                        
                        // Bildirimi okundu olarak işaretle
                        markAsReadMutation.mutate(notification.id);
                        e.stopPropagation();
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {(notification.payload as any)?.title || (notification as any).title || 'Bildirim'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(notification.payload as any)?.message || (notification as any).content || 'Yeni bildirim'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.createdAt ? new Date(notification.createdAt).toLocaleString('tr-TR') : ''}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Company Form Dialog */}
      <Dialog open={showDirectoryForm} onOpenChange={setShowDirectoryForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Firma Düzenle" : "Yeni Firma Ekle"}
            </DialogTitle>
          </DialogHeader>
          <CompanyForm
            entry={editingEntry}
            onSubmit={(data) => {
              if (editingEntry) {
                updateCompanyMutation.mutate({ id: editingEntry.id, ...data });
              } else {
                createCompanyMutation.mutate(data);
              }
            }}
            onCancel={() => {
              setShowDirectoryForm(false);
              setEditingEntry(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompanyForm({
  entry,
  onSubmit,
  onCancel,
}: {
  entry?: CompanyDirectory | null;
  onSubmit: (data: InsertCompanyDirectory) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<InsertCompanyDirectory>({
    companyName: entry?.companyName || "",
    contactPerson: entry?.contactPerson || "",
    phone: entry?.phone || "",
    email: entry?.email || "",
    address: entry?.address || "",
    city: entry?.city || "",
    industry: entry?.industry || "",
    description: entry?.description || "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Firma Adı *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="contactPerson">İletişim Kişisi *</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">E-posta *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Adres</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Şehir</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="industry">Sektör</Label>
          <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sektör seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="İnşaat">İnşaat</SelectItem>
              <SelectItem value="Teknoloji">Teknoloji</SelectItem>
              <SelectItem value="Gıda">Gıda</SelectItem>
              <SelectItem value="Tekstil">Tekstil</SelectItem>
              <SelectItem value="Otomotiv">Otomotiv</SelectItem>
              <SelectItem value="Diğer">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit">
          {entry ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}