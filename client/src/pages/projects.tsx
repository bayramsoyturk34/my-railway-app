import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Building, Trash2, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject, type Project, type Customer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProjectsPage() {
  const [, setLocation] = useLocation();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      type: "received",
      amount: "0",
      status: "active",
      description: "",
      clientName: "",
      startDate: new Date(),
      endDate: undefined,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("/api/projects", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({
        title: "Başarılı",
        description: "Proje kaydı oluşturuldu.",
      });
      form.reset();
      setShowProjectForm(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Proje kaydı oluşturulamadı.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProject> }) => {
      const response = await apiRequest(`/api/projects/${id}`, "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({
        title: "Başarılı",
        description: "Proje kaydı güncellendi.",
      });
      form.reset();
      setShowProjectForm(false);
      setEditingProject(null);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Proje kaydı güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/projects/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({
        title: "Başarılı",
        description: "Proje kaydı silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Proje kaydı silinemedi.",
        variant: "destructive",
      });
    },
  });

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

  const getTypeText = (type: string) => {
    return type === "given" ? "Verilen" : "Alınan";
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    form.reset({
      name: project.name,
      type: project.type,
      amount: project.amount,
      status: project.status,
      description: project.description || "",
      clientName: project.clientName || "",
      startDate: new Date(project.startDate),
      endDate: project.endDate ? new Date(project.endDate) : undefined,
    });
    setShowProjectForm(true);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    form.reset();
  };

  const onSubmit = (data: InsertProject) => {
    console.log("Submitting project data:", data);
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary text-white">
        <Header />
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">Yükleniyor...</p>
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
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Verilen Projeler</h1>
        </div>

        <div className="mb-6">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setShowProjectForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Verilen Proje
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="py-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Henüz yüklenici eklenmemiş</p>
              <p className="text-gray-500 text-sm">Yeni yüklenici eklemek için yukarıdaki butonu kullanın.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-dark-secondary border-dark-accent hover:bg-dark-accent transition-colors cursor-pointer group"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-lg truncate">{project.name}</h4>
                      <p className="text-gray-400 text-sm truncate">{project.description || "Yüklenici Firma"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Başlangıç:</span>
                      <span className="text-white">{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Durum:</span>
                      <span className={getStatusColor(project.status)}>{getStatusText(project.status)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-400 hover:text-blue-300 hover:bg-dark-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-dark-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProjectMutation.mutate(project.id);
                      }}
                      disabled={deleteProjectMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Project Form Dialog */}
      <Dialog open={showProjectForm} onOpenChange={handleCloseForm}>
        <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingProject ? "Yüklenici Düzenle" : "Verilen Proje"}
            </DialogTitle>
            <p className="text-gray-400 text-sm">
              Verilen proje bilgilerini girin
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Yüklenici Adı *</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-dark-primary border-blue-500 text-white focus:border-blue-400 h-12"
                        placeholder="Yüklenici adını girin"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Yüklenici Firma</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-dark-primary border-blue-500 text-white focus:border-blue-400 h-12"
                        placeholder="Yüklenici firma adını girin"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Telefon</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          className="bg-dark-primary border-dark-accent text-white h-12"
                          placeholder="Telefon numarası"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">E-posta</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className="bg-dark-primary border-dark-accent text-white h-12"
                          placeholder="E-posta adresi"
                          value=""
                          onChange={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                  onClick={handleCloseForm}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                >
                  {(createProjectMutation.isPending || updateProjectMutation.isPending) 
                    ? "Kaydediliyor..." 
                    : editingProject 
                      ? "Güncelle" 
                      : "Kaydet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
