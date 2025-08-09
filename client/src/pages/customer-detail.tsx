import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Building2, Phone, Mail, MapPin, CreditCard, Calendar, DollarSign, FileText, Plus, CheckCircle, Clock, Circle, Edit, Trash2, X } from "lucide-react";
import { type Customer, type CustomerTask, type CustomerQuote, type CustomerPayment, insertCustomerTaskSchema, insertCustomerQuoteSchema, insertCustomerPaymentSchema, type InsertCustomerTask, type InsertCustomerQuote, type InsertCustomerPayment } from "@shared/schema";
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
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingTask, setEditingTask] = useState<CustomerTask | null>(null);
  const [editingQuote, setEditingQuote] = useState<CustomerQuote | null>(null);
  
  // Quote items state
  const [quoteItems, setQuoteItems] = useState<Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
  }>>([]);
  const [currentItem, setCurrentItem] = useState({
    title: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    unit: "adet"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: customerTasks = [] } = useQuery<CustomerTask[]>({
    queryKey: ["/api/customer-tasks"],
  });

  const { data: customerQuotes = [] } = useQuery<CustomerQuote[]>({
    queryKey: ["/api/customer-quotes"],
  });

  const { data: customerPayments = [] } = useQuery<CustomerPayment[]>({
    queryKey: ["/api/customer-payments"],
  });

  const customer = customers.find(c => c.name === customerName);
  const tasks = customerTasks.filter(task => task.customerId === customer?.id);
  const quotes = customerQuotes.filter(quote => quote.customerId === customer?.id);
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
  const totalQuoteValue = quotes.reduce((sum, quote) => sum + parseFloat(quote.totalAmount || '0'), 0);
  const approvedQuoteValue = quotes.filter(q => q.isApproved).reduce((sum, quote) => sum + parseFloat(quote.totalAmount || '0'), 0);
  const pendingQuoteValue = quotes.filter(q => !q.isApproved).reduce((sum, quote) => sum + parseFloat(quote.totalAmount || '0'), 0);
  const totalPaidAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const remainingAmount = totalTaskValue - totalPaidAmount;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const approvedQuotes = quotes.filter(q => q.isApproved).length;
  const pendingQuotes = quotes.filter(q => !q.isApproved).length;

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

  const quoteForm = useForm<InsertCustomerQuote>({
    resolver: zodResolver(insertCustomerQuoteSchema),
    defaultValues: {
      customerId: customer?.id || "",
      title: "",
      description: "",
      totalAmount: "0",
      status: "pending",
      isApproved: false,
      quoteDate: new Date(),
      validUntil: undefined,
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
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({ title: "Başarılı", description: "Görev başarıyla eklendi" });
      setShowTaskForm(false);
      taskForm.reset();
      setEditingTask(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Görev eklenirken bir hata oluştu", variant: "destructive" });
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: (data: InsertCustomerQuote) => apiRequest("/api/customer-quotes", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({ title: "Başarılı", description: "Teklif başarıyla eklendi" });
      setShowQuoteForm(false);
      quoteForm.reset();
      setEditingQuote(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Teklif eklenirken bir hata oluştu", variant: "destructive" });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCustomerQuote> }) => 
      apiRequest(`/api/customer-quotes/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer-tasks"] }); // In case approved quote creates task
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({ title: "Başarılı", description: "Teklif başarıyla güncellendi" });
      setEditingQuote(null);
    },
    onError: () => {
      toast({ title: "Hata", description: "Teklif güncellenirken bir hata oluştu", variant: "destructive" });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/customer-quotes/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({ title: "Başarılı", description: "Teklif silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Teklif silinemedi", variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCustomerTask> }) => 
      apiRequest(`/api/customer-tasks/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
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

  const onSubmitQuote = (data: InsertCustomerQuote) => {
    if (quoteItems.length === 0) {
      toast({
        title: "Eksik Bilgi",
        description: "Teklif için en az bir görev eklemelisiniz",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = calculateTotalAmount();
    const quoteData = {
      ...data,
      customerId: customer?.id || "",
      totalAmount: totalAmount.toString()
    };

    if (editingQuote) {
      updateQuoteMutation.mutate({ id: editingQuote.id, data: quoteData });
    } else {
      createQuoteMutation.mutate(quoteData);
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

  const handleCloseQuoteForm = () => {
    setShowQuoteForm(false);
    setEditingQuote(null);
    setQuoteItems([]);
    setCurrentItem({ title: "", description: "", quantity: 1, unitPrice: 0, unit: "adet" });
    quoteForm.reset();
  };

  // Quote item handlers
  const addQuoteItem = () => {
    if (!currentItem.title.trim() || currentItem.unitPrice <= 0) {
      toast({
        title: "Eksik Bilgi",
        description: "Görev adı ve birim fiyat gerekli",
        variant: "destructive"
      });
      return;
    }

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: currentItem.title.trim(),
      description: currentItem.description.trim(),
      quantity: currentItem.quantity,
      unitPrice: currentItem.unitPrice,
      totalPrice: currentItem.quantity * currentItem.unitPrice,
      unit: currentItem.unit
    };

    setQuoteItems(prev => [...prev, newItem]);
    setCurrentItem({ title: "", description: "", quantity: 1, unitPrice: 0, unit: "adet" });
  };

  const removeQuoteItem = (itemId: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotalAmount = () => {
    return quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleQuoteApprove = (quoteId: string) => {
    updateQuoteMutation.mutate({ 
      id: quoteId, 
      data: { status: "approved", isApproved: true } 
    });
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

  if (editingQuote && showQuoteForm) {
    quoteForm.setValue("title", editingQuote.title);
    quoteForm.setValue("description", editingQuote.description || "");
    quoteForm.setValue("totalAmount", editingQuote.totalAmount);
    quoteForm.setValue("status", editingQuote.status);
    quoteForm.setValue("isApproved", editingQuote.isApproved || false);
    quoteForm.setValue("quoteDate", new Date(editingQuote.quoteDate));
    quoteForm.setValue("validUntil", editingQuote.validUntil ? new Date(editingQuote.validUntil) : undefined);
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                <FileText className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-gray-400 text-sm">Teklifler</p>
                  <p className="text-white font-semibold text-lg">{formatCurrency(totalQuoteValue.toString())}</p>
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
            <TabsTrigger value="quotes" className="text-white data-[state=active]:bg-dark-accent">
              Teklifler
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

          <TabsContent value="quotes" className="mt-4">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Teklifler</CardTitle>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => setShowQuoteForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Teklif
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Bu müşteri için henüz teklif hazırlanmamış</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="border border-dark-accent rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-lg mb-1">{quote.title}</h4>
                            <div className="flex items-center gap-4 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                quote.isApproved 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {quote.isApproved ? 'Onaylandı' : 'Bekliyor'}
                              </span>
                              <span className="text-2xl font-bold text-orange-400">
                                {formatCurrency(quote.totalAmount)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs border-dark-accent hover:bg-dark-accent text-gray-400 hover:text-white"
                              onClick={() => {
                                setEditingQuote(quote);
                                setShowQuoteForm(true);
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Düzenle
                            </Button>
                            {!quote.isApproved && (
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs bg-green-500 hover:bg-green-600"
                                onClick={() => handleQuoteApprove(quote.id)}
                                disabled={updateQuoteMutation.isPending}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Onayla
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                              onClick={() => deleteQuoteMutation.mutate(quote.id)}
                              disabled={deleteQuoteMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Teklif Tarihi</p>
                            <p className="text-white">{formatDate(quote.quoteDate)}</p>
                          </div>
                          {quote.validUntil && (
                            <div>
                              <p className="text-gray-400">Geçerlilik Tarihi</p>
                              <p className="text-white">{formatDate(quote.validUntil)}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-400">Durum</p>
                            <p className="text-white">{quote.status}</p>
                          </div>
                        </div>
                        
                        {quote.description && (
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm">Açıklama</p>
                            <p className="text-gray-300 text-sm">{quote.description}</p>
                          </div>
                        )}
                        
                        {quote.isApproved && (
                          <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded">
                            <p className="text-green-400 text-sm">✓ Bu teklif onaylandı ve Yapılacak İşler sekmesine eklendi</p>
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

      {/* Quote Form Dialog */}
      <Dialog open={showQuoteForm} onOpenChange={handleCloseQuoteForm}>
        <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingQuote ? "Teklif Düzenle" : "Yeni Çoklu Görev Teklifi"}</DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              Birden fazla görev içeren teklif oluşturun
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Teklif Temel Bilgileri */}
            <Form {...quoteForm}>
              <div className="space-y-3">
                <FormField
                  control={quoteForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-sm">Teklif Başlığı</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Teklif başlığı"
                          className="bg-dark-primary border-dark-accent text-white h-9"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={quoteForm.control}
                    name="quoteDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm">Teklif Tarihi</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            className="bg-dark-primary border-dark-accent text-white h-9"
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={quoteForm.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm">Geçerlilik</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            className="bg-dark-primary border-dark-accent text-white h-9"
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={quoteForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-sm">Teklif Açıklaması</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Genel teklif açıklaması"
                          className="bg-dark-primary border-dark-accent text-white"
                          rows={2}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>

            {/* Görev Ekleme Formu */}
            <div className="border-t border-dark-accent pt-4">
              <h4 className="text-white font-medium mb-3">Görev Ekle</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Görev adı"
                  value={currentItem.title}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-dark-primary border-dark-accent text-white h-9"
                />
                <Textarea
                  placeholder="Görev açıklaması (opsiyonel)"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-dark-primary border-dark-accent text-white"
                  rows={2}
                />
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Miktar</label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="bg-dark-primary border-dark-accent text-white h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Birim</label>
                    <Select 
                      value={currentItem.unit} 
                      onValueChange={(value) => setCurrentItem(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger className="bg-dark-primary border-dark-accent text-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-secondary border-dark-accent">
                        <SelectItem value="adet">Adet</SelectItem>
                        <SelectItem value="m2">m²</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Birim Fiyat (TL)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      className="bg-dark-primary border-dark-accent text-white h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Toplam</label>
                    <Input
                      value={(currentItem.quantity * currentItem.unitPrice).toFixed(2)}
                      disabled
                      className="bg-dark-primary border-dark-accent text-gray-300 h-9"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addQuoteItem}
                  className="w-full bg-blue-500 hover:bg-blue-600 h-9"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Görevi Ekle
                </Button>
              </div>
            </div>

            {/* Eklenen Görevler Listesi */}
            {quoteItems.length > 0 && (
              <div className="border-t border-dark-accent pt-4">
                <h4 className="text-white font-medium mb-3">Eklenen Görevler ({quoteItems.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {quoteItems.map((item) => (
                    <div key={item.id} className="bg-dark-primary rounded-lg p-3 border border-dark-accent">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="text-white font-medium text-sm">{item.title}</h5>
                          {item.description && (
                            <p className="text-gray-400 text-xs mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
                            <span>{item.quantity} {item.unit}</span>
                            <span>{formatCurrency(item.unitPrice.toString())} / {item.unit}</span>
                            <span className="text-orange-400 font-medium">{formatCurrency(item.totalPrice.toString())}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeQuoteItem(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Toplam Tutar */}
                <div className="mt-4 pt-3 border-t border-dark-accent">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Toplam Teklif Tutarı:</span>
                    <span className="text-2xl font-bold text-orange-400">
                      {formatCurrency(calculateTotalAmount().toString())}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Buttons */}
            <div className="flex gap-3 pt-4 border-t border-dark-accent">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseQuoteForm}
                className="flex-1 border-dark-accent text-gray-300 hover:bg-dark-accent h-9"
              >
                İptal
              </Button>
              <Button 
                type="button"
                onClick={quoteForm.handleSubmit(onSubmitQuote)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 h-9"
                disabled={createQuoteMutation.isPending || updateQuoteMutation.isPending || quoteItems.length === 0}
              >
                {editingQuote ? "Teklifi Güncelle" : "Teklifi Oluştur"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}