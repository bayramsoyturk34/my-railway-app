import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, Bot, User, Home, Star, StarOff, Search, Tag, 
  Bookmark, BookmarkPlus, Copy, Share, FileText, 
  TrendingUp, DollarSign, Users, Building,
  Calculator, FileBarChart, UserCheck, BarChart3,
  Filter, Calendar, Eye, MessageSquare, Download,
  Sparkles, Clock, Loader2, Plus
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  isFavorite?: boolean;
  tags?: ConversationTag[];
}

interface ConversationTag {
  id: string;
  tag: string;
  color: string;
}

interface QuickTemplate {
  id: string;
  category: string;
  title: string;
  prompt: string;
  useCount: number;
}

interface BusinessData {
  customerCount: number;
  activeProjects: number;
  cashBalance: number;
  monthlyRevenue: number;
  pendingTasks: number;
}

interface Usage {
  dailyQuestions: number;
  dailyLimit: number;
  monthlyQuestions: number;
  monthlyLimit: number;
  tokensUsed: number;
  estimatedCost: number;
}


export default function AIAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick Templates
  const { data: templates = [] } = useQuery<QuickTemplate[]>({
    queryKey: ["/api/ai/templates"]
  });

  // Business Data
  const { data: businessData } = useQuery<BusinessData>({
    queryKey: ["/api/ai/business-data"]
  });

  // Conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/ai/conversations"]
  });

  // Messages for selected conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: [`/api/ai/conversations/${selectedConversation}/messages`],
    enabled: !!selectedConversation
  });

  // Usage statistics
  const { data: usageResponse } = useQuery({
    queryKey: ["/api/ai/usage"]
  });

  const usage = usageResponse?.usage;

  // Favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/ai/favorites"]
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, conversationId }: { message: string; conversationId?: string }) => {
      setIsTyping(true);
      const url = conversationId ? `/api/ai/conversations/${conversationId}/messages` : "/api/ai/ask";
      const payload = conversationId ? { message } : { question: message, conversationId };
      const response = await apiRequest(url, "POST", payload);
      setIsTyping(false);
      return response;
    },
    onSuccess: (data) => {
      setInput("");
      if (data.conversationId) {
        setSelectedConversation(data.conversationId);
        queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
        queryClient.invalidateQueries({ queryKey: [`/api/ai/conversations/${data.conversationId}/messages`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/ai/usage"] });
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Template use mutation
  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return await apiRequest(`/api/ai/templates/${templateId}/use`, "POST", {});
    }
  });

  // Favorite toggle mutation
  const favoriteMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest(`/api/ai/conversations/${conversationId}/favorite`, "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/favorites"] });
    }
  });

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || favorites.some((f: any) => f.conversationId === conv.id);
    return matchesSearch && matchesFavorites;
  });

  // Handle template click
  const handleTemplateClick = (template: QuickTemplate) => {
    setInput(template.prompt);
    useTemplateMutation.mutate(template.id);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    sendMessageMutation.mutate({ 
      message: input, 
      conversationId: selectedConversation || undefined 
    });
  };

  // Handle copy message
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Kopyalandı",
      description: "Mesaj panoya kopyalandı"
    });
  };

  // Start new conversation
  const startNewConversation = () => {
    setSelectedConversation(null);
    setInput("");
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Template categories
  const templateCategories = [
    { id: 'vergi', name: 'Vergi Hesaplama', icon: Calculator, color: 'bg-blue-500' },
    { id: 'is_plani', name: 'İş Planı', icon: FileBarChart, color: 'bg-green-500' },
    { id: 'maliyet', name: 'Maliyet Analizi', icon: BarChart3, color: 'bg-purple-500' },
    { id: 'personel', name: 'Personel Yönetimi', icon: UserCheck, color: 'bg-orange-500' },
    { id: 'musteri', name: 'Müşteri Analizi', icon: Users, color: 'bg-pink-500' },
    { id: 'doviz', name: 'Güncel Döviz Kuru', icon: DollarSign, color: 'bg-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-700">
          <Button
            onClick={startNewConversation}
            className="w-full bg-transparent hover:bg-gray-700 text-gray-300 border border-gray-600 rounded-lg text-left justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni sohbet
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 max-h-96">
          <div className="text-xs text-gray-400 mb-2">Eski Sohbetler</div>
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                className={`w-full text-left justify-start text-gray-300 hover:bg-gray-700 rounded-lg ${
                  selectedConversation === conversation.id ? 'bg-gray-700' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="truncate text-sm">{conversation.title}</div>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Templates */}
        <div className="p-2 border-t border-gray-700 max-h-64 overflow-y-auto">
          <div className="text-xs text-gray-400 mb-2">Hızlı Sorular</div>
          {templateCategories.map(category => {
            const template = templates.find(t => t.category === category.id);
            if (!template) return null;
            
            return (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-300 hover:bg-gray-700 mb-1 h-auto p-2"
                onClick={() => handleTemplateClick(template)}
              >
                <category.icon className="h-3 w-3 mr-2" />
                <div className="text-xs">{category.name}</div>
              </Button>
            );
          })}
        </div>

        {/* User Info */}
        <div className="p-3 border-t border-gray-700">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full text-gray-300 hover:bg-gray-700 justify-start">
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with usage stats */}
        <div className="bg-gray-800 border-b border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-semibold">AI Asistan</h1>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              {usage ? (
                <>
                  <span>{usage.dailyQuestions}/{usage.dailyLimit} Günlük</span>
                  <span>{usage.monthlyQuestions}/{usage.monthlyLimit === -1 ? '∞' : usage.monthlyLimit} Aylık</span>
                </>
              ) : (
                <span>Kullanım bilgileri yükleniyor...</span>
              )}
            </div>
          </div>
        </div>


        {/* ChatGPT Style Main Content */}
        <div className="flex-1 flex flex-col">
          {!selectedConversation ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">Nasıl yardımcı olabilirim?</h1>
                <p className="text-gray-400">İşletmeniz için AI destekli çözümler</p>
              </div>
              
              {/* Quick Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl w-full">
                {templateCategories.slice(0, 4).map(category => {
                  const template = templates.find(t => t.category === category.id);
                  if (!template) return null;
                  
                  return (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="h-16 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg p-4"
                      onClick={() => handleTemplateClick(template)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <category.icon className="h-5 w-5 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-gray-400">{template.useCount} kez kullanıldı</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Chat View */
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-purple-600' : 'bg-blue-600'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className={`p-4 rounded-2xl ${
                          message.role === 'user' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800 text-white'
                        }`}>
                          <div className="text-sm leading-relaxed">
                            {message.role === 'assistant' ? (
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: message.content
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                                    .replace(/^\d+\.\s(.+)$/gm, '<div class="ml-4 mb-1">• $1</div>')
                                    .replace(/^[-•]\s(.+)$/gm, '<div class="ml-4 mb-1">• $1</div>')
                                    .replace(/^([A-ZÜĞŞÇÖ][^:]*):$/gm, '<div class="font-semibold mt-3 mb-2">$1:</div>')
                                    .replace(/\*+/g, '')
                                }} 
                              />
                            ) : (
                              message.content
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs opacity-70">
                              {format(new Date(message.createdAt), 'HH:mm')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
                                onClick={() => handleCopyMessage(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-800 text-white">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Yazıyor...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          )}
          
          {/* Input Area - Always at Bottom */}
          <div className="border-t border-gray-700 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Herhangi bir şey sor..."
                    className="w-full bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 rounded-2xl py-3 px-4 resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || sendMessageMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 rounded-full w-10 h-10 p-0"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
