import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
  LogOut
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
  const [, setLocation] = useLocation();
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const { user } = useAuth();

  // Navigation cards state for drag and drop
  const [navCards, setNavCards] = useState([
    { id: "timesheet", icon: Edit, label: "Puantaj Yaz", onClick: () => setShowTimesheetForm(true), iconColor: "text-blue-400" },
    { id: "personnel", icon: Users, label: "Personeller", onClick: () => setLocation("/personnel"), iconColor: "text-orange-400" },
    { id: "projects", icon: Home, label: "Verilen Projeler", onClick: () => setLocation("/projects"), iconColor: "text-pink-400" },
    { id: "finances", icon: Wallet, label: "Kasa", onClick: () => setLocation("/finances"), iconColor: "text-teal-400" },
    { id: "customers", icon: UserCog, label: "Müşteriler", onClick: () => setLocation("/customers"), iconColor: "text-orange-400" },
    { id: "company-directory", icon: Building2, label: "Firma Rehberi", onClick: () => setLocation("/company-directory"), iconColor: "text-green-400" },
    { id: "reports", icon: Info, label: "Raporlar", onClick: () => setLocation("/reports"), iconColor: "text-pink-400" }
  ]);

  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial-summary"],
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-dark-primary text-white">
        <Header />
      


      <main className="p-4">
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
        <Card className="bg-dark-secondary border-dark-accent">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Veri Analizi ve Raporlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCharts />
          </CardContent>
        </Card>

        {/* Notes Section */}
        <div className="bg-dark-secondary rounded-xl p-4 border border-dark-accent">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Notlar</h3>
            <Button
              size="icon"
              className="bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded-full"
              onClick={() => console.log("Add note")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center text-gray-400 py-8">
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
