import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Building, CheckSquare, Banknote, User, Info } from "lucide-react";
import type { Project } from "@shared/schema";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectDetailPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/projects/:id");
  const projectId = params?.id || "";

  // Queries
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const project = projects?.find(p => p.id === projectId);

  // Helper functions
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400";
      case "passive": return "text-yellow-400";
      case "completed": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Aktif";
      case "passive": return "Pasif";
      case "completed": return "Tamamlandı";
      default: return status;
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-dark-primary text-white">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-dark-accent"
              onClick={() => setLocation("/projects")}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Yüklenici Bulunamadı</h1>
          </div>
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="py-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Bu yüklenici bulunamadı.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-dark-accent"
            onClick={() => setLocation("/projects")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>

        {/* Project Info Card */}
        <Card className="bg-dark-secondary border-dark-accent mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-white font-semibold text-xl mb-1">{project.name}</h2>
                <p className="text-gray-400 mb-2">{project.description || "Yüklenici Firma"}</p>
                <p className="text-gray-400 text-sm mb-4">
                  Başlangıç: {formatDate(typeof project.startDate === 'string' ? project.startDate : project.startDate.toISOString())}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Durum</p>
                    <p className={`font-medium ${getStatusColor(project.status)}`}>{getStatusText(project.status)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Proje Türü</p>
                    <p className="text-blue-400 font-medium">Verilen Proje</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Toplam Tutar</p>
                    <p className="text-green-400 font-medium">{formatCurrency(project.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Başlangıç Tarihi</p>
                    <p className="text-gray-400 font-medium">{formatDate(typeof project.startDate === 'string' ? project.startDate : project.startDate.toISOString())}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="yapilacaklar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-dark-secondary border-dark-accent">
            <TabsTrigger 
              value="yapilacaklar"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Yapılacak İşler
            </TabsTrigger>
            <TabsTrigger 
              value="odemeler"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-400"
            >
              <Banknote className="h-4 w-4 mr-2" />
              Ödemeler
            </TabsTrigger>
            <TabsTrigger 
              value="bilgiler"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-400"
            >
              <Info className="h-4 w-4 mr-2" />
              Yüklenici Bilgileri
            </TabsTrigger>
          </TabsList>

          {/* Yapılacak İşler Tab */}
          <TabsContent value="yapilacaklar" className="mt-6">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckSquare className="h-5 w-5 text-blue-400" />
                  <h3 className="text-white font-medium text-lg">Yapılacak İşler</h3>
                </div>
                
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Henüz iş tanımlanmamış</p>
                  <p className="text-gray-500 text-sm">Bu proje için henüz yapılacak iş listesi oluşturulmamış.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ödemeler Tab */}
          <TabsContent value="odemeler" className="mt-6">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Banknote className="h-5 w-5 text-green-400" />
                  <h3 className="text-white font-medium text-lg">Ödeme Geçmişi</h3>
                </div>
                
                <div className="text-center py-8">
                  <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Henüz ödeme yapılmamış</p>
                  <p className="text-gray-500 text-sm">Bu proje için henüz ödeme kaydı bulunmuyor.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Yüklenici Bilgileri Tab */}
          <TabsContent value="bilgiler" className="mt-6">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-purple-400" />
                  <h3 className="text-white font-medium text-lg">Yüklenici Bilgileri</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-primary border border-dark-accent rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Yüklenici Adı</p>
                      <p className="text-white font-medium">{project.name}</p>
                    </div>
                    
                    <div className="p-4 bg-dark-primary border border-dark-accent rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Firma</p>
                      <p className="text-white font-medium">{project.description || "Belirtilmemiş"}</p>
                    </div>
                    
                    <div className="p-4 bg-dark-primary border border-dark-accent rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">Telefon</p>
                      <p className="text-white font-medium">Belirtilmemiş</p>
                    </div>
                    
                    <div className="p-4 bg-dark-primary border border-dark-accent rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">E-posta</p>
                      <p className="text-white font-medium">Belirtilmemiş</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-dark-primary border border-dark-accent rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Proje Detayları</p>
                    <p className="text-white">
                      Bu yüklenici {formatDate(typeof project.startDate === 'string' ? project.startDate : project.startDate.toISOString())} tarihinde işe başlamıştır. 
                      Proje durumu: {getStatusText(project.status).toLowerCase()}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}