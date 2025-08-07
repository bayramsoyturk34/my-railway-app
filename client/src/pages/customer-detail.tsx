import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Building2, Phone, Mail, MapPin, CreditCard, Calendar, DollarSign, FileText, Plus } from "lucide-react";
import { type Customer, type Project } from "@shared/schema";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomerDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/customers/:customerName");
  const customerName = params?.customerName ? decodeURIComponent(params.customerName) : "";

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const customer = customers.find(c => c.name === customerName);
  const customerProjects = projects.filter(p => p.clientName === customerName);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
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

  const totalProjectValue = customerProjects.reduce((sum, project) => sum + parseFloat(project.amount), 0);
  const activeProjects = customerProjects.filter(p => p.status === "active").length;
  const completedProjects = customerProjects.filter(p => p.status === "completed").length;

  if (!customer) {
    return (
      <div className="min-h-screen bg-dark-primary text-white">
        <Header />
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-4">Müşteri bulunamadı</p>
              <Button 
                onClick={() => setLocation("/customers")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Müşteri Listesine Dön
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-dark-accent"
            onClick={() => setLocation("/customers")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              {customer.company && (
                <p className="text-gray-400">{customer.company}</p>
              )}
            </div>
          </div>
        </div>

        {/* Müşteri Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Toplam Proje</p>
                  <p className="text-white font-semibold text-lg">{customerProjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Aktif Proje</p>
                  <p className="text-white font-semibold text-lg">{activeProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Tamamlanan</p>
                  <p className="text-white font-semibold text-lg">{completedProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Toplam Değer</p>
                  <p className="text-white font-semibold text-lg">{formatCurrency(totalProjectValue.toString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="bg-dark-secondary border-dark-accent">
            <TabsTrigger value="projects" className="text-white data-[state=active]:bg-dark-accent">
              Yapılacak İşler
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-white data-[state=active]:bg-dark-accent">
              Ödeme Al
            </TabsTrigger>
            <TabsTrigger value="info" className="text-white data-[state=active]:bg-dark-accent">
              Müşteri Bilgileri
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-4">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Yapılacak İşler</CardTitle>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => setLocation("/projects")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Proje
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {customerProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Bu müşteri için henüz proje eklenmemiş</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerProjects.map((project) => (
                      <div key={project.id} className="border border-dark-accent rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-medium">{project.name}</h4>
                          <span className={`text-sm px-2 py-1 rounded ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Tutar</p>
                            <p className="text-white">{formatCurrency(project.amount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Başlangıç</p>
                            <p className="text-white">{formatDate(project.startDate)}</p>
                          </div>
                        </div>
                        
                        {project.description && (
                          <div className="mt-2">
                            <p className="text-gray-400 text-sm">Açıklama</p>
                            <p className="text-gray-300 text-sm">{project.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white">Ödeme Alma Sistemi</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Ödeme alma sistemi yakında aktif olacak</p>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">Toplam Proje Değeri: {formatCurrency(totalProjectValue.toString())}</p>
                    <p className="text-gray-300 text-sm">Aktif Projeler: {activeProjects} adet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white">Müşteri Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Ad</p>
                      <p className="text-white">{customer.name}</p>
                    </div>
                    
                    {customer.company && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Şirket</p>
                        <p className="text-white">{customer.company}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.phone && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Telefon</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="text-white">{customer.phone}</p>
                        </div>
                      </div>
                    )}

                    {customer.email && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">E-posta</p>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-white">{customer.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {customer.address && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Adres</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <p className="text-white">{customer.address}</p>
                      </div>
                    </div>
                  )}

                  {customer.taxNumber && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Vergi Numarası</p>
                      <p className="text-white">{customer.taxNumber}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Kayıt Tarihi</p>
                    <p className="text-white">{customer.createdAt ? formatDate(customer.createdAt) : 'Bilinmiyor'}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Durum</p>
                    <span className={`px-2 py-1 rounded text-sm ${
                      customer.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                    }`}>
                      {customer.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
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