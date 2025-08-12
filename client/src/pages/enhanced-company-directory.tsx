import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { insertCompanyDirectorySchema, type CompanyDirectory, type InsertCompanyDirectory, type Notification } from "@shared/schema";
import { 
  Building2, Phone, Mail, Globe, MapPin, MessageCircle, Plus, Search, Users, Send, X, 
  Star, Shield, Filter, Bell, Block, VolumeX, Flag, CheckCircle, Crown, Verified, Home 
} from "lucide-react";

export default function EnhancedCompanyDirectory() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>(undefined);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDirectory | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState("directory");
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced PRO Company Directory query with filters
  const { data: companies = [], isLoading } = useQuery<CompanyDirectory[]>({
    queryKey: ["/api/directory/firms", { searchTerm, cityFilter, industryFilter, verifiedFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (cityFilter) params.append("city", cityFilter);
      if (industryFilter) params.append("industry", industryFilter);
      if (verifiedFilter !== undefined) params.append("verified", verifiedFilter.toString());
      
      const response = await apiRequest(`/api/directory/firms?${params.toString()}`, "GET");
      return Array.isArray(response) ? response : [];
    },
  });

  // Notifications query
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Conversations query
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/threads"],
    enabled: activeTab === "messages",
    refetchInterval: 3000, // Poll every 3 seconds when on messages tab
  });

  // Messages for active conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/threads", activeConversation],
    queryFn: async () => {
      if (!activeConversation) return [];
      const response = await apiRequest(`/api/threads/${activeConversation}`, "GET");
      return Array.isArray(response) ? response : [];
    },
    enabled: !!activeConversation,
    refetchInterval: 2000, // Poll every 2 seconds for active conversation
  });

  const form = useForm<InsertCompanyDirectory>({
    resolver: zodResolver(insertCompanyDirectorySchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      industry: "",
      website: "",
      description: "",
      bio: "",
      logoUrl: "",
      isActive: true,
      isProVisible: false,
      subscriptionStatus: "FREE"
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: (data: InsertCompanyDirectory) => apiRequest("/api/company-directory", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory/firms"] });
      toast({ title: "Başarılı", description: "Firma başarıyla eklendi" });
      setShowForm(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Hata", description: "Firma eklenirken hata oluştu", variant: "destructive" });
    },
  });

  const startConversationMutation = useMutation({
    mutationFn: (targetCompanyId: string) => 
      apiRequest("/api/threads/open", "POST", { targetCompanyId }),
    onSuccess: (conversation) => {
      setActiveConversation(conversation.id);
      setActiveTab("messages");
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Hata", 
        description: error.message || "Mesajlaşma başlatılamadı", 
        variant: "destructive" 
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      apiRequest(`/api/threads/${conversationId}/messages`, "POST", { body }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/threads", activeConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
    },
    onError: () => {
      toast({ title: "Hata", description: "Mesaj gönderilemedi", variant: "destructive" });
    },
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest(`/api/notifications/${notificationId}/read`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: () => {
      console.error("Failed to mark notification as read");
    },
  });

  const onSubmit = (data: InsertCompanyDirectory) => {
    createCompanyMutation.mutate(data);
  };

  const startConversation = (company: CompanyDirectory) => {
    startConversationMutation.mutate(company.id);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    sendMessageMutation.mutate({
      conversationId: activeConversation,
      body: newMessage.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCompanyDisplayInfo = (company: CompanyDirectory) => {
    const badges = [];
    
    if (company.isVerified) {
      badges.push(
        <Badge key="verified" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Verified className="h-3 w-3 mr-1" />
          Doğrulanmış
        </Badge>
      );
    }
    
    if (company.subscriptionStatus === "PRO") {
      badges.push(
        <Badge key="pro" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Crown className="h-3 w-3 mr-1" />
          PRO
        </Badge>
      );
    }
    
    if (company.isActive) {
      badges.push(
        <Badge key="active" className="bg-green-500/20 text-green-400 border-green-500/30">
          Aktif
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-white hover:bg-dark-accent"
            title="Anasayfa'ya dön"
          >
            <Home className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              PRO Firma Rehberi
            </h1>
            <p className="text-gray-400 mt-2">Doğrulanmış firmalarla profesyonel iletişim kurun</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {notifications.filter(n => !n.isRead).length > 0 && (
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-500 text-blue-400 hover:bg-blue-600/10"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4 mr-2" />
                {notifications.filter(n => !n.isRead).length} Bildirim
              </Button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-dark-secondary border border-dark-accent rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-dark-accent">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Bildirimler</h3>
                      <div className="flex items-center gap-2">
                        {notifications.filter(n => !n.isRead).length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Mark all notifications as read
                              notifications.filter(n => !n.isRead).forEach(n => {
                                markNotificationAsReadMutation.mutate(n.id);
                              });
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Tümünü okundu işaretle
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNotifications(false)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        Henüz bildirim yok
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-dark-accent/50 hover:bg-dark-primary/50 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-600/10' : ''
                          }`}
                          onClick={() => {
                            // Mark notification as read
                            if (!notification.isRead) {
                              markNotificationAsReadMutation.mutate(notification.id);
                            }
                            
                            if (notification.type === 'NEW_DM' && notification.payload) {
                              // Mesaj konuşmasına git
                              const payload = notification.payload as any;
                              setActiveTab("messages");
                              setShowNotifications(false);
                              toast({
                                title: "Mesaja Yönlendiriliyor",
                                description: `${payload.fromCompanyName} firmasından gelen mesaj`,
                              });
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {notification.type === 'NEW_DM' ? (
                                <MessageCircle className="h-5 w-5 text-blue-400" />
                              ) : (
                                <Bell className="h-5 w-5 text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {notification.type === 'NEW_DM' && notification.payload && (
                                <>
                                  <div className="text-white font-medium">
                                    {(notification.payload as any).fromCompanyName}
                                  </div>
                                  <div className="text-gray-300 text-sm mt-1 truncate">
                                    {(notification.payload as any).message}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.createdAt).toLocaleString('tr-TR')}
                                  </div>
                                </>
                              )}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Firma Ekle
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-dark-secondary">
          <TabsTrigger value="directory" className="data-[state=active]:bg-blue-600">
            <Building2 className="h-4 w-4 mr-2" />
            Firma Rehberi
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-blue-600">
            <MessageCircle className="h-4 w-4 mr-2" />
            Mesajlarım ({conversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6 mt-6">
          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Firma, kişi, açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-primary border-dark-accent text-white"
              />
            </div>
            <Select value={cityFilter || "all"} onValueChange={(value) => setCityFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                <SelectValue placeholder="Şehir seçin" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-dark-accent">
                <SelectItem value="all">Tüm Şehirler</SelectItem>
                <SelectItem value="İstanbul">İstanbul</SelectItem>
                <SelectItem value="Ankara">Ankara</SelectItem>
                <SelectItem value="İzmir">İzmir</SelectItem>
                <SelectItem value="Bursa">Bursa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={industryFilter || "all"} onValueChange={(value) => setIndustryFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                <SelectValue placeholder="Sektör seçin" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-dark-accent">
                <SelectItem value="all">Tüm Sektörler</SelectItem>
                <SelectItem value="İnşaat">İnşaat</SelectItem>
                <SelectItem value="Teknoloji">Teknoloji</SelectItem>
                <SelectItem value="Hizmet">Hizmet</SelectItem>
                <SelectItem value="Üretim">Üretim</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter?.toString() || "all"} onValueChange={(value) => 
              setVerifiedFilter(value === "all" ? undefined : value === "true")
            }>
              <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                <SelectValue placeholder="Doğrulama" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-dark-accent">
                <SelectItem value="all">Tüm Firmalar</SelectItem>
                <SelectItem value="true">Doğrulanmış</SelectItem>
                <SelectItem value="false">Doğrulanmamış</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Companies Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-dark-secondary rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company: CompanyDirectory) => (
                <Card key={company.id} className="bg-dark-secondary border-dark-accent hover:border-blue-500/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white">{company.companyName}</h3>
                        <p className="text-blue-400 font-medium">{company.contactPerson}</p>
                      </div>
                      {company.logoUrl && (
                        <img 
                          src={company.logoUrl} 
                          alt={`${company.companyName} logo`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {getCompanyDisplayInfo(company)}
                    </div>
                    {company.industry && (
                      <Badge variant="outline" className="w-fit text-gray-300 border-gray-600 mt-2">
                        {company.industry}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {company.phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">{company.phone}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">{company.email}</span>
                      </div>
                    )}
                    {company.city && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">{company.city}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm hover:text-blue-400 transition-colors"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                    {(company.description || company.bio) && (
                      <p className="text-sm text-gray-400 mt-3 line-clamp-3">
                        {company.bio || company.description}
                      </p>
                    )}
                    <div className="pt-3 flex gap-2">
                      <Button
                        onClick={() => startConversation(company)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                        disabled={startConversationMutation.isPending}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {startConversationMutation.isPending ? "Başlatılıyor..." : "Mesaj Gönder"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {companies.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {searchTerm || cityFilter || industryFilter ? "Arama sonucu bulunamadı" : "Henüz PRO firma eklenmemiş"}
              </h3>
              <p className="text-gray-500">
                {searchTerm || cityFilter || industryFilter ? "Farklı filtreler deneyin" : "İlk PRO firmayı ekleyerek başlayın"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">


            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="bg-dark-secondary border-dark-accent h-full">
                {activeConversation ? (
                  <>
                    <CardHeader className="pb-3 border-b border-dark-accent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          {conversations.find((c: any) => c.id === activeConversation)?.otherCompany?.companyName}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setActiveConversation(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col h-[460px]">
                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {messages.map((message: any) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.fromUserId === "current-user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  message.fromUserId === "current-user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-dark-primary text-gray-200"
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatMessageTime(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 border-t border-dark-accent">
                        <div className="flex gap-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Mesajınızı yazın..."
                            className="bg-dark-primary border-dark-accent text-white"
                            disabled={sendMessageMutation.isPending}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sendMessageMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4" />
                      <p>Konuşma başlatmak için bir firma seçin</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Company Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Yeni PRO Firma Ekle</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Firma Adı *</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="Firma adını giriniz"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Yetkili Kişi *</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="Yetkili kişi adı"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Telefon</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="Telefon numarası"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">E-posta</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="E-posta adresi"
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Şehir</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="Şehir"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Sektör</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="Sektör"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Adres</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Firma adresi"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Website</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="www.firma.com"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Logo URL</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="Logo resim URL'si"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Kısa Açıklama</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Firma hakkında kısa açıklama"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Detaylı Açıklama</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-dark-primary border-dark-accent text-white min-h-[100px]"
                        placeholder="Firma hakkında detaylı bilgi"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createCompanyMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createCompanyMutation.isPending ? "Ekleniyor..." : "Firma Ekle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}