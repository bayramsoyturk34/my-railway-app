import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Building2, Phone, Mail, MapPin, CreditCard, Calendar, DollarSign, FileText, Plus, CheckCircle, Clock, Circle, Edit, Trash2 } from "lucide-react";
import { type Customer, type CustomerTask, type CustomerPayment, insertCustomerTaskSchema, insertCustomerPaymentSchema, type InsertCustomerTask, type InsertCustomerPayment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CustomerDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/customers/:customerName");
  const customerName = params?.customerName ? decodeURIComponent(params.customerName) : "";
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingTask, setEditingTask] = useState<CustomerTask | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: customerTasks = [] } = useQuery<CustomerTask[]>({
    queryKey: ["/api/customer-tasks"],
  });

  const { data: customerPayments = [] } = useQuery<CustomerPayment[]>({
    queryKey: ["/api/customer-payments"],
  });

  const customer = customers.find(c => c.name === customerName);
  const tasks = customerTasks.filter(task => task.customerId === customer?.id);
  const payments = customerPayments.filter(payment => payment.customerId === customer?.id);

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

  const totalTaskValue = tasks.reduce((sum, task) => sum + parseFloat(task.amount), 0);
  const totalPaidAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const remainingAmount = totalTaskValue - totalPaidAmount;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;

  // Form configurations
  const taskForm = useForm<InsertCustomerTask>({
    resolver: zodResolver(insertCustomerTaskSchema),
    defaultValues: {
      customerId: customer?.id || "",
      title: "",
      description: "",
      amount: "0",
      status: "pending",
      dueDate: undefined,
    },
  });

  const paymentForm = useForm<InsertCustomerPayment>({
    resolver: zodResolver(insertCustomerPaymentSchema),
    defaultValues: {
      customerId: customer?.id || "",
      amount: "0",
      description: "",
      paymentDate: new Date(),
      paymentMethod: "cash",
    },
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: InsertCustomerTask) => apiRequest("/api/customer-tasks", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-tasks"] });
      toast({ title: "Başarılı", description: "Görev başarıyla eklendi" });
      setShowTaskForm(false);
      taskForm.reset();
      setEditingTask(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Görev eklenirken bir hata oluştu", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCustomerTask> }) => 
      apiRequest(`/api/customer-tasks/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-tasks"] });
      toast({ title: "Başarılı", description: "Görev başarıyla güncellendi" });
      setShowTaskForm(false);
      taskForm.reset();
      setEditingTask(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Görev güncellenirken bir hata oluştu", variant: "destructive" });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: InsertCustomerPayment) => apiRequest("/api/customer-payments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-payments"] });
      toast({ title: "Başarılı", description: "Ödeme başarıyla kaydedildi" });
      setShowPaymentForm(false);
      paymentForm.reset();
    },
    onError: () => {
      toast({ title: "Hata", description: "Ödeme kaydedilirken bir hata oluştu", variant: "destructive" });
    },
  });

  // Form handlers
  const onSubmitTask = (data: InsertCustomerTask) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    } else {
      createTaskMutation.mutate({ ...data, customerId: customer?.id || "" });
    }
  };

  const onSubmitPayment = (data: InsertCustomerPayment) => {
    createPaymentMutation.mutate({ ...data, customerId: customer?.id || "" });
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    taskForm.reset();
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    paymentForm.reset();
  };

  // Update form when editing
  if (editingTask && showTaskForm) {
    taskForm.setValue("title", editingTask.title);
    taskForm.setValue("description", editingTask.description || "");
    taskForm.setValue("amount", editingTask.amount);
    taskForm.setValue("status", editingTask.status);
    taskForm.setValue("dueDate", editingTask.dueDate ? new Date(editingTask.dueDate) : undefined);
  }

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

        {/* Müşteri Mali Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Toplam Görev</p>
                  <p className="text-white font-semibold text-lg">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Toplam Tutar</p>
                  <p className="text-white font-semibold text-lg">{formatCurrency(totalTaskValue.toString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Ödenen</p>
                  <p className="text-white font-semibold text-lg">{formatCurrency(totalPaidAmount.toString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-gray-400 text-sm">Kalan</p>
                  <p className="text-white font-semibold text-lg">{formatCurrency(remainingAmount.toString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="bg-dark-secondary border-dark-accent">
            <TabsTrigger value="tasks" className="text-white data-[state=active]:bg-dark-accent">
              Yapılacak İşler
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-white data-[state=active]:bg-dark-accent">
              Ödemeler
            </TabsTrigger>
            <TabsTrigger value="info" className="text-white data-[state=active]:bg-dark-accent">
              Müşteri Bilgileri
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Yapılacak İşler</CardTitle>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => setShowTaskForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Görev
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Bu müşteri için henüz görev eklenmemiş</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="border border-dark-accent rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-medium">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm px-2 py-1 rounded flex items-center gap-1 ${
                              task.status === "completed" ? "text-green-400 bg-green-400/10" :
                              task.status === "in_progress" ? "text-yellow-400 bg-yellow-400/10" :
                              "text-gray-400 bg-gray-400/10"
                            }`}>
                              {task.status === "completed" ? <CheckCircle className="h-3 w-3" /> :
                               task.status === "in_progress" ? <Clock className="h-3 w-3" /> :
                               <Circle className="h-3 w-3" />}
                              {task.status === "completed" ? "Tamamlandı" :
                               task.status === "in_progress" ? "Devam Ediyor" : "Beklemede"}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-blue-400 hover:text-blue-300"
                                onClick={() => {
                                  setEditingTask(task);
                                  setShowTaskForm(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Tutar</p>
                            <p className="text-white font-semibold">{formatCurrency(task.amount)}</p>
                          </div>
                          {task.dueDate && (
                            <div>
                              <p className="text-gray-400">Teslim Tarihi</p>
                              <p className="text-white">{formatDate(task.dueDate)}</p>
                            </div>
                          )}
                        </div>
                        
                        {task.description && (
                          <div className="mt-2">
                            <p className="text-gray-400 text-sm">Açıklama</p>
                            <p className="text-gray-300 text-sm">{task.description}</p>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Ödemeler</CardTitle>
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => setShowPaymentForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ödeme Kaydet
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Bu müşteriden henüz ödeme alınmamış</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border border-dark-accent rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Tutar</p>
                                <p className="text-green-400 font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Tarih</p>
                                <p className="text-white">{formatDate(payment.paymentDate)}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Yöntem</p>
                                <p className="text-white">{payment.paymentMethod || "Belirtilmemiş"}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-gray-400 text-sm">Açıklama</p>
                              <p className="text-gray-300 text-sm">{payment.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Task Form Modal */}
      <Dialog open={showTaskForm} onOpenChange={handleCloseTaskForm}>
        <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingTask ? "Görev Düzenle" : "Yeni Görev"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingTask ? "Mevcut görevi düzenleyin" : "Müşteri için yeni bir görev oluşturun"}
            </DialogDescription>
          </DialogHeader>

          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(onSubmitTask)} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Görev Başlığı *</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Görev başlığını girin"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Açıklama</FormLabel>
                    <FormControl>
                      <Textarea
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Görev açıklaması"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={taskForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Tutar (₺) *</FormLabel>
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
                control={taskForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Durum</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-secondary border-dark-accent">
                        <SelectItem value="pending">Beklemede</SelectItem>
                        <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                        <SelectItem value="completed">Tamamlandı</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={taskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Teslim Tarihi</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-dark-primary border-dark-accent text-white"
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseTaskForm}
                  className="flex-1 border-dark-accent text-gray-300 hover:bg-dark-accent"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {editingTask ? "Güncelle" : "Ekle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Form Modal */}
      <Dialog open={showPaymentForm} onOpenChange={handleClosePaymentForm}>
        <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Ödeme Kaydet</DialogTitle>
            <DialogDescription className="text-gray-400">
              Bu müşteriden alınan ödemeyi kaydedin
            </DialogDescription>
          </DialogHeader>

          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Ödeme Tutarı (₺) *</FormLabel>
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
                control={paymentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Ödeme Açıklaması *</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Ödeme açıklaması"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Ödeme Yöntemi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "cash"}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                          <SelectValue placeholder="Ödeme yöntemi seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-secondary border-dark-accent">
                        <SelectItem value="cash">Nakit</SelectItem>
                        <SelectItem value="bank_transfer">Havale/EFT</SelectItem>
                        <SelectItem value="check">Çek</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Ödeme Tarihi *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-dark-primary border-dark-accent text-white"
                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClosePaymentForm}
                  className="flex-1 border-dark-accent text-gray-300 hover:bg-dark-accent"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createPaymentMutation.isPending}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Ödeme Kaydet
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}