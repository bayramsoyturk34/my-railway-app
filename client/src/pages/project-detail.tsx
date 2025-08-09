import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Building, CheckSquare, Banknote, User, Info, Plus, Edit, Trash2 } from "lucide-react";
import ContractorTaskForm from "@/components/forms/contractor-task-form";
import ContractorPaymentForm from "@/components/forms/contractor-payment-form";
import type { Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectDetailPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/projects/:id");
  const projectId = params?.id || "";
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: contractorTasks = [] } = useQuery({
    queryKey: ['/api/contractor-tasks/contractor/' + projectId],
    enabled: !!projectId,
  });

  const { data: contractorPayments = [] } = useQuery({
    queryKey: ['/api/contractor-payments/contractor/' + projectId],
    enabled: !!projectId,
  });

  const project = projects?.find(p => p.id === projectId);

  // Delete contractor task mutation
  const deleteContractorTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest(`/api/contractor-tasks/${taskId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contractor-tasks/contractor/${projectId}`] });
      toast({
        title: "Başarılı",
        description: "Görev silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Görev silinemedi.",
        variant: "destructive",
      });
    },
  });

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
                    <p className="text-gray-500 text-sm">Toplam Tutar</p>
                    <p className="text-green-400 font-medium">
                      {formatCurrency(contractorTasks.reduce((sum: number, task: any) => sum + parseFloat(task.amount), 0).toString())}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Yapılan Ödeme</p>
                    <p className="text-blue-400 font-medium">
                      {formatCurrency(contractorPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0).toString())}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Kalan Bakiye</p>
                    <p className="text-red-400 font-medium">
                      {formatCurrency((contractorTasks.reduce((sum: number, task: any) => sum + parseFloat(task.amount), 0) - contractorPayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0)).toString())}
                    </p>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-blue-400" />
                    <h3 className="text-white font-medium text-lg">Yapılacak İşler</h3>
                  </div>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => setTaskFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Görev Ekle
                  </Button>
                </div>
                
                {contractorTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Henüz iş tanımlanmamış</p>
                    <p className="text-gray-500 text-sm">Bu proje için henüz yapılacak iş listesi oluşturulmamış.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contractorTasks.map((task: any) => (
                      <div key={task.id} className="bg-dark-primary p-4 rounded-lg border border-dark-accent">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-medium">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs border-dark-accent hover:bg-dark-accent text-gray-400 hover:text-white"
                              onClick={() => setEditingTask(task)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                              onClick={() => deleteContractorTaskMutation.mutate(task.id)}
                              disabled={deleteContractorTaskMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <span className={`px-2 py-1 rounded text-xs ${
                              task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {task.status === 'completed' ? 'Tamamlandı' :
                               task.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}
                            </span>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Tutar: {formatCurrency(task.amount)}</span>
                          {task.dueDate && (
                            <span>Teslim: {formatDate(task.dueDate)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ödemeler Tab */}
          <TabsContent value="odemeler" className="mt-6">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-green-400" />
                    <h3 className="text-white font-medium text-lg">Ödeme Geçmişi</h3>
                  </div>
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setPaymentFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ödeme Yap
                  </Button>
                </div>
                
                {contractorPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Henüz ödeme yapılmamış</p>
                    <p className="text-gray-500 text-sm">Bu yükleniciye henüz ödeme yapılmamış.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contractorPayments.map((payment: any) => (
                      <div key={payment.id} className="bg-dark-primary p-4 rounded-lg border border-dark-accent">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-medium">{formatCurrency(payment.amount)}</h4>
                          <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                            {payment.paymentMethod === 'cash' ? 'Nakit' :
                             payment.paymentMethod === 'bank_transfer' ? 'Banka Havalesi' :
                             payment.paymentMethod === 'check' ? 'Çek' : 'Diğer'}
                          </span>
                        </div>
                        {payment.description && (
                          <p className="text-gray-400 text-sm mb-2">{payment.description}</p>
                        )}
                        <div className="text-sm text-gray-500">
                          <span>Ödeme Tarihi: {formatDate(payment.paymentDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Yüklenici Bilgileri Tab */}
          <TabsContent value="bilgiler" className="mt-6">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-purple-400" />
                    <h3 className="text-white font-medium text-lg">Yüklenici Bilgileri</h3>
                  </div>
                  <Button
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={() => {}}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Bilgileri Düzenle
                  </Button>
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
      
      {/* Forms */}
      <ContractorTaskForm
        contractorId={projectId}
        open={taskFormOpen || !!editingTask}
        onOpenChange={(open) => {
          setTaskFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        editingTask={editingTask}
      />
      
      <ContractorPaymentForm
        contractorId={projectId}
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
      />
    </div>
  );
}