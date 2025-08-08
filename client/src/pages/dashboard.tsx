import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Edit, 
  Users, 
  Building, 
  Home, 
  Wallet, 
  CalendarDays, 
  UserCog,
  Plus,
  Info,
  BarChart3,
  Briefcase,
  Calculator
} from "lucide-react";
import Header from "@/components/layout/header";
import ProjectCard from "@/components/cards/project-card";
import NavigationCard from "@/components/cards/navigation-card";
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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);

  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial-summary"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      {/* Notification Banner */}
      <div className="mx-4 mt-4 p-4 bg-yellow-500 text-black rounded-lg flex items-center gap-3">
        <Info className="text-lg" />
        <div className="flex-1">
          <p className="font-medium">2 Günlük kullanım süreniz kaldı.</p>
          <p className="text-sm opacity-80">Dilediğiniz zaman satın alabilirsiniz.</p>
        </div>
      </div>

      <main className="p-4">
        {/* Customer Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ProjectCard
            title="Müşteri İşleri"
            total={formatCurrency(summary?.customerTasks.total || 0)}
            activeLabel="Bekleyen"
            activeValue={`${summary?.customerTasks.pending || 0} işlem`}
            passiveLabel="Tamamlanan"
            passiveValue={`${summary?.customerTasks.completed || 0} işlem`}
            type="blue"
            icon="briefcase"
          />

          <ProjectCard
            title="Müşteri Ödemeleri"
            total={formatCurrency(summary?.customerPayments.total || 0)}
            activeLabel="Bu Ay"
            activeValue={formatCurrency(summary?.customerPayments.thisMonth || 0)}
            passiveLabel="Toplam Ödeme"
            passiveValue={`${summary?.customerPayments.count || 0} ödeme`}
            type="green"
            icon="wallet"
          />

          <ProjectCard
            title="Kalan Bakiye"
            total={formatCurrency((summary?.customerTasks.total || 0) - (summary?.customerPayments.total || 0))}
            activeLabel="Alacak"
            activeValue={formatCurrency(Math.max(0, (summary?.customerTasks.total || 0) - (summary?.customerPayments.total || 0)))}
            passiveLabel="Net Durum"
            passiveValue={((summary?.customerTasks.total || 0) - (summary?.customerPayments.total || 0)) >= 0 ? "Alacaklı" : "Borçlu"}
            type="purple"
            icon="calculator"
          />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <NavigationCard
            icon={Edit}
            label="Puantaj Yaz"
            onClick={() => setShowTimesheetForm(true)}
            iconColor="text-blue-400"
          />
          
          <NavigationCard
            icon={Users}
            label="Personeller"
            onClick={() => setLocation("/personnel")}
            iconColor="text-orange-400"
          />
          
          <NavigationCard
            icon={Building}
            label="Alınan Projeler"
            onClick={() => setLocation("/projects")}
            iconColor="text-yellow-400"
          />
          
          <NavigationCard
            icon={Home}
            label="Verilen Projeler"
            onClick={() => setLocation("/projects")}
            iconColor="text-pink-400"
          />
          
          <NavigationCard
            icon={Users}
            label="Yükleniciler"
            onClick={() => setLocation("/projects")}
            iconColor="text-green-400"
          />
          
          <NavigationCard
            icon={Wallet}
            label="Kasa"
            onClick={() => setLocation("/finances")}
            iconColor="text-teal-400"
          />
          
          <NavigationCard
            icon={CalendarDays}
            label="Günlük İşlemleri"
            onClick={() => setLocation("/timesheet")}
            iconColor="text-cyan-400"
          />
          
          <NavigationCard
            icon={UserCog}
            label="Müşteriler"
            onClick={() => setLocation("/customers")}
            iconColor="text-orange-400"
          />

          <NavigationCard
            icon={Info}
            label="Raporlar"
            onClick={() => setLocation("/reports")}
            iconColor="text-pink-400"
          />
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
  );
}
