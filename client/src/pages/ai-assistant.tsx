import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Brain,
  Plus,
  ArrowLeft,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Building,
  Calendar,
  BarChart3,
  Loader2,
  User
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  tokensUsed?: number;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

interface QuickCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  examples: string[];
  useCount: number;
}

export default function AiAssistantPage() {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/ai/conversations"],
    refetchInterval: 30000
  });

  // Fetch messages for selected conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/ai/messages", selectedConversation],
    enabled: !!selectedConversation,
    refetchInterval: 1000,
    refetchOnWindowFocus: true
  });

  // Fetch AI usage stats
  const { data: usage } = useQuery<any>({
    queryKey: ["/api/ai/usage"],
    refetchInterval: 30000
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ question, conversationId }: { question: string; conversationId?: string }) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      // Add sessionId from localStorage as Authorization header
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        headers["Authorization"] = `Bearer ${sessionId}`;
      }
      
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ question, conversationId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Bir hata oluştu");
      }
      
      return response.json();
    },
    onSuccess: async (data) => {
      const conversationId = data.conversationId || selectedConversation;
      if (data.conversationId && !selectedConversation) {
        setSelectedConversation(data.conversationId);
      }
      // Force immediate refetch with correct query keys
      await queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/ai/messages", conversationId] });
      await queryClient.invalidateQueries({ queryKey: ["/api/ai/usage"] });
      
      // Manual refetch for current messages
      if (conversationId) {
        setTimeout(() => {
          refetchMessages();
        }, 500);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const startNewConversation = () => {
    setSelectedConversation(null);
    setSelectedCategory(null);
    setInput("");
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setSelectedConversation(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const question = input.trim();
    setInput("");
    setIsLoading(true);
    
    try {
      await sendMessageMutation.mutateAsync({ 
        question, 
        conversationId: selectedConversation || undefined 
      });
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickCategories: QuickCategory[] = [
    {
      id: "tax",
      title: "Vergi",
      description: "Vergi ve yasal zorunluluklar",
      icon: Calculator,
      examples: [
        "E-Fatura ve E-Defter",
        "Beyanname Tarihleri", 
        "Gelir/Kurumlar Vergisi",
        "Vergiden Düşülebilen Giderler",
        "KDV Hesaplama",
        "Şirket Türü Seçimi"
      ],
      useCount: 1
    },
    {
      id: "business",
      title: "İş Planı", 
      description: "İş stratejileri ve planlama",
      icon: BarChart3,
      examples: [
        "Hedef Kitle ve Sorun Analizi",
        "Rekabet ve Farklılaşma Stratejisi", 
        "Pazarlama ve Satış Stratejisi",
        "Fiyatlandırma ve Gelir Modeli",
        "Finansal Planlama ve Maliyetler",
        "İş Hedefleri ve Yol Haritası"
      ],
      useCount: 1
    },
    {
      id: "currency",
      title: "Güncel Döviz Kuru",
      description: "Anlık döviz kurları",
      icon: DollarSign,
      examples: ["USD kuru", "Euro hesaplama"],
      useCount: 1
    },
    {
      id: "reports",
      title: "Rapor Analizi",
      description: "İş raporları",
      icon: FileText,
      examples: ["Satış analizi", "Performans raporu"],
      useCount: 1
    },
    {
      id: "advertising",
      title: "Reklam Analizi",
      description: "Reklam stratejileri ve analiz",
      icon: Users,
      examples: [
        "Sosyal Medya Reklamları",
        "Google Ads Optimizasyonu",
        "Reklam Bütçesi Dağılımı",
        "A/B Test Stratejisi",
        "Hedef Kitle Analizi",
        "Rekabet Analizi ve Benchmark"
      ],
      useCount: 1
    }
  ];

  const fullQuestions: { [key: string]: string } = {
    // Vergi kategorisi
    "E-Fatura ve E-Defter": "E-Fatura, E-Defter Gibi Dijital Zorunluluklar Nelerdir?",
    "Beyanname Tarihleri": "Hangi Beyannameleri Ne Zaman Vermeliyim?",
    "Gelir/Kurumlar Vergisi": "Gelir Vergisi veya Kurumlar Vergisi Nasıl Hesaplanır?",
    "Vergiden Düşülebilen Giderler": "Hangi Giderleri Vergiden Düşebilirim?",
    "KDV Hesaplama": "KDV (Katma Değer Vergisi) Nedir ve Nasıl Hesaplanır?",
    "Şirket Türü Seçimi": "Hangi Şirket Türünü Kurmalıyım?",
    
    // İş Planı kategorisi
    "Hedef Kitle ve Sorun Analizi": "İş planım için bir hedef kitle ve sorun analizi yapmama yardımcı olur musun? Benim için potansiyel müşteri profilini, onların yaşadığı sorunları ve pazar boşluğunu bulmam için hangi bilgilere ihtiyacın var?",
    "Rekabet ve Farklılaşma Stratejisi": "Pazardaki rakiplerimi ve rekabet avantajımı belirlememe yardım et. Rakibim X ve Y'nin güçlü ve zayıf yönlerini nasıl analiz edebilirim ve benim ürünümü onlardan ayıran ne olmalı?",
    "Pazarlama ve Satış Stratejisi": "İş planım için detaylı bir pazarlama ve satış stratejisi oluşturmam gerekiyor. Hedef kitleme (örneğin, genç profesyoneller) ulaşmak için en etkili dijital pazarlama kanalları nelerdir ve bir satış hunisini nasıl tasarlayabilirim?",
    "Fiyatlandırma ve Gelir Modeli": "Ürün veya hizmetim için en uygun fiyatlandırma modelini bulmama yardımcı olur musun? Abonelik, tek seferlik satış veya freemium gibi modellerin avantaj ve dezavantajlarını ve benim işime hangisinin daha uygun olacağını nasıl analiz edebiliriz?",
    "Finansal Planlama ve Maliyetler": "İş planımın finansal bölümü için bir başlangıç maliyeti tahmini yapmama yardım et. Örneğin, bir kafe veya e-ticaret sitesi için en yaygın sabit ve değişken maliyet kalemleri nelerdir?",
    "İş Hedefleri ve Yol Haritası": "İş planım için ilk yılın ana hedeflerini ve kilometre taşlarını belirlememe yardım et. Pazara ilk giriş için hangi somut hedefleri koymalıyım ve bu hedeflere ulaşmak için nasıl bir zaman çizelgesi oluşturabilirim?",
    
    // Reklam Analizi kategorisi
    "Sosyal Medya Reklamları": "Facebook, Instagram ve LinkedIn reklamlarımın performansını nasıl analiz edebilirim? Hangi metriklere odaklanmalıyım ve ROI'mi nasıl artırabilirim?",
    "Google Ads Optimizasyonu": "Google Ads kampanyalarımda tıklama oranı düşük ve maliyet yüksek. Anahtar kelime stratejimi ve reklam metinlerimi nasıl optimize edebilirim?",
    "Reklam Bütçesi Dağılımı": "Aylık 10.000 TL reklam bütçemi farklı platformlara (Google, Facebook, Instagram) nasıl dağıtmalıyım? Her platform için optimal harcama oranı nedir?",
    "A/B Test Stratejisi": "Reklam kampanyalarımda A/B testleri nasıl yapmalıyım? Reklam görsellerini, başlıklarını ve hedef kitlelerini test etmek için en etkili yöntem nedir?",
    "Hedef Kitle Analizi": "Reklamlarımın doğru kitleye ulaştığından nasıl emin olabilirim? Demografik analiz ve davranışsal hedefleme için hangi verileri kullanmalıyım?",
    "Rekabet Analizi ve Benchmark": "Rakipleriminin reklam stratejilerini nasıl analiz edebilirim? Onların hangi anahtar kelimeleri kullandığını ve reklam metinlerini nasıl öğrenebilirim?"
  };

  const handleQuickQuestion = (example: string) => {
    const fullQuestion = fullQuestions[example] || example;
    setInput(fullQuestion);
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobil Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Asistan
              </h1>
            </div>
          </div>
          <Button
            onClick={startNewConversation}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Sohbet
          </Button>
        </div>

        {/* Usage Stats */}
        {usage && (
          <div className="mt-3 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-400">Bugün: </span>
              <span className="text-blue-400 font-semibold">{usage.usage?.dailyQuestions || 0}</span>
            </div>
            <div className="w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-400">Limit: </span>
              <span className="text-purple-400 font-semibold">{usage.usage?.dailyLimit || 20}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobil Layout - Tek Sütun */}
      <div className="p-4 space-y-4">
        {!selectedConversation ? (
          <>
            {/* Kategori Seçimi */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-center mb-4">Ne hakkında konuşmak istiyorsun?</h2>
              <div className="grid grid-cols-1 gap-3">
                {quickCategories.map((category, index) => (
                  <div key={category.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <Button
                      variant="ghost"
                      className={`w-full p-4 h-auto text-left justify-start ${
                        selectedCategory === category.id ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`p-2 rounded-lg ${
                          index === 0 ? 'bg-blue-500/20 text-blue-400' :
                          index === 1 ? 'bg-green-500/20 text-green-400' :
                          index === 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          <category.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{category.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                        </div>
                      </div>
                    </Button>
                    
                    {/* Kategori örnekleri */}
                    {selectedCategory === category.id && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-400 mb-2">Örnek sorular:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {category.examples.map((example, exampleIndex) => (
                            <Button
                              key={exampleIndex}
                              variant="outline"
                              className="text-left justify-start bg-gray-900 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 p-3 h-auto"
                              onClick={() => handleQuickQuestion(example)}
                            >
                              <span className="text-sm">{example}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Eski Konuşmalar */}
            {conversations.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Eski Sohbetler
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {conversations.map((conversation, index) => (
                    <Button
                      key={conversation.id}
                      variant="ghost"
                      className={`w-full p-3 h-auto text-left justify-start ${
                        selectedConversation === conversation.id ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`w-3 h-3 rounded-full ${
                          index % 4 === 0 ? 'bg-blue-400' :
                          index % 4 === 1 ? 'bg-green-400' :
                          index % 4 === 2 ? 'bg-yellow-400' : 'bg-purple-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{conversation.title}</div>
                          <div className="text-xs text-gray-400 truncate mt-1">{conversation.lastMessage}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="pb-16">
            <div className="flex items-center gap-3 p-3 mb-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-gray-700"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h3 className="font-semibold">Sohbet</h3>
            </div>
            
            <div className="overflow-y-auto px-2" style={{height: 'calc(100vh - 140px)'}}>
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`w-full p-4 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg"
                          : "text-gray-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-3 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(message.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        {message.tokensUsed && (
                          <span className="text-blue-400">• {message.tokensUsed} token</span>
                        )}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-full p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-gray-300 text-base">Hazırlanıyor...</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
        
      {/* Mesaj Gönderme Alanı - Sabit alt kısım */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Herhangi bir şey sor..."
            className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg p-3 min-h-[40px] max-h-[120px] text-sm placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}