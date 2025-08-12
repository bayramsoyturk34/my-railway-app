import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Check
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
import { apiRequest } from '@/lib/queryClient';

interface Company {
  id: string;
  name: string;
  sector?: string;
  city?: string;
  email?: string;
  phone?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId?: string;
  createdAt: string;
  isRead: boolean;
  imageUrl?: string;
  delivery?: 'SENT' | 'DELIVERED' | 'READ';
}

interface Thread {
  id: string;
  company: Company;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
}

function ReadIcon({ delivery }: { delivery?: string }) {
  if (delivery === 'READ') return <CheckCheck className="w-3 h-3 text-blue-500" title="Görüldü" />;
  if (delivery === 'DELIVERED') return <CheckCheck className="w-3 h-3 text-gray-400" title="Teslim edildi" />;
  return <Check className="w-3 h-3 text-gray-400" title="Gönderildi" />;
}

function ThreadList({ 
  threads, 
  activeThreadId, 
  onSelect,
  searchQuery,
  onSearchChange 
}: {
  threads: Thread[];
  activeThreadId: string | null;
  onSelect: (threadId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const filteredThreads = threads.filter(thread => 
    thread.company?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) || false
  );

  return (
    <div className="bg-muted/40 rounded-2xl p-2 overflow-y-auto">
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Firma ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="h-full">
        <div className="space-y-1 p-2">
          {filteredThreads.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Henüz mesaj yok</p>
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3 rounded-xl cursor-pointer transition-colors hover:bg-muted/50 ${
                  activeThreadId === thread.id ? 'bg-primary/10 border border-primary/20' : ''
                }`}
                onClick={() => onSelect(thread.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {thread.company?.name?.charAt(0)?.toUpperCase() || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    {thread.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{thread.company?.name || 'Bilinmeyen Firma'}</h3>
                      {thread.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 h-5 px-2 text-xs">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    {thread.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {thread.lastMessage.imageUrl ? '📷 Resim' : thread.lastMessage.content}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {thread.isOnline ? (
                        <span className="text-green-600 font-medium">• Çevrimiçi</span>
                      ) : (
                        thread.lastSeen && `Son görülme: ${new Date(thread.lastSeen).toLocaleString('tr-TR')}`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ChatHeader({ 
  company, 
  isOnline, 
  lastSeen 
}: { 
  company: Company; 
  isOnline: boolean; 
  lastSeen?: string; 
}) {
  return (
    <div className="px-4 py-3 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {company?.name?.charAt(0)?.toUpperCase() || 'F'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-xl font-semibold">{company?.name || 'Bilinmeyen Firma'}</h2>
            <p className="text-sm text-muted-foreground">
              {isOnline ? (
                <span className="text-green-600 font-medium">• Çevrimiçi</span>
              ) : (
                lastSeen && `Son görülme: ${new Date(lastSeen).toLocaleString('tr-TR')}`
              )}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Ban className="w-4 h-4 mr-2" />
              Engelle
            </DropdownMenuItem>
            <DropdownMenuItem>
              <VolumeX className="w-4 h-4 mr-2" />
              Sessize Al
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Flag className="w-4 h-4 mr-2" />
              Şikayet Et
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function MessageBubble({ 
  message, 
  isOwnMessage 
}: { 
  message: Message; 
  isOwnMessage: boolean; 
}) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[72%] md:max-w-[80%] ${
        isOwnMessage 
          ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm' 
          : 'bg-muted text-foreground rounded-2xl rounded-bl-sm'
      } px-4 py-3 shadow-md`}>
        {message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Paylaşılan resim" 
            className="rounded-lg max-w-full h-auto mb-2"
          />
        )}
        
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        
        <div className={`text-xs mt-1 flex items-center gap-1 ${
          isOwnMessage ? 'opacity-70' : 'opacity-70'
        }`}>
          <span>{new Date(message.createdAt).toLocaleTimeString('tr-TR')}</span>
          {isOwnMessage && <ReadIcon delivery={message.delivery} />}
        </div>
      </div>
    </div>
  );
}

