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
    {
      id: 'timesheet',
      title: 'Puantaj',
      icon: CalendarDays,
      description: 'Çalışma saatleri kaydı',
      color: 'blue',
      action: () => setLocation("/timesheet"),
      order: 1
    },
    {
      id: 'personnel',
      title: 'Personel',
      icon: Users,
      description: 'Personel bilgileri ve yönetimi',
      color: 'green', 
      action: () => setLocation("/personnel"),
      order: 2
    },
    {
      id: 'analytics',
      title: 'Raporlar',
      icon: BarChart3,
      description: 'İstatistikler ve analiz',
      color: 'purple',
      action: () => setLocation("/reports"),
      order: 3
    },
    {
      id: 'financial',
      title: 'Finans',
      icon: Calculator,
      description: 'Maaş hesaplamaları ve ödemeler',
      color: 'yellow',
      action: () => setLocation("/financial"),
      order: 4
    },
    {
      id: 'projects',
      title: 'Projeler', 
      icon: Briefcase,
      description: 'Proje yönetimi ve takibi',
      color: 'red',
      action: () => setLocation("/projects"),
      order: 5
    },
    {
      id: 'admin',
      title: 'Yönetim',
      icon: UserCog,
      description: 'Sistem ayarları ve kullanıcı yönetimi',
      color: 'gray',
      action: () => setLocation("/admin"),
      order: 6
    }
  ], [setLocation]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onSettingsClick={() => setLocation("/account")}
        />

        {/* Sidebar for mobile-like navigation */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="fixed top-0 left-0 z-50 w-64 h-full bg-card shadow-lg">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Menü</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Ana Menü</p>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-accent mb-1"
                    onClick={() => {
                      setLocation("/");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Home className="h-4 w-4 mr-3" />
                    Ana Sayfa
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-accent mb-1"
                    onClick={() => {
                      setLocation("/timesheet");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <CalendarDays className="h-4 w-4 mr-3" />
                    Puantaj
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-accent mb-1"
                    onClick={() => {
                      setLocation("/personnel");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Personel
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-accent mb-1"
                    onClick={() => {
                      setLocation("/projects");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Briefcase className="h-4 w-4 mr-3" />
                    Projeler
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-accent mb-1"
                    onClick={() => {
                      setLocation("/reports");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-3" />
                    Raporlar
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-accent mb-1"
                    onClick={() => {
                      setLocation("/financial");
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Calculator className="h-4 w-4 mr-3" />
                    Finans
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Hesap</p>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-accent mb-1"
                    onClick={() => {
                      setLocation("/account");
                      setIsSidebarOpen(false);
                      // Set active section to profile after navigation
                      setTimeout(() => {
                        const event = new CustomEvent('setAccountSection', { detail: 'profil' });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profil
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground hover:bg-accent dark:hover:bg-dark-accent mb-1"
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
                    className="w-full justify-start text-foreground hover:bg-accent mb-1"
                    onClick={() => {
                      setLocation("/account");
                      setIsSidebarOpen(false);
                      setTimeout(() => {
                        const event = new CustomEvent('setAccountSection', { detail: 'abonelik' });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-3" />
                    Abonelik
                  </Button>

                  {user && (user as any).isAdmin && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-purple-600 dark:text-purple-400 hover:bg-accent mb-1"
                      onClick={() => {
                        setLocation("/admin");
                        setIsSidebarOpen(false);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Admin Panel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Hoş geldiniz! Sistem özetini ve hızlı erişim bağlantılarını buradan görüntüleyebilirsiniz.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
              <Button
                onClick={() => setShowTimesheetForm(!showTimesheetForm)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showTimesheetForm ? 'Formu Kapat' : 'Hızlı Puantaj'}
              </Button>
            </div>

            {/* Quick Timesheet Form */}
            {showTimesheetForm && (
              <div className="mb-8">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Hızlı Puantaj Kaydı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TimesheetForm />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {getBaseNavCards().map((card) => (
                <NavigationCard
                  key={card.id}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  color={card.color}
                  onClick={card.action}
                />
              ))}
            </div>

            {/* Analytics Section */}
            <div className="mb-8">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardCharts />
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ProjectCard
                title="Proje Alpha"
                description="Frontend geliştirme projesi"
                status="progress"
                dueDate={new Date('2024-03-15')}
                progress={75}
                team={['Ahmet', 'Fatma', 'Mehmet']}
              />
              <ProjectCard
                title="Beta Sistemi"
                description="Backend API geliştirme"
                status="review"
                dueDate={new Date('2024-03-20')}
                progress={90}
                team={['Ali', 'Ayşe']}
              />
              <ProjectCard
                title="Gamma Dashboard"
                description="Analytics dashboard"
                status="planning"
                dueDate={new Date('2024-04-01')}
                progress={25}
                team={['Can', 'Zeynep', 'Oğuz', 'Elif']}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
