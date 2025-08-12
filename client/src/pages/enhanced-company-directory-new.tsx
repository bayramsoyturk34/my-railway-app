import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Search, 
  Plus, 
  MessageCircle, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Shield, 
  Crown,
  Send,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
  UserPlus,
  Settings,
  Bell,
  BellOff,
  Flag,
  Ban,
  Trash2,
  Image as ImageIcon,
  Paperclip,
  Eye,
  EyeOff,
  Zap,
  Copy,
  Link,
  Users,
  Edit,
  Circle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CompanyDirectory {
  id: string;
  companyName: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  industry?: string;
  website?: string;
  description?: string;
  bio?: string;
  logoUrl?: string;
  isActive: boolean;
  isProVisible: boolean;
  isVerified: boolean;
  subscriptionStatus: string;
  createdAt: Date;
}

interface DirectThread {
  id: string;
  firm1Id: string;
  firm2Id: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

interface DirectMessage {
  id: string;
  threadId: string;
  senderFirmId: string;
  receiverFirmId: string;
  body?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  messageType: string;
  isRead: boolean;
  createdAt: Date;
}

interface AutoResponder {
  id?: string;
  firmId: string;
  enabled: boolean;
  mode: "KEYWORD" | "ALWAYS" | "OFFHOURS";
  keywords?: string[];
  cooldownSec: number;
  messageBody: string;
}

interface FirmInvite {
  id: string;
  email: string;
  role: string;
  acceptedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

interface PresenceInfo {
  online: boolean;
  lastSeen?: string;
}

const companyFormSchema = z.object({
  companyName: z.string().min(1, "Firma adı gereklidir"),
  contactPerson: z.string().min(1, "İletişim kişisi gereklidir"),
  phone: z.string().optional(),
  email: z.string().email("Geçerli email adresi giriniz").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  bio: z.string().optional(),
});

const inviteFormSchema = z.object({
  email: z.string().email("Geçerli email adresi giriniz"),
  role: z.enum(["ADMIN", "USER"]),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;
type InviteFormData = z.infer<typeof inviteFormSchema>;

export default function EnhancedCompanyDirectory() {
  const [activeTab, setActiveTab] = useState("directory");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyDirectory | null>(null);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showAutoResponderDialog, setShowAutoResponderDialog] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draftText, setDraftText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const draftTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Presence heartbeat
  useEffect(() => {
    const heartbeat = () => {
      apiRequest("/api/presence/heartbeat", "POST", {}).catch(() => {});
    };
    
    heartbeat(); // Initial heartbeat
    const interval = setInterval(heartbeat, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread]);

  // Draft auto-save
  useEffect(() => {
    if (activeThread && draftText) {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
      
      draftTimeoutRef.current = setTimeout(() => {
        apiRequest("/api/drafts/upsert", "POST", {
          threadId: activeThread,
          body: draftText,
        }).catch(() => {});
      }, 1000);
    }
    
    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
    };
  }, [draftText, activeThread]);

  // Companies query
  const { data: companies = [], isLoading: companiesLoading } = useQuery<CompanyDirectory[]>({
    queryKey: ["/api/directory/firms", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      const response = await apiRequest(`/api/directory/firms?${params.toString()}`);
      return Array.isArray(response) ? response : [];
    },
  });

  // Threads query
  const { data: threads = [] } = useQuery<DirectThread[]>({
    queryKey: ["/api/threads"],
    enabled: activeTab === "messages",
    refetchInterval: 3000,
  });

  // Messages for active thread
  const { data: messages = [] } = useQuery<DirectMessage[]>({
    queryKey: ["/api/threads", activeThread, "messages"],
    queryFn: () => apiRequest(`/api/threads/${activeThread}/messages`),
    enabled: !!activeThread,
    refetchInterval: 2000,
  });

  // Invites query
  const { data: invites = [] } = useQuery<FirmInvite[]>({
    queryKey: ["/api/invites"],
    enabled: showInviteDialog,
  });

  // Auto responder query
  const { data: autoResponder } = useQuery<AutoResponder>({
    queryKey: ["/api/autoresponder"],
    enabled: showAutoResponderDialog,
  });

  // Load draft when thread changes
  useQuery({
    queryKey: ["/api/drafts", activeThread],
    queryFn: async () => {
      const response = await apiRequest(`/api/drafts/${activeThread}`);
      setDraftText(response.body || "");
      return response;
    },
    enabled: !!activeThread,
  });

  // Forms
  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
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
    },
  });

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "USER",
    },
  });

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn: (data: CompanyFormData) => apiRequest("/api/company-directory", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory/firms"] });
      toast({ title: "Başarılı", description: "Firma başarıyla eklendi" });
      setShowCompanyForm(false);
      companyForm.reset();
    },
    onError: () => {
      toast({ title: "Hata", description: "Firma eklenirken hata oluştu", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { body?: string; attachmentUrl?: string; attachmentType?: string }) =>
      apiRequest(`/api/threads/${activeThread}/messages`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threads", activeThread, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/threads"] });
      setMessageText("");
      setDraftText("");
      // Clear draft
      apiRequest("/api/drafts/upsert", "POST", {
        threadId: activeThread,
        body: "",
      }).catch(() => {});
    },
    onError: () => {
      toast({ title: "Hata", description: "Mesaj gönderilemedi", variant: "destructive" });
    },
  });

  const createInviteMutation = useMutation({
    mutationFn: (data: InviteFormData) => apiRequest("/api/invites", "POST", data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invites"] });
      toast({ 
        title: "Davet Oluşturuldu", 
        description: "Davet linki panoya kopyalandı",
      });
      navigator.clipboard.writeText(response.inviteUrl);
      inviteForm.reset();
    },
    onError: () => {
      toast({ title: "Hata", description: "Davet oluşturulamadı", variant: "destructive" });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (uploadResult) => {
      sendMessageMutation.mutate({
        attachmentUrl: uploadResult.url,
        attachmentType: "image",
      });
    },
    onError: () => {
      toast({ title: "Hata", description: "Resim yüklenemedi", variant: "destructive" });
    },
  });

  // Event handlers
  const handleSendMessage = () => {
    if (!messageText.trim() && !uploadingImage) return;
    
    sendMessageMutation.mutate({ body: messageText });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    uploadImageMutation.mutate(file, {
      onSettled: () => setUploadingImage(false),
    });
  };

  const handleStartConversation = async (company: CompanyDirectory) => {
    try {
      const response = await apiRequest("/api/threads/create", "POST", {
        targetCompanyId: company.id,
      });
      setActiveThread(response.id);
      setActiveTab("messages");
    } catch (error) {
      toast({ title: "Hata", description: "Mesajlaşma başlatılamadı", variant: "destructive" });
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Şimdi";
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">PRO Firma Rehberi</h1>
          <p className="text-muted-foreground">Gelişmiş mesajlaşma ve iş ağı sistemi</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInviteDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Davet Et
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAutoResponderDialog(true)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Otomatik Yanıt
          </Button>
          <Button onClick={() => setShowCompanyForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Firma Ekle
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="directory">
            <Building2 className="h-4 w-4 mr-2" />
            Firma Rehberi
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageCircle className="h-4 w-4 mr-2" />
            Mesajlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Firma adı, şehir, sektör ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companiesLoading ? (
              <div className="col-span-full text-center py-8">Yükleniyor...</div>
            ) : companies.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Firma bulunamadı
              </div>
            ) : (
              companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={company.logoUrl} alt={company.companyName} />
                          <AvatarFallback>
                            {company.companyName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {company.companyName}
                            {company.isVerified && <Shield className="h-4 w-4 text-blue-500" />}
                            {company.subscriptionStatus === "PRO" && <Crown className="h-4 w-4 text-yellow-500" />}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{company.contactPerson}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStartConversation(company)}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Mesaj Gönder
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Şikayet Et
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Ban className="h-4 w-4 mr-2" />
                            Engelle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {company.industry && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{company.industry}</span>
                      </div>
                    )}
                    {company.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{company.city}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    {company.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {company.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleStartConversation(company)}
                        className="flex-1"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Mesaj
                      </Button>
                      {company.website && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Konuşmalar</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                        activeThread === thread.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setActiveThread(thread.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>F</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">Firma Adı</p>
                          <p className="text-sm text-muted-foreground truncate">
                            Son mesaj önizlemesi...
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {thread.lastMessageAt && formatLastSeen(thread.lastMessageAt.toString())}
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2">
              {activeThread ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>F</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">Firma Adı</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                            <span>Çevrimiçi</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <BellOff className="h-4 w-4 mr-2" />
                            Sessiz
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Şikayet Et
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Ban className="h-4 w-4 mr-2" />
                            Engelle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <ScrollArea className="h-[350px] mb-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.messageType === "auto_reply" 
                                ? "justify-start" 
                                : "justify-end"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.messageType === "auto_reply"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary text-primary-foreground"
                              }`}
                            >
                              {message.attachmentType === "image" ? (
                                <div className="space-y-2">
                                  <img
                                    src={message.attachmentUrl}
                                    alt="Shared image"
                                    className="rounded-lg max-w-full h-auto"
                                  />
                                  {message.body && <p>{message.body}</p>}
                                </div>
                              ) : (
                                <p>{message.body}</p>
                              )}
                              {message.messageType === "auto_reply" && (
                                <Badge variant="secondary" className="mt-2">
                                  Otomatik Yanıt
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs opacity-70">
                                  {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3 opacity-70" />
                                ) : (
                                  <Check className="h-3 w-3 opacity-70" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Input
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          setDraftText(e.target.value);
                        }}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={(!messageText.trim() && !uploadingImage) || sendMessageMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Mesajlaşmaya başlamak için bir konuşma seçin</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Company Form Dialog */}
      <Dialog open={showCompanyForm} onOpenChange={setShowCompanyForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Firma Ekle</DialogTitle>
            <DialogDescription>
              Firma rehberine yeni bir firma ekleyin.
            </DialogDescription>
          </DialogHeader>
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit((data) => createCompanyMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firma Adı *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İletişim Kişisi *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şehir</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sektör</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={companyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCompanyForm(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={createCompanyMutation.isPending}>
                  {createCompanyMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firma Davet Et</DialogTitle>
            <DialogDescription>
              Yeni kullanıcıları firmanıza davet edin.
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit((data) => createInviteMutation.mutate(data))} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Adresi</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">Kullanıcı</SelectItem>
                        <SelectItem value="ADMIN">Yönetici</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={createInviteMutation.isPending}>
                  {createInviteMutation.isPending ? "Gönderiliyor..." : "Davet Gönder"}
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Invites List */}
          {invites.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Bekleyen Davetler</h4>
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">{invite.role}</p>
                  </div>
                  <Badge variant={invite.acceptedAt ? "default" : "secondary"}>
                    {invite.acceptedAt ? "Kabul Edildi" : "Bekliyor"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auto Responder Dialog */}
      <Dialog open={showAutoResponderDialog} onOpenChange={setShowAutoResponderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Otomatik Yanıt Ayarları</DialogTitle>
            <DialogDescription>
              Gelen mesajlara otomatik yanıt ayarlarını yapılandırın.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Otomatik Yanıt Aktif</Label>
              <Button variant="outline" size="sm">
                {autoResponder?.enabled ? "Aktif" : "Pasif"}
              </Button>
            </div>
            <div>
              <Label>Yanıt Modu</Label>
              <Select defaultValue={autoResponder?.mode || "KEYWORD"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KEYWORD">Anahtar Kelime</SelectItem>
                  <SelectItem value="ALWAYS">Her Zaman</SelectItem>
                  <SelectItem value="OFFHOURS">Mesai Dışı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mesaj İçeriği</Label>
              <Textarea 
                defaultValue={autoResponder?.messageBody || "Merhaba! Mesajınızı aldık, en kısa sürede dönüş yapacağız."}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAutoResponderDialog(false)}>
                İptal
              </Button>
              <Button>Kaydet</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}