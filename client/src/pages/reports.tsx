import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, FileText, Download, Plus, BarChart, Calendar, DollarSign } from "lucide-react";
import Header from "@/components/layout/header";
import AdvancedFilters, { type FilterOptions } from "@/components/filters/advanced-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: "Dışa Aktarma",
      description: `${format.toUpperCase()} formatında rapor oluşturuluyor...`,
    });
  };

  const generateReport = async (templateId: string) => {
    toast({
      title: "Rapor Oluşturuluyor",
      description: "Rapor hazırlanıyor, lütfen bekleyiniz...",
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rapor Hazır",
        description: "Rapor başarıyla oluşturuldu ve indirilebilir.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rapor oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    }
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
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Rapor Merkezi</h1>
        </div>

        <AdvancedFilters
          onFilterChange={handleFilterChange}
          onExport={handleExport}
        />

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
                        onClick={() => generateReport(template.id)}
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