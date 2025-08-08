import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, X, Search, Download } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  exportData?: any[];
  exportTitle?: string;
}

export interface FilterOptions {
  search: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  type: string;
  personnel: string;
}

export default function AdvancedFilters({ onFilterChange, onExport, exportData = [], exportTitle = "Veri" }: FilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    type: "",
    personnel: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      dateFrom: "",
      dateTo: "",
      status: "",
      type: "",
      personnel: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Turkish font support (fallback to Times if Turkish not available)
      doc.setFont("times", "normal");
      
      // Title
      doc.setFontSize(16);
      doc.text(exportTitle + " Raporu", 20, 20);
      
      // Date
      doc.setFontSize(10);
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, 30);
      
      if (exportData.length > 0) {
        // Create table headers
        const headers = Object.keys(exportData[0]).map(key => {
          switch(key) {
            case 'name': return 'İsim';
            case 'company': return 'Şirket';
            case 'phone': return 'Telefon';
            case 'email': return 'E-posta';
            case 'status': return 'Durum';
            case 'amount': return 'Tutar';
            case 'description': return 'Açıklama';
            case 'type': return 'Tür';
            case 'date': return 'Tarih';
            default: return key;
          }
        });
        
        // Create table data
        const data = exportData.map(item => 
          Object.values(item).map(value => 
            value === null || value === undefined ? '-' : String(value)
          )
        );
        
        autoTable(doc, {
          head: [headers],
          body: data,
          startY: 40,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });
      } else {
        doc.text('Veri bulunamadı.', 20, 40);
      }
      
      // Save the PDF
      doc.save(`${exportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  const exportToExcel = () => {
    try {
      if (exportData.length === 0) {
        alert('Dışa aktarılacak veri bulunamadı.');
        return;
      }

      // Create CSV content
      const headers = Object.keys(exportData[0]).map(key => {
        switch(key) {
          case 'name': return 'İsim';
          case 'company': return 'Şirket';
          case 'phone': return 'Telefon';
          case 'email': return 'E-posta';
          case 'status': return 'Durum';
          case 'amount': return 'Tutar';
          case 'description': return 'Açıklama';
          case 'type': return 'Tür';
          case 'date': return 'Tarih';
          default: return key;
        }
      });
      
      const csvContent = [
        headers.join(','),
        ...exportData.map(item => 
          Object.values(item).map(value => {
            const str = value === null || value === undefined ? '' : String(value);
            return str.includes(',') ? `"${str}"` : str;
          }).join(',')
        )
      ].join('\n');
      
      // Create and download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Excel export error:', error);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'pdf') {
      exportToPDF();
    } else if (format === 'csv') {
      exportToExcel();
    }
    
    // Also call the original onExport if provided
    if (onExport) {
      onExport(format);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Ara..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 bg-dark-primary border-dark-accent text-white"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-dark-accent hover:bg-dark-accent text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtreler
          </Button>
          
          <Select onValueChange={(format: 'csv' | 'pdf') => handleExport(format)}>
            <SelectTrigger className="w-32 bg-dark-primary border-dark-accent text-white">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Dışa Aktar" />
            </SelectTrigger>
            <SelectContent className="bg-dark-primary border-dark-accent">
              <SelectItem value="csv" className="text-white">Excel</SelectItem>
              <SelectItem value="pdf" className="text-white">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="bg-dark-secondary border-dark-accent">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Gelişmiş Filtreler</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Temizle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date From */}
              <div className="space-y-2">
                <Label className="text-gray-300">Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="bg-dark-primary border-dark-accent text-white"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label className="text-gray-300">Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="bg-dark-primary border-dark-accent text-white"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-gray-300">Durum</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-primary border-dark-accent">
                    <SelectItem value="all" className="text-white">Tümü</SelectItem>
                    <SelectItem value="active" className="text-white">Aktif</SelectItem>
                    <SelectItem value="passive" className="text-white">Pasif</SelectItem>
                    <SelectItem value="completed" className="text-white">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-gray-300">Tür</Label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-primary border-dark-accent">
                    <SelectItem value="all" className="text-white">Tümü</SelectItem>
                    <SelectItem value="income" className="text-white">Gelir</SelectItem>
                    <SelectItem value="expense" className="text-white">Gider</SelectItem>
                    <SelectItem value="received" className="text-white">Alınan</SelectItem>
                    <SelectItem value="given" className="text-white">Verilen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personnel */}
              <div className="space-y-2">
                <Label className="text-gray-300">Personel</Label>
                <Select value={filters.personnel} onValueChange={(value) => handleFilterChange("personnel", value)}>
                  <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                    <SelectValue placeholder="Personel seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-primary border-dark-accent">
                    <SelectItem value="all" className="text-white">Tümü</SelectItem>
                    {/* Personnel options will be populated dynamically */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Apply Filter Button */}
            <div className="flex justify-end pt-4 border-t border-dark-accent">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setShowFilters(false)}
              >
                Uygula
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}