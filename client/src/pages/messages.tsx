import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon, 
  Smile,
  ArrowDown,
  Info,
  Ban,
  VolumeX,
  Flag,
  CheckCheck,
  Check,
  Home,
  MessageCircle,
  Circle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { CompanyDirectory, DirectMessage } from "@shared/schema";

export default function Messages() {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Firma rehberinden firmaları al
  const { data: companies = [] } = useQuery<CompanyDirectory[]>({
    queryKey: ["/api/company-directory"],
    queryFn: () => apiRequest("/api/company-directory", "GET"),
  });

  // Kullanıcının kendi firmasını al
  const { data: userCompanies } = useQuery({
    queryKey: ["/api/company-directory/my-companies"],
    queryFn: () => apiRequest("/api/company-directory/my-companies", "GET"),
  });
  
  const currentUserFirmId = userCompanies?.[0]?.id;

  // Aktif thread için mesajları al
  const { data: messages = [] } = useQuery<DirectMessage[]>({
    queryKey: [`/api/messages/${activeThread}`],
    refetchInterval: 3000,
    enabled: !!activeThread,
    staleTime: 0,
    gcTime: 0,
  });

  // Mesaj gönderme
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; toCompanyId: string }) =>
      apiRequest(`/api/threads/${data.toCompanyId}/messages`, "POST", {
        content: data.content,
        toCompanyId: data.toCompanyId,
      }),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${activeThread}`] });
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
    },
  });

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Search filtreleme
  const filteredCompanies = companies.filter(company =>
    company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeThread) return;
    
    sendMessageMutation.mutate({
      content: messageText.trim(),
      toCompanyId: activeThread,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Mesajlar</h1>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sol Panel - Firma Listesi */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Firma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Firmalar Listesi */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredCompanies.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz firma yok</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeThread === company.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setActiveThread(company.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {company.companyName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{company.companyName}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                            <span>Çevrimiçi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sağ Panel - Mesajlaşma Alanı */}
        <div className="flex-1 flex flex-col">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {companies.find(c => c.id === activeThread)?.companyName?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">
                      {companies.find(c => c.id === activeThread)?.companyName}
                    </h2>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                      <span>Çevrimiçi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
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

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Mesajınızı yazın ve Enter'a basın..."
                      className="pr-10"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Mesajlaşmaya başlayın</h3>
                <p>Soldan bir firma seçerek mesajlaşmaya başlayabilirsiniz</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}