import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Home, FileText, Download, Plus, BarChart, Calendar, DollarSign, RefreshCw } from "lucide-react";
import Header from "@/components/layout/header";
import AdvancedFilters, { type FilterOptions } from "@/components/filters/advanced-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  customerPayments: {
    total: number;
    thisMonth: number;
    count: number;
  };
  customerTasks: {
    total: number;
    pending: number;
    completed: number;
  };
}

interface DashboardData {
  monthlyRevenue: Array<{
    month: string;
    amount: number;
  }>;
}

interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  status: string;
}

interface Timesheet {
  id: string;
  personnelName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "financial" | "timesheet" | "project" | "custom";
  icon: any;
  color: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "financial-summary",
    name: "Finansal Özet Raporu",
    description: "Gelir, gider ve net kar analizi",
    type: "financial",
    icon: DollarSign,
    color: "text-green-400"
  },
  {
    id: "monthly-revenue",
    name: "Aylık Gelir Raporu",
    description: "Aylık gelir dağılımı ve trend analizi",
    type: "financial",
    icon: BarChart,
    color: "text-blue-400"
  },
  {
    id: "timesheet-summary",
    name: "Puantaj Özet Raporu",
    description: "Personel çalışma saatleri ve aktivite raporu",
    type: "timesheet",
    icon: Calendar,
    color: "text-purple-400"
  },
  {
    id: "project-performance",
    name: "Proje Performans Raporu",
    description: "Proje durumu ve karlılık analizi",
    type: "project",
    icon: FileText,
    color: "text-orange-400"
  },
];

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    type: "",
    personnel: "",
  });
  const { toast } = useToast();

  // Fetch data for reports
  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: personnel = [], isLoading: personnelLoading } = useQuery({
    queryKey: ["/api/personnel"],
  });

  const { data: timesheets = [], isLoading: timesheetsLoading } = useQuery<Timesheet[]>({
    queryKey: ["/api/timesheets"],
  });

  const { data: financialSummary, isLoading: financialLoading } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial-summary"],
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const isLoadingData = customersLoading || transactionsLoading || personnelLoading || 
                       timesheetsLoading || financialLoading || dashboardLoading;

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: "Dışa Aktarma",
      description: `${format.toUpperCase()} formatında rapor oluşturuluyor...`,
    });
  };

  // Helper function to normalize Turkish characters for PDF
  const normalizeTurkishText = (text: string): string => {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c',
      'ğ': 'g', 
      'ı': 'i',
      'ö': 'o',
      'ş': 's',
      'ü': 'u',
      'Ç': 'C',
      'Ğ': 'G',
      'İ': 'I',
      'Ö': 'O',
      'Ş': 'S',
      'Ü': 'U'
    };
    
    return text.replace(/[çğıöşüÇĞİÖŞÜ]/g, (match) => turkishMap[match] || match);
  };

  const generateReportPDF = (templateId: string) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Use helvetica for better character support
      doc.setFont("helvetica", "normal");
      
      const currentDate = new Date().toLocaleDateString('tr-TR');
      
      switch (templateId) {
        case "financial-summary":
          doc.setFontSize(16);
          doc.text(normalizeTurkishText("Finansal Ozet Raporu"), 20, 20);
          doc.setFontSize(10);
          doc.text(normalizeTurkishText(`Tarih: ${currentDate}`), 20, 30);
          
          if (financialSummary) {
            const financialData = [
              [normalizeTurkishText('Toplam Gelir'), `TL${financialSummary.totalIncome?.toLocaleString('tr-TR') || 0}`],
              [normalizeTurkishText('Toplam Gider'), `TL${financialSummary.totalExpenses?.toLocaleString('tr-TR') || 0}`],
              [normalizeTurkishText('Net Kar'), `TL${financialSummary.netBalance?.toLocaleString('tr-TR') || 0}`],
              [normalizeTurkishText('Musteri Odemeleri'), `TL${financialSummary.customerPayments?.total?.toLocaleString('tr-TR') || 0}`],
              [normalizeTurkishText('Bekleyen Isler'), `TL${financialSummary.customerTasks?.total?.toLocaleString('tr-TR') || 0}`]
            ];
            
            autoTable(doc, {
              head: [[normalizeTurkishText('Kategori'), normalizeTurkishText('Tutar')]],
              body: financialData,
              startY: 40,
              styles: {
                font: 'helvetica',
                fontSize: 10,
              },
              headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                font: 'helvetica',
                fontSize: 12,
              }
            });
          }
          break;
          
        case "monthly-revenue":
          doc.setFontSize(16);
          doc.text(normalizeTurkishText("Aylik Gelir Raporu"), 20, 20);
          doc.setFontSize(10);
          doc.text(normalizeTurkishText(`Tarih: ${currentDate}`), 20, 30);
          
          if (dashboardData?.monthlyRevenue) {
            const revenueData = dashboardData.monthlyRevenue.map((item: any) => [
              item.month,
              `₺${item.amount?.toLocaleString('tr-TR') || 0}`
            ]);
            
            autoTable(doc, {
              head: [[normalizeTurkishText('Ay'), normalizeTurkishText('Gelir')]],
              body: revenueData.map(row => [normalizeTurkishText(row[0]), row[1]]),
              startY: 40,
              styles: {
                font: 'helvetica',
                fontSize: 10,
              },
              headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                font: 'helvetica',
                fontSize: 12,
              }
            });
          }
          break;
          
        case "timesheet-summary":
          doc.setFontSize(16);
          doc.text(normalizeTurkishText("Puantaj Ozet Raporu"), 20, 20);
          doc.setFontSize(10);
          doc.text(normalizeTurkishText(`Tarih: ${currentDate}`), 20, 30);
          
          if (timesheets.length > 0) {
            const timesheetData = timesheets.map((item: any) => [
              item.personnelName || 'Bilinmeyen',
              item.date || '',
              item.startTime || '',
              item.endTime || '',
              item.notes || ''
            ]);
            
            autoTable(doc, {
              head: [[
                normalizeTurkishText('Personel'), 
                normalizeTurkishText('Tarih'), 
                normalizeTurkishText('Baslangic'), 
                normalizeTurkishText('Bitis'), 
                normalizeTurkishText('Notlar')
              ]],
              body: timesheetData.map(row => row.map(cell => normalizeTurkishText(cell))),
              startY: 40,
              styles: {
                font: 'helvetica',
                fontSize: 8,
              },
              headStyles: {
                fillColor: [142, 68, 173],
                textColor: 255,
                font: 'helvetica',
                fontSize: 10,
              }
            });
          }
          break;
          
        case "project-performance":
          doc.setFontSize(16);
          doc.text(normalizeTurkishText("Proje Performans Raporu"), 20, 20);
          doc.setFontSize(10);
          doc.text(normalizeTurkishText(`Tarih: ${currentDate}`), 20, 30);
          
          if (customers.length > 0) {
            const projectData = customers.map((customer: any) => [
              customer.name,
              customer.company || '-',
              customer.status === 'active' ? 'Aktif' : 'Pasif',
              customer.email || '-'
            ]);
            
            autoTable(doc, {
              head: [[
                normalizeTurkishText('Musteri'), 
                normalizeTurkishText('Sirket'), 
                normalizeTurkishText('Durum'), 
                'E-posta'
              ]],
              body: projectData.map(row => [
                normalizeTurkishText(row[0]),
                normalizeTurkishText(row[1]),
                normalizeTurkishText(row[2]),
                row[3]
              ]),
              startY: 40,
              styles: {
                font: 'helvetica',
                fontSize: 10,
              },
              headStyles: {
                fillColor: [230, 126, 34],
                textColor: 255,
                font: 'helvetica',
                fontSize: 12,
              }
            });
          }
          break;
      }
      
      const template = reportTemplates.find(t => t.id === templateId);
      const fileName = `${template?.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF İndirildi",
        description: "Rapor PDF formatında başarıyla indirildi.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Hata",
        description: "PDF oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const generateReportExcel = (templateId: string) => {
    try {
      let csvContent = '';
      let fileName = '';
      
      switch (templateId) {
        case "financial-summary":
          csvContent = "Kategori,Tutar\n";
          if (financialSummary) {
            csvContent += `Toplam Gelir,${financialSummary.totalIncome || 0}\n`;
            csvContent += `Toplam Gider,${financialSummary.totalExpenses || 0}\n`;
            csvContent += `Net Kar,${financialSummary.netBalance || 0}\n`;
            csvContent += `Müşteri Ödemeleri,${financialSummary.customerPayments?.total || 0}\n`;
            csvContent += `Bekleyen İşler,${financialSummary.customerTasks?.total || 0}\n`;
          }
          fileName = 'finansal_ozet_raporu';
          break;
          
        case "monthly-revenue":
          csvContent = "Ay,Gelir\n";
          if (dashboardData?.monthlyRevenue) {
            dashboardData.monthlyRevenue.forEach((item: any) => {
              csvContent += `${item.month},${item.amount || 0}\n`;
            });
          }
          fileName = 'aylik_gelir_raporu';
          break;
          
        case "timesheet-summary":
          csvContent = "Personel,Tarih,Başlangıç,Bitiş,Notlar\n";
          timesheets.forEach((item: any) => {
            csvContent += `${item.personnelName || 'Bilinmeyen'},${item.date || ''},${item.startTime || ''},${item.endTime || ''},${item.notes || ''}\n`;
          });
          fileName = 'puantaj_ozet_raporu';
          break;
          
        case "project-performance":
          csvContent = "Müşteri,Şirket,Durum,E-posta\n";
          customers.forEach((customer: any) => {
            csvContent += `${customer.name},${customer.company || ''},${customer.status === 'active' ? 'Aktif' : 'Pasif'},${customer.email || ''}\n`;
          });
          fileName = 'proje_performans_raporu';
          break;
      }
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Excel İndirildi",
        description: "Rapor Excel formatında başarıyla indirildi.",
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Hata",
        description: "Excel oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const generateReport = async (templateId: string) => {
    generateReportPDF(templateId);
  };

  const downloadReport = async (templateId: string) => {
    generateReportExcel(templateId);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "financial": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "timesheet": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "project": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "financial": return "Finansal";
      case "timesheet": return "Puantaj";
      case "project": return "Proje";
      default: return "Özel";
    }
  };

  // Filter reports based on search and type
  const filteredReports = reportTemplates.filter(template => {
    const matchesSearch = !filters.search || 
      template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      template.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = !filters.type || template.type === filters.type;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-white"
          >
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Rapor Merkezi</h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <AdvancedFilters
              onFilterChange={handleFilterChange}
              onExport={handleExport}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="ml-4 border-dark-accent text-gray-400 hover:bg-dark-accent"
            onClick={() => window.location.reload()}
            disabled={isLoadingData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoadingData ? "Yükleniyor..." : "Yenile"}
          </Button>
        </div>

        {/* Loading State */}
        {isLoadingData && (
          <Card className="bg-dark-secondary border-dark-accent mb-6">
            <CardContent className="py-8 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <p className="text-gray-400">Rapor verileri yükleniyor...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-6">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Toplam Rapor</p>
                  <p className="text-2xl font-bold text-white">{reportTemplates.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Finansal</p>
                  <p className="text-2xl font-bold text-green-400">
                    {reportTemplates.filter(r => r.type === 'financial').length}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Puantaj</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {reportTemplates.filter(r => r.type === 'timesheet').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Proje</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {reportTemplates.filter(r => r.type === 'project').length}
                  </p>
                </div>
                <BarChart className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Templates Grid */}
        {filteredReports.length === 0 ? (
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">
                {filters.search ? "Arama kriterlerine uygun rapor bulunamadı" : "Rapor şablonu bulunamadı"}
              </p>
              <p className="text-gray-500 text-sm">
                {filters.search ? "Farklı anahtar kelimeler deneyin" : "Yeni rapor şablonu eklenecek"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card key={template.id} className="bg-dark-secondary border-dark-accent hover:border-blue-500/50 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-dark-accent">
                          <IconComponent className={`h-6 w-6 ${template.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                          <Badge className={`mt-1 ${getTypeColor(template.type)}`}>
                            {getTypeName(template.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => generateReport(template.id)}
                      >
                        <BarChart className="h-4 w-4 mr-2" />
                        Rapor Oluştur
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-dark-accent hover:bg-dark-accent text-gray-400"
                        onClick={() => downloadReport(template.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Custom Report Builder */}
        <Card className="bg-dark-secondary border-dark-accent mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-400" />
              Özel Rapor Oluştur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              İhtiyacınıza özel rapor şablonları oluşturun ve kaydedin.
            </p>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                toast({
                  title: "Özel Rapor",
                  description: "Özel rapor oluşturma özelliği yakında eklenecek.",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Şablon Oluştur
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}