import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Building, Trash2, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject, type Project } from "@shared/schema";
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
      const response = await apiRequest("POST", "/api/projects", data);
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
      const response = await apiRequest("PUT", `/api/projects/${id}`, data);
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
      await apiRequest("DELETE", `/api/projects/${id}`);
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
          <h1 className="text-2xl font-bold">Proje Yönetimi</h1>
        </div>

        <div className="mb-6">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setShowProjectForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Proje
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="py-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Henüz proje eklenmemiş</p>
              <p className="text-gray-500 text-sm">Yeni proje eklemek için yukarıdaki butonu kullanın.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Card key={project.id} className="bg-dark-secondary border-dark-accent">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="h-5 w-5 text-blue-400" />
                        <h4 className="text-white font-medium text-lg">{project.name}</h4>
                        <span className={`text-sm px-2 py-1 rounded ${getStatusColor(project.status)} bg-dark-accent`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-400">Tür</p>
                          <p className="text-white font-medium">{getTypeText(project.type)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tutar</p>
                          <p className="text-white font-medium">{formatCurrency(project.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Başlangıç</p>
                          <p className="text-white font-medium">{formatDate(project.startDate)}</p>
                        </div>
                      </div>

                      {project.clientName && (
                        <div className="mb-2">
                          <p className="text-gray-400 text-sm">Müşteri</p>
                          <p className="text-gray-300 text-sm">{project.clientName}</p>
                        </div>
                      )}

                      {project.description && (
                        <div>
                          <p className="text-gray-400 text-sm">Açıklama</p>
                          <p className="text-gray-300 text-sm">{project.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-400 hover:text-blue-300 hover:bg-dark-accent"
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-dark-accent"
                        onClick={() => deleteProjectMutation.mutate(project.id)}
                        disabled={deleteProjectMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
              {editingProject ? "Proje Düzenle" : "Yeni Proje"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Proje Adı</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Proje adını girin"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Tür</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-dark-primary border-dark-accent">
                          <SelectItem value="received" className="text-white">Alınan</SelectItem>
                          <SelectItem value="given" className="text-white">Verilen</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Durum</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-dark-primary border-dark-accent">
                          <SelectItem value="active" className="text-white">Aktif</SelectItem>
                          <SelectItem value="passive" className="text-white">Pasif</SelectItem>
                          <SelectItem value="completed" className="text-white">Tamamlandı</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Tutar</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Müşteri Adı</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Müşteri adını girin"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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
                    <FormLabel className="text-gray-300">Başlangıç Tarihi</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-dark-primary border-dark-accent text-white"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
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
                    <FormLabel className="text-gray-300">Açıklama</FormLabel>
                    <FormControl>
                      <Textarea
                        className="bg-dark-primary border-dark-accent text-white h-20"
                        placeholder="Proje açıklaması"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
