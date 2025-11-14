import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { 
  Edit, 
  Users, 
  Building, 
  Building2,
  Home, 
  Wallet, 
  CalendarDays, 
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
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import ProjectCard from "@/components/cards/project-card";
import NavigationCard from "@/components/cards/navigation-card";
import DraggableNavigationCard from "@/components/cards/draggable-navigation-card";
import TimesheetForm from "@/components/forms/timesheet-form";
import DashboardCharts from "@/components/analytics/dashboard-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";
import MobileDashboard from "./mobile-dashboard";
import ProjectCard from "@/components/cards/project-card";
import NavigationCard from "@/components/cards/navigation-card";
import DraggableNavigationCard from "@/components/cards/draggable-navigation-card";
import TimesheetForm from "@/components/forms/timesheet-form";
import DashboardCharts from "@/components/analytics/dashboard-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";

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

interface CardItem {
  id: string;
  type: 'financial' | 'navigation';
  component: JSX.Element;
}

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Device detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render if not on exact root path
  if (location !== "/") {
    return null;
  }

  // Render mobile dashboard for mobile devices
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Navigation cards with fixed routing
  const getBaseNavCards = useCallback(() => [
    { id: "timesheet", icon: Edit, label: "Puantaj Yaz", onClick: () => setShowTimesheetForm(true), iconColor: "text-blue-400" },
    { id: "personnel", icon: Users, label: "Personeller", onClick: () => setLocation("/personnel"), iconColor: "text-orange-400" },
    { id: "projects", icon: Home, label: "Verilen Projeler", onClick: () => setLocation("/projects"), iconColor: "text-pink-400" },
    { id: "finances", icon: Wallet, label: "Kasa", onClick: () => setLocation("/finances"), iconColor: "text-teal-400" },
    { id: "customers", icon: UserCog, label: "Müşteriler", onClick: () => setLocation("/customers"), iconColor: "text-orange-400" },
    { id: "messages", icon: MessageCircle, label: "Mesajlar", onClick: () => setLocation("/messages"), iconColor: "text-purple-400" },
    { id: "ai-assistant", icon: Brain, label: "AI Asistan", onClick: () => setLocation("/ai-assistant"), iconColor: "text-cyan-400" },
    { id: "company-directory", icon: MessageCircle, label: "PRO Firma Rehberi", onClick: () => setLocation("/enhanced-company-directory"), iconColor: "text-purple-400" },
    { id: "bulk-sms", icon: MessageSquare, label: "Toplu SMS", onClick: () => setLocation("/bulk-sms"), iconColor: "text-green-400" },
    { id: "reports", icon: Info, label: "Raporlar", onClick: () => setLocation("/reports"), iconColor: "text-pink-400" }
  ], [setLocation]);

  // Navigation cards state for drag and drop  
  const [navCards, setNavCards] = useState(() => {
    const baseNavCards = getBaseNavCards();
    const adminCards = (user && 'isAdmin' in user && user.isAdmin) ? [
      { id: "admin", icon: Shield, label: "Admin Panel", onClick: () => setLocation("/admin"), iconColor: "text-red-400" }
    ] : [];

    return [...baseNavCards, ...adminCards];
  });

  // Update navigation cards when user admin status changes
  useEffect(() => {
    const baseNavCards = getBaseNavCards();
    
    if (user && 'isAdmin' in user && user.isAdmin) {
      const adminCard = { id: "admin", icon: Shield, label: "Admin Panel", onClick: () => setLocation("/admin"), iconColor: "text-red-400" };
      setNavCards([...baseNavCards, adminCard]);
    } else {
      setNavCards(baseNavCards);
    }
  }, [user && 'isAdmin' in user ? user.isAdmin : false, getBaseNavCards]);

  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial-summary"],
    staleTime: 1000 * 60 * 60, // 1 hour cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Notifications query - disabled for speed
  const notifications: any[] = [];

  // Mark notification as read mutation
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

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setNavCards((prevCards) => {
      const newCards = [...prevCards];
      const draggedCard = newCards[dragIndex];
      newCards.splice(dragIndex, 1);
      newCards.splice(hoverIndex, 0, draggedCard);
      return newCards;
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Don't render if not on exact root path
  if (location !== "/") {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary text-gray-800 dark:text-white">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Sidebar */}
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-secondary border-r border-gray-200 dark:border-dark-accent z-50 transform transition-transform duration-300 ease-in-out">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menü</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Navigation Items */}
                <nav className="space-y-2">
                  {/* Account Section */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-3">
                      Hesap Ayarları
                    </div>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-dark-accent mb-1"
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
                      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-dark-accent mb-1"
                      onClick={() => {
                        // Navigate to security section of account page
                        setLocation("/account");
                        setIsSidebarOpen(false);
                        // Set active section to security after navigation
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
                      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-dark-accent mb-1"
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
                      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-dark-accent mb-1"
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
                      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-dark-accent mb-1"
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
                      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-dark-accent mb-1"
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
                  
                  {/* Admin Section */}
                  {user && 'isAdmin' in user && user.isAdmin && (
                    <div className="border-t border-gray-200 dark:border-dark-accent pt-4">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-3">
                        Yönetim
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-dark-accent"
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
        <header className="flex justify-between items-center p-4 bg-white dark:bg-dark-primary border-b border-gray-200 dark:border-dark-accent" style={{ display: 'none' }}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLocation("/")}
              className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              puantroplus
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications - Always visible */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-accent relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </Button>
                
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-accent rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 dark:border-dark-accent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-800 dark:text-white font-semibold">Bildirimler</h3>
                        <div className="flex items-center gap-2">
                          {notifications.filter(n => !n.isRead).length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
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
                            className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Henüz bildirim yok
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-200/50 dark:border-dark-accent/50 hover:bg-gray-100/50 dark:hover:bg-dark-primary/50 cursor-pointer ${
                              !notification.isRead ? 'bg-blue-600/10' : ''
                            }`}
                            onClick={() => {
                              console.log("🔥 DASHBOARD NOTIFICATION CLICKED!", notification);
                              console.log("🔥 Type:", notification.type);
                              console.log("🔥 Payload:", notification.payload);
                              
                              if (!notification.isRead) {
                                markNotificationAsReadMutation.mutate(notification.id);
                              }
                              
                              // Mesaj bildirimi ise company directory'ye yönlendir
                              if ((notification.type === 'NEW_MESSAGE' || notification.type === 'NEW_DM') && notification.payload) {
                                const payload = notification.payload as any;
                                console.log("🔥 Found message notification, fromCompanyId:", payload?.fromCompanyId);
                                
                                if (payload?.fromCompanyId) {
                                  // Company directory'ye yönlendir ve aktif thread'i set et
                                  setLocation(`/company-directory?activeThread=${payload.fromCompanyId}`);
                                  setShowNotifications(false);
                                  
                                  toast({
                                    title: "Mesaja Yönlendiriliyor",
                                    description: `${payload.fromCompanyName || 'Firma'} firmasından gelen mesaj`,
                                  });
                                } else {
                                  console.log("🔥 No fromCompanyId in payload, redirecting to company directory");
                                  setLocation("/company-directory");
                                  setShowNotifications(false);
                                }
                              } else {
                                console.log("🔥 Not a message notification, type:", notification.type);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {(notification.type === 'NEW_MESSAGE' || notification.type === 'NEW_DM') ? (
                                  <MessageCircle className="h-5 w-5 text-blue-400" />
                                ) : (
                                  <Bell className="h-5 w-5 text-blue-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                {(notification.type === 'NEW_MESSAGE' || notification.type === 'NEW_DM') && notification.payload ? (
                                  <>
                                    <div className="text-white font-medium">
                                      {(notification.payload as any).fromCompanyName || 'Yeni Mesaj'}
                                    </div>
                                    <div className="text-gray-300 text-sm mt-1 truncate">
                                      {(notification.payload as any).message || 'Mesaj içeriği'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString('tr-TR') : ''}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-white font-medium">
                                      {(notification.payload as any)?.title || 'Bildirim'}
                                    </div>
                                    <div className="text-gray-300 text-sm mt-1 truncate">
                                      {(notification.payload as any)?.content || 'Bildirim içeriği'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString('tr-TR') : ''}
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

            {/* User info */}
            {user && (
              <div className="flex items-center gap-2 text-white text-sm">
                <span>{String((user as any).firstName || (user as any).email || "Kullanıcı")}</span>
              </div>
            )}

            {/* Account Button */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-400 hover:bg-dark-accent"
                onClick={() => setLocation("/account")}
                title="Hesabım"
              >
                <UserCircle className="h-5 w-5" />
              </Button>
            )}

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-accent"
              onClick={() => {
                localStorage.removeItem('sessionId');
                queryClient.clear();
                toast({
                  title: "Başarıyla çıkış yapıldı",
                  description: "Güle güle!",
                });
                setTimeout(() => {
                  window.location.href = "/";
                }, 500);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </header>
      


      <main className="pt-20 p-4">
        {/* Customer Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ProjectCard
            title="Alınan İşler"
            total={formatCurrency(summary?.customerTasks.total || 0)}
            activeLabel=""
            activeValue=""
            passiveLabel=""
            passiveValue=""
            type="blue"
            icon="briefcase"
          />

          <ProjectCard
            title="Alınan Ödemeler"
            total={formatCurrency(summary?.customerPayments.total || 0)}
            activeLabel=""
            activeValue=""
            passiveLabel=""
            passiveValue=""
            type="green"
            icon="wallet"
          />

          <ProjectCard
            title="Kalan Bakiye"
            total={formatCurrency((summary?.customerTasks.total || 0) - (summary?.customerPayments.total || 0))}
            activeLabel=""
            activeValue=""
            passiveLabel=""
            passiveValue=""
            type="purple"
            icon="calculator"
          />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {navCards.map((card, index) => (
            <DraggableNavigationCard
              key={card.id}
              id={card.id}
              index={index}
              icon={card.icon}
              label={card.label}
              onClick={card.onClick}
              iconColor={card.iconColor}
              moveCard={moveCard}
            />
          ))}
        </div>

        {/* Analytics Section */}
        <Card className="bg-white dark:bg-dark-secondary border-gray-200 dark:border-dark-accent">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Veri Analizi ve Raporlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCharts />
          </CardContent>
        </Card>

        {/* Notes Section */}
        <div className="bg-white dark:bg-dark-secondary rounded-xl p-4 border border-gray-200 dark:border-dark-accent">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notlar</h3>
            <Button
              size="icon"
              className="bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full"
              onClick={() => console.log("Add note")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Henüz not eklenmemiş.</p>
            <p className="text-sm">Yeni not eklemek için + butonuna tıklayın.</p>
          </div>
        </div>
      </main>

      <TimesheetForm 
        open={showTimesheetForm} 
        onOpenChange={setShowTimesheetForm} 
      />
      </div>
    </DndProvider>
  );
}