function MessageList({ 
  messages, 
  currentUserId 
}: { 
  messages: Message[]; 
  currentUserId: string; 
}) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <div className="space-y-4">
        {Object.entries(groupedMessages).map(([dateString, dayMessages]) => (
          <div key={dateString}>
            <div className="flex justify-center my-4">
              <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                {formatDateGroup(dateString)}
              </div>
            </div>
            
            {dayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUserId}
              />
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function MessageInput({ 
  onSend, 
  disabled 
}: { 
  onSend: (content: string, image?: File) => void; 
  disabled: boolean; 
}) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || selectedImage) {
      onSend(message.trim(), selectedImage || undefined);
      setMessage('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="p-4 border-t">
      {selectedImage && (
        <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm">{selectedImage.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </Button>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            placeholder="Mesajınızı yazın... (Ctrl+Enter ile gönder)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={disabled}
          />
        </div>
        
        <div className="flex space-x-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !selectedImage)}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        Ctrl+Enter ile gönder • Shift+Enter ile yeni satır
      </div>
    </div>
  );
}

function InfoPanel({ 
  company, 
  isVisible, 
  onToggle 
}: { 
  company?: Company; 
  isVisible: boolean; 
  onToggle: () => void; 
}) {
  if (!isVisible || !company) return null;

  return (
    <div className="bg-muted/30 rounded-2xl p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Firma Bilgileri</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          ✕
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {company?.name?.charAt(0)?.toUpperCase() || 'F'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{company?.name || 'Bilinmeyen Firma'}</h4>
              {company.sector && (
                <p className="text-sm text-muted-foreground">{company.sector}</p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2">
          {company.city && (
            <div className="text-sm">
              <span className="font-medium">Şehir:</span> {company.city}
            </div>
          )}
          {company.email && (
            <div className="text-sm">
              <span className="font-medium">E-posta:</span> {company.email}
            </div>
          )}
          {company.phone && (
            <div className="text-sm">
              <span className="font-medium">Telefon:</span> {company.phone}
            </div>
          )}
          
          <Separator className="my-3" />
          
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              Davet Linki Oluştur
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Müşteri Kartına Bağla
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Fetch companies for threads
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/company-directory'],
    enabled: !!user,
  });

  // Fetch messages for active thread
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages', activeThreadId],
    enabled: !!activeThreadId && !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, threadId, image }: { content: string; threadId: string; image?: File }) => {
      // If image, upload first
      let imageUrl;
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadResponse = await apiRequest('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        imageUrl = uploadResponse.url;
      }

      return apiRequest(`/api/messages/${threadId}`, {
        method: 'POST',
        body: JSON.stringify({ 
          content, 
          receiverId: threadId,
          imageUrl 
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', activeThreadId] });
      queryClient.invalidateQueries({ queryKey: ['/api/company-directory'] });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    },
  });

  // Convert companies to threads format
  const threads: Thread[] = companies.map((company: Company) => ({
    id: company.id,
    company,
    unreadCount: 0, // TODO: Calculate from real data
    isOnline: Math.random() > 0.5, // TODO: Use real online status
    lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }));

  const activeCompany = activeThreadId ? companies.find((c: Company) => c.id === activeThreadId) : null;

  const handleSendMessage = (content: string, image?: File) => {
    if (!activeThreadId) return;
    
    sendMessageMutation.mutate({
      content,
      threadId: activeThreadId,
      image,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
        <div className={`grid gap-4 h-full ${
          showInfoPanel 
            ? 'grid-cols-[320px_1fr_360px] xl:grid-cols-[320px_1fr_360px]' 
            : 'grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_360px]'
        }`}>
          {/* Thread List */}
          <ThreadList
            threads={threads}
            activeThreadId={activeThreadId}
            onSelect={setActiveThreadId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Chat Area */}
          <div className="bg-background rounded-2xl border overflow-hidden flex flex-col">
            {activeThreadId && activeCompany ? (
              <>
                <ChatHeader
                  company={activeCompany}
                  isOnline={threads.find(t => t.id === activeThreadId)?.isOnline || false}
                  lastSeen={threads.find(t => t.id === activeThreadId)?.lastSeen}
                />
                
                <MessageList
                  messages={messages}
                  currentUserId={user.id}
                />
                
                <MessageInput
                  onSend={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <h3 className="text-lg font-medium mb-2">Mesajlaşmaya Başlayın</h3>
                  <p>Sol taraftan bir firma seçerek mesajlaşmaya başlayabilirsiniz</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className={`${showInfoPanel ? 'block' : 'hidden xl:block'}`}>
            <InfoPanel
              company={activeCompany}
              isVisible={true}
              onToggle={() => setShowInfoPanel(false)}
            />
          </div>
        </div>

        {/* Toggle Info Panel Button (Mobile) */}
        {activeThreadId && (
          <Button
            className="fixed bottom-6 right-6 xl:hidden rounded-full shadow-lg"
            size="sm"
            onClick={() => setShowInfoPanel(!showInfoPanel)}
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}