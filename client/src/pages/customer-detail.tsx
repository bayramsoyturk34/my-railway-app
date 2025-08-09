import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Building2, Phone, Mail, MapPin, CreditCard, Calendar, DollarSign, FileText, Plus, CheckCircle, Clock, Circle, Edit, Trash2, X, Download, FileSpreadsheet, Calculator } from "lucide-react";
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

  // KDV State for quotes
  const [hasVAT, setHasVAT] = useState(false);
  const [vatRate, setVatRate] = useState(20); // %20 KDV
  
  // KDV State for tasks
  const [taskHasVAT, setTaskHasVAT] = useState(false);
  const [taskVatRate, setTaskVatRate] = useState(20);
  
  // Quote terms state
  const [quoteTerms, setQuoteTerms] = useState([
    'Bu teklif 30 gün süreyle geçerlidir.',
    'Fiyatlar KDV dahildir/hariçtir.',
    'Ödeme şartları: %50 peşin, %50 teslimatta.',
    'İş süresi: Anlaşma imzalandıktan sonra 15 iş günü.',
    'Force majeure durumlarında süre uzayabilir.'
  ]);

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

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/customer-tasks/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({ title: "Başarılı", description: "Görev silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Görev silinemedi", variant: "destructive" });
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

    const { subtotal, vatAmount, total } = getQuoteTotals();
    const quoteData = {
      ...data,
      customerId: customer?.id || "",
      totalAmount: subtotal.toString(),
      hasVAT,
      vatRate: vatRate.toString(),
      vatAmount: vatAmount.toString(),
      totalWithVAT: total.toString()
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
    setHasVAT(false);
    setVatRate(20);
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

  const editQuoteItem = (itemId: string) => {
    const item = quoteItems.find(q => q.id === itemId);
    if (item) {
      setCurrentItem({
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit
      });
      removeQuoteItem(itemId);
    }
  };

  const calculateTotalAmount = () => {
    return quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateVATAmount = (baseAmount: number, vatRate: number) => {
    return (baseAmount * vatRate) / 100;
  };

  const calculateTotalWithVAT = (baseAmount: number, vatRate: number) => {
    return baseAmount + calculateVATAmount(baseAmount, vatRate);
  };

  const getQuoteTotals = () => {
    const subtotal = calculateTotalAmount();
    const vatAmount = hasVAT ? calculateVATAmount(subtotal, vatRate) : 0;
    const total = hasVAT ? calculateTotalWithVAT(subtotal, vatRate) : subtotal;
    
    return { subtotal, vatAmount, total };
  };

  const exportToExcel = () => {
    if (quoteItems.length === 0) {
      toast({
        title: "Boş Teklif",
        description: "Export edilecek görev bulunamadı",
        variant: "destructive"
      });
      return;
    }

    const { subtotal, vatAmount, total } = getQuoteTotals();
    
    const data = quoteItems.map((item, index) => ({
      'Sıra': index + 1,
      'Görev Adı': item.title,
      'Açıklama': item.description || '-',
      'Miktar': item.quantity,
      'Birim': item.unit,
      'Birim Fiyat (TL)': item.unitPrice.toFixed(2),
      'Toplam (TL)': item.totalPrice.toFixed(2)
    }));

    // Add total rows
    data.push({
      'Sıra': 0,
      'Görev Adı': 'ARA TOPLAM',
      'Açıklama': '',
      'Miktar': 0,
      'Birim': '',
      'Birim Fiyat (TL)': '',
      'Toplam (TL)': subtotal.toFixed(2)
    });

    if (hasVAT) {
      data.push({
        'Sıra': 0,
        'Görev Adı': `KDV (%${vatRate})`,
        'Açıklama': '',
        'Miktar': 0,
        'Birim': '',
        'Birim Fiyat (TL)': '',
        'Toplam (TL)': vatAmount.toFixed(2)
      });
    }

    data.push({
      'Sıra': 0,
      'Görev Adı': 'GENEL TOPLAM',
      'Açıklama': '',
      'Miktar': 0,
      'Birim': '',
      'Birim Fiyat (TL)': '',
      'Toplam (TL)': total.toFixed(2)
    });

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `teklif_${customer?.name}_${new Date().toLocaleDateString('tr-TR')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Excel Export",
      description: "Teklif Excel formatında indirildi"
    });
  };

  const exportToPDF = async () => {
    if (quoteItems.length === 0) {
      toast({
        title: "Boş Teklif",
        description: "Export edilecek görev bulunamadı",
        variant: "destructive"
      });
      return;
    }

    // Türkçe karakter dönüştürücü
    const convertTurkishChars = (text: string) => {
      const turkishMap: { [key: string]: string } = {
        'ş': 's', 'Ş': 'S', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
        'ç': 'c', 'Ç': 'C', 'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O'
      };
      return text.replace(/[şŞğĞıİçÇüÜöÖ]/g, (char) => turkishMap[char] || char);
    };

    // Dynamic import to reduce bundle size
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(convertTurkishChars('TEKLIF FORMU'), 20, 30);
    
    doc.setFontSize(12);
    const { subtotal, vatAmount, total } = getQuoteTotals();
    
    const today = new Date();
    const validityDate = new Date(today);
    validityDate.setDate(today.getDate() + 30); // 30 gün geçerlilik
    
    doc.text(convertTurkishChars(`Sayin: ${customer?.name || ''}`), 20, 50);
    doc.text(convertTurkishChars(`Teklif Tarihi: ${today.toLocaleDateString('tr-TR')}`), 20, 60);
    doc.text(convertTurkishChars(`Gecerlilik Tarihi: ${validityDate.toLocaleDateString('tr-TR')}`), 20, 70);

    // Table
    const tableData = quoteItems.map((item, index) => [
      index + 1,
      convertTurkishChars(item.title),
      convertTurkishChars(item.description || '-'),
      item.quantity,
      convertTurkishChars(item.unit),
      `${item.unitPrice.toFixed(2)} TL`,
      `${item.totalPrice.toFixed(2)} TL`
    ]);

    const startY = 90;
    const footerData = [];
    
    footerData.push(['', '', '', '', '', 'ARA TOPLAM:', `${subtotal.toFixed(2)} TL`]);
    if (hasVAT) {
      footerData.push(['', '', '', '', '', `KDV (%${vatRate}):`, `${vatAmount.toFixed(2)} TL`]);
    }
    footerData.push(['', '', '', '', '', 'GENEL TOPLAM:', `${total.toFixed(2)} TL`]);

    autoTable(doc, {
      startY,
      head: [[convertTurkishChars('Sira'), convertTurkishChars('Gorev Adi'), convertTurkishChars('Aciklama'), 'Miktar', 'Birim', 'Birim Fiyat', 'Toplam']],
      body: tableData,
      foot: footerData,
      theme: 'striped'
    });

    // Teklif Şartları
    const finalY = (doc as any).lastAutoTable.finalY || startY + 100;
    doc.setFontSize(14);
    doc.text(convertTurkishChars('TEKLIF SARTLARI'), 20, finalY + 20);
    doc.setFontSize(10);
    // Use state terms for PDF
    const terms = quoteTerms.map(term => convertTurkishChars(`• ${term}`));
    
    terms.forEach((term, index) => {
      doc.text(term, 20, finalY + 35 + (index * 8));
    });

    doc.save(convertTurkishChars(`teklif_${customer?.name}_${new Date().toLocaleDateString('tr-TR')}.pdf`));

    toast({
      title: "PDF Export",
      description: "Teklif PDF formatında indirildi"
    });
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-400 hover:text-red-300"
                                onClick={() => {
                                  if (confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
                                    deleteTaskMutation.mutate(task.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Ana Tutar</p>
                            <p className="text-white font-semibold">{formatCurrency(task.amount)}</p>
                            {task.hasVAT && (
                              <p className="text-xs text-gray-400">
                                KDV (%{task.vatRate}): {formatCurrency(task.vatAmount || "0")}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-400">Toplam Tutar</p>
                            <p className="text-green-400 font-bold">
                              {formatCurrency(task.hasVAT && task.totalWithVAT ? task.totalWithVAT : task.amount)}
                            </p>
                            {task.hasVAT && (
                              <p className="text-xs text-blue-400">KDV Dahil</p>
                            )}
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

              {/* KDV Seçenekleri */}
              <div className="border-t border-dark-accent pt-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-400" />
                  KDV Ayarları
                </h4>
                <div className="space-y-3">
                  <FormField
                    control={taskForm.control}
                    name="hasVAT"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="w-4 h-4 text-blue-600 bg-dark-primary border-dark-accent rounded focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormLabel className="text-white text-sm font-medium">
                          KDV Dahil Et
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  {taskForm.watch("hasVAT") && (
                    <FormField
                      control={taskForm.control}
                      name="vatRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">KDV Oranı (%)</FormLabel>
                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange("18")}
                              className={`${
                                field.value === "18" 
                                  ? 'bg-blue-500 border-blue-500 text-white' 
                                  : 'border-dark-accent text-gray-300 hover:border-blue-500'
                              }`}
                            >
                              %18
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange("20")}
                              className={`${
                                field.value === "20" 
                                  ? 'bg-blue-500 border-blue-500 text-white' 
                                  : 'border-dark-accent text-gray-300 hover:border-blue-500'
                              }`}
                            >
                              %20
                            </Button>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="Özel"
                                className="bg-dark-primary border-dark-accent text-white text-sm"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

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
        <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-dark-accent pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <DialogTitle className="text-xl text-white">
                  {editingQuote ? "Teklif Düzenle" : "Yeni Çoklu Görev Teklifi"}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-sm mt-1">
                  Birden fazla görev içeren kapsamlı teklif oluşturun. Her görev için ayrı miktar, birim ve fiyat belirleyebilirsiniz.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Teklif Temel Bilgileri */}
            <div className="bg-dark-primary/50 rounded-lg p-4 border border-dark-accent">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-400" />
                Teklif Bilgileri
              </h3>
              <Form {...quoteForm}>
                <div className="space-y-4">
                  {/* Sayın Alanı */}
                  <div>
                    <label className="text-white text-sm font-medium block mb-2">
                      Sayın
                    </label>
                    <Input 
                      value={customer?.name || ""}
                      disabled
                      className="bg-dark-primary border-dark-accent text-gray-300 h-10"
                    />
                  </div>

                  <FormField
                    control={quoteForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-sm font-medium">
                          Teklif Başlığı *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Örn: Ofis Tadilat Projesi Teklifi"
                            className="bg-dark-primary border-dark-accent text-white h-10"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={quoteForm.control}
                      name="quoteDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-sm font-medium">
                            Teklif Tarihi
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              className="bg-dark-primary border-dark-accent text-white h-10"
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
                          <FormLabel className="text-white text-sm font-medium">
                            Geçerlilik Tarihi
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              className="bg-dark-primary border-dark-accent text-white h-10"
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
                        <FormLabel className="text-white text-sm font-medium">
                          Genel Açıklama
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Teklif hakkında genel bilgiler, şartlar ve notlar"
                            className="bg-dark-primary border-dark-accent text-white"
                            rows={3}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* KDV Seçenekleri */}
                  <div className="border-t border-dark-accent pt-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-400" />
                      KDV Ayarları
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="hasVAT"
                          checked={hasVAT}
                          onChange={(e) => setHasVAT(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-dark-primary border-dark-accent rounded focus:ring-blue-500"
                        />
                        <label htmlFor="hasVAT" className="text-white text-sm font-medium">
                          KDV Dahil Et
                        </label>
                      </div>
                      
                      {hasVAT && (
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setVatRate(18)}
                            className={`p-2 rounded text-sm font-medium border ${
                              vatRate === 18 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'bg-dark-primary border-dark-accent text-gray-300 hover:border-blue-500'
                            }`}
                          >
                            %18 KDV
                          </button>
                          <button
                            type="button"
                            onClick={() => setVatRate(20)}
                            className={`p-2 rounded text-sm font-medium border ${
                              vatRate === 20 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'bg-dark-primary border-dark-accent text-gray-300 hover:border-blue-500'
                            }`}
                          >
                            %20 KDV
                          </button>
                          <div className="flex items-center">
                            <span className="text-gray-300 text-xs mr-2">Özel:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={vatRate}
                              onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                              className="w-full bg-dark-primary border-dark-accent text-white rounded px-2 py-1 text-sm"
                              placeholder="%"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Form>
            </div>

            {/* Görev Ekleme Formu */}
            <div className="bg-dark-primary/50 rounded-lg p-4 border border-dark-accent">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-400" />
                Görev Ekle
                <span className="text-xs text-gray-400 ml-2">
                  (Her görev için ayrı miktar, birim ve fiyat belirleyin)
                </span>
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Görev adı (Örn: Duvar boyası)"
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-dark-primary border-dark-accent text-white h-10"
                  />
                  <Textarea
                    placeholder="Görev detayları (Opsiyonel)"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-dark-primary border-dark-accent text-white"
                    rows={1}
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block font-medium">Miktar</label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="bg-dark-primary border-dark-accent text-white h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block font-medium">Birim</label>
                    <Select 
                      value={currentItem.unit} 
                      onValueChange={(value) => setCurrentItem(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger className="bg-dark-primary border-dark-accent text-white h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-secondary border-dark-accent">
                        <SelectItem value="adet">Adet</SelectItem>
                        <SelectItem value="m2">m²</SelectItem>
                        <SelectItem value="m">m (Metre)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block font-medium">Birim Fiyat (TL)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      className="bg-dark-primary border-dark-accent text-white h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block font-medium">Ara Toplam</label>
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-md h-10 flex items-center px-3 text-orange-400 font-medium">
                      ₺{(currentItem.quantity * currentItem.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={addQuoteItem}
                  className="w-full bg-blue-500 hover:bg-blue-600 h-10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Listiye Ekle
                </Button>
              </div>
            </div>

            {/* Eklenen Görevler Listesi */}
            {quoteItems.length > 0 && (
              <div className="bg-dark-primary/30 rounded-lg p-4 border border-dark-accent">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-400" />
                  Eklenen Görevler ({quoteItems.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
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
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => editQuoteItem(item.id)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
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
                    </div>
                  ))}
                </div>
                
                {/* Toplam Tutar ve Export Butonları */}
                <div className="mt-4 pt-3 border-t border-dark-accent">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-bold">Toplam Teklif Tutarı:</span>
                    <span className="text-2xl font-bold text-orange-400">
                      {formatCurrency(getQuoteTotals().total.toString())}
                    </span>
                  </div>
                  
                  {/* Export Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={exportToExcel}
                      className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10 h-8"
                    >
                      <FileSpreadsheet className="h-3 w-3 mr-2" />
                      Excel
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={exportToPDF}
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10 h-8"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Teklif Şartları - Düzenlenebilir */}
            <div className="bg-dark-primary/50 rounded-lg p-4 border border-dark-accent">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Teklif Şartları
              </h3>
              <div className="space-y-3">
                {quoteTerms.map((term, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <Input
                      value={term}
                      onChange={(e) => {
                        const newTerms = [...quoteTerms];
                        newTerms[index] = e.target.value;
                        setQuoteTerms(newTerms);
                      }}
                      className="bg-dark-primary border-dark-accent text-white text-sm"
                      placeholder="Şart yazın..."
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newTerms = quoteTerms.filter((_, i) => i !== index);
                        setQuoteTerms(newTerms);
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0 mt-1"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setQuoteTerms([...quoteTerms, ''])}
                  className="bg-blue-500 hover:bg-blue-600 h-8"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Yeni Şart Ekle
                </Button>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-3 pt-6 border-t border-dark-accent">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseQuoteForm}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-600/20 h-11"
              >
                İptal
              </Button>
              <Button 
                type="button"
                onClick={quoteForm.handleSubmit(onSubmitQuote)}
                className="flex-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-11 text-white font-medium"
                disabled={createQuoteMutation.isPending || updateQuoteMutation.isPending || quoteItems.length === 0}
              >
                {createQuoteMutation.isPending || updateQuoteMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingQuote ? "Güncelleniyor..." : "Oluşturuluyor..."}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {editingQuote ? "Teklifi Güncelle" : "Teklifi Oluştur"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}