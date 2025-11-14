import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Edit, 
  Users, 
  Building, 
  Home, 
  Wallet, 
  UserCog,
  Plus,
  Info,
  BarChart3,
  Briefcase,
  Calculator,
  LogOut,
  Shield,
  Bell,
  X,
  MessageCircle,
  MessageSquare,
  UserCircle,
  Brain,
  User,
  Lock,
  CreditCard,
  Settings,
  DollarSign,
  TrendingUp,
  Bitcoin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  customerTasks: {
    total: number;
    pending: number;
    completed: number;
  };
  customerPayments: {
    total: number;
    thisMonth: number;
    count: number;
  };
}

export default function MobileDashboard() {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial-summary"],
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock döviz kurları
  const currencies = [
    { name: "Dolar", symbol: "$", value: "32.45", change: "+0.12%" },
    { name: "Euro", symbol: "€", value: "34.82", change: "-0.05%" },
    { name: "Altın", symbol: "🥇", value: "2,185", change: "+1.2%" },
    { name: "Bist 100", symbol: "📈", value: "9,245", change: "+0.8%" },
    { name: "Bitcoin", symbol: "₿", value: "43,250$", change: "+2.1%" },
  ];

  // Mock notlar
  const notes = [
    { id: 1, title: "Müşteri toplantısı", time: "14:30", date: "Bugün" },
    { id: 2, title: "Fatura kontrolü", time: "16:00", date: "Bugün" },
    { id: 3, title: "Proje teslimi", time: "09:00", date: "Yarın" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menü</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="space-y-2">
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-3">
                    Hesap Ayarları
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 mb-1"
                    onClick={() => {
                      setLocation("/account");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-3 text-blue-500" />
                    Profil
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 mb-1"
                    onClick={() => {
                      setLocation("/account");
                      setIsSidebarOpen(false);
                      setTimeout(() => {
                        const event = new CustomEvent('setAccountSection', { detail: 'guvenlik' });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <Shield className="h-4 w-4 mr-3 text-green-500" />
                    Güvenlik
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 mb-1"
                    onClick={() => {
                      setLocation("/account");
                      setIsSidebarOpen(false);
                      setTimeout(() => {
                        const event = new CustomEvent('setAccountSection', { detail: 'abonelik' });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-3 text-purple-500" />
                    Abonelik
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 mb-1"
                    onClick={() => {
                      setLocation("/account");
                      setIsSidebarOpen(false);
                      setTimeout(() => {
                        const event = new CustomEvent('setAccountSection', { detail: 'bildirimler' });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <Bell className="h-4 w-4 mr-3 text-yellow-500" />
                    Bildirimler
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 mb-1"
                    onClick={() => {
                      setLocation("/account");
                      setIsSidebarOpen(false);
                      setTimeout(() => {
                        const event = new CustomEvent('setAccountSection', { detail: 'tercihler' });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-500" />
                    Tercihler
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 mb-1"
                    onClick={() => {
                      setLocation("/account");
                      setIsSidebarOpen(false);
                      setTimeout(() => {
                        const event = new CustomEvent('setAccountSection', { detail: 'odeme' });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-3 text-orange-500" />
                    Ödeme
                  </Button>
                </div>
                
                {user && 'isAdmin' in user && user.isAdmin && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-3">
                      Yönetim
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setLocation("/admin");
                        setIsSidebarOpen(false);
                      }}
                    >
                      <Shield className="h-4 w-4 mr-3 text-red-500" />
                      Admin Panel
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Ana İçerik */}
      <div className="pt-16 pb-6 px-4">
        {/* Finansal Durum Kartları - 2+1 Layout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="text-xs opacity-90 mb-1">Alınan İşler</div>
              <div className="text-lg font-bold">{formatCurrency(summary?.totalIncome || 125000)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="text-xs opacity-90 mb-1">Alınan Ödemeler</div>
              <div className="text-lg font-bold">{formatCurrency(summary?.customerPayments.total || 98000)}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mb-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="text-xs opacity-90 mb-1">Bakiye</div>
              <div className="text-xl font-bold">{formatCurrency(summary?.netBalance || 27000)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Kartları */}
        <div className="space-y-3 mb-4">
          {/* Müşteriler & Personeller */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/customers")}>
              <CardContent className="p-4 text-center">
                <UserCog className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-white">Müşteriler</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/personnel")}>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-white">Personeller</div>
              </CardContent>
            </Card>
          </div>

          {/* Puantaj - Full Width Blue */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/timesheet")}>
            <CardContent className="p-4 text-center">
              <Edit className="h-10 w-10 mx-auto mb-2" />
              <div className="text-lg font-medium">Puantaj</div>
              <div className="text-xs opacity-90">Puantaj kayıtlarını yönet</div>
            </CardContent>
          </Card>

          {/* Verilen Projeler & Kasa */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/projects")}>
              <CardContent className="p-4 text-center">
                <Home className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-white">Verilen Projeler</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/finances")}>
              <CardContent className="p-4 text-center">
                <Wallet className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-white">Kasa</div>
              </CardContent>
            </Card>
          </div>

          {/* Mesajlar & PRO Firma Rehberi */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/messages")}>
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-white">Mesajlar</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/enhanced-company-directory")}>
              <CardContent className="p-4 text-center">
                <Building className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-white">PRO Firma Rehberi</div>
              </CardContent>
            </Card>
          </div>

          {/* AI Asistan - Full Width Modern Green */}
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setLocation("/ai-assistant")}>
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 mx-auto mb-3" />
              <div className="text-xl font-semibold mb-1">AI Asistan</div>
              <div className="text-sm opacity-90">Akıllı iş asistanınız</div>
              <div className="inline-flex items-center mt-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                <span className="animate-pulse mr-1">●</span>
                Aktif
              </div>
            </CardContent>
          </Card>

          {/* Toplu SMS & Raporlar */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/bulk-sms")}>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-white">Toplu SMS</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/reports")}>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-800 dark:text-white">Raporlar</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Döviz Kurları - Horizontal Scroll */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 px-1">Döviz Kurları</h3>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {currencies.map((currency, index) => (
              <Card key={index} className="flex-shrink-0 w-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-3 text-center">
                  <div className="text-lg mb-1">{currency.symbol}</div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{currency.name}</div>
                  <div className="text-sm font-bold text-gray-800 dark:text-white">{currency.value}</div>
                  <div className={`text-xs ${currency.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {currency.change}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Notlar-Hatırlatıcılar */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800 dark:text-white text-lg">Notlar - Hatırlatıcılar</CardTitle>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-white">{note.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{note.date} - {note.time}</div>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}