import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanyDirectorySchema, insertMessageSchema, type CompanyDirectory, type InsertCompanyDirectory, type Message, type InsertMessage } from "@shared/schema";
import { Building2, Phone, Mail, Globe, MapPin, MessageCircle, Plus, Search, Users, Send, X } from "lucide-react";

export default function CompanyDirectory() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyDirectory | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: companies = [], isLoading } = useQuery<CompanyDirectory[]>({
    queryKey: ["/api/company-directory"],
  });

  // Get messages for selected conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedCompany?.id, "current-user"],
    enabled: !!selectedCompany && showChat,
  });

  const createCompanyMutation = useMutation({
    mutationFn: (data: InsertCompanyDirectory) => apiRequest("/api/company-directory", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-directory"] });
      toast({ title: "Başarılı", description: "Firma başarıyla eklendi" });
      setShowForm(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Hata", description: "Firma eklenirken hata oluştu", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: InsertMessage) => apiRequest("/api/messages", "POST", data),
    onSuccess: () => {
      refetchMessages();
      setNewMessage("");
      toast({ title: "Başarılı", description: "Mesaj gönderildi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Mesaj gönderilemedi", variant: "destructive" });
    },
  });

  const form = useForm<InsertCompanyDirectory>({
    resolver: zodResolver(insertCompanyDirectorySchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      industry: "",
      website: "",
      description: "",
      isActive: true,
    },
  });

  const onSubmit = (data: InsertCompanyDirectory) => {
    createCompanyMutation.mutate(data);
  };

  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startConversation = (company: CompanyDirectory) => {
    setSelectedCompany(company);
    setShowChat(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCompany) return;
    
    sendMessageMutation.mutate({
      fromCompanyId: "current-user", // Bu gerçek uygulamada authentication'dan gelecek
      toCompanyId: selectedCompany.id,
      message: newMessage.trim(),
      messageType: "text",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-400" />
            Firma Rehberi
          </h1>
          <p className="text-gray-400 mt-2">Uygulamayı kullanan firmalarla iletişime geçin</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Firma Ekle
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Firma adı, yetkili kişi veya sektör ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-dark-primary border-dark-accent text-white"
        />
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
          {filteredCompanies.map((company: CompanyDirectory) => (
            <Card key={company.id} className="bg-dark-secondary border-dark-accent">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{company.companyName}</h3>
                    <p className="text-blue-400 font-medium">{company.contactPerson}</p>
                  </div>
                  {company.isActive && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Aktif
                    </Badge>
                  )}
                </div>
                {company.industry && (
                  <Badge variant="outline" className="w-fit text-gray-300 border-gray-600">
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
                {company.address && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">{company.address}</span>
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
                {company.description && (
                  <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                    {company.description}
                  </p>
                )}
                <div className="pt-3">
                  <Button
                    onClick={() => startConversation(company)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredCompanies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchTerm ? "Arama sonucu bulunamadı" : "Henüz firma eklenmemiş"}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? "Farklı anahtar kelimeler deneyin" : "İlk firmayı ekleyerek başlayın"}
          </p>
        </div>
      )}

      {/* Add Company Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Yeni Firma Ekle</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Telefon</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="0555 555 55 55"
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
                          type="email"
                          className="bg-dark-primary border-dark-accent text-white"
                          placeholder="info@firma.com"
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
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Sektör</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="İnşaat, Teknoloji, Sağlık vs."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Adres</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Firma adresi"
                        rows={1}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Açıklama</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Firma hakkında kısa açıklama"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createCompanyMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createCompanyMutation.isPending ? "Ekleniyor..." : "Firma Ekle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-3 border-b border-dark-accent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-blue-400" />
                <div>
                  <DialogTitle className="text-white text-lg">
                    {selectedCompany?.companyName}
                  </DialogTitle>
                  <p className="text-sm text-gray-400">{selectedCompany?.contactPerson}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {/* Messages Area */}
          <div className="flex flex-col h-[60vh]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Henüz mesaj yok</p>
                    <p className="text-sm text-gray-500">İlk mesajınızı göndererek sohbeti başlatın</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.fromCompanyId === "current-user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          message.fromCompanyId === "current-user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-100"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.fromCompanyId === "current-user"
                              ? "text-blue-200"
                              : "text-gray-400"
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 border-t border-dark-accent">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 bg-dark-primary border-dark-accent text-white resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter ile gönder, Shift+Enter ile yeni satır
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}