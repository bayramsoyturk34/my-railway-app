import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, User, Edit, Trash2, Building2, Phone, Mail, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { type Customer, type CustomerTask, type CustomerPayment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import AdvancedFilters, { type FilterOptions } from "@/components/filters/advanced-filters";
import CustomerForm from "@/components/forms/customer-form-new";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomersPage() {
  const [, setLocation] = useLocation();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    type: "",
    personnel: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: allCustomerTasks = [] } = useQuery<CustomerTask[]>({
    queryKey: ["/api/customer-tasks"],
  });

  const { data: allCustomerPayments = [] } = useQuery<CustomerPayment[]>({
    queryKey: ["/api/customer-payments"],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/customers/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Başarılı",
        description: "Müşteri kaydı silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Müşteri kaydı silinemedi.",
        variant: "destructive",
      });
    },
  });

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: "Dışa Aktarma",
      description: `${format.toUpperCase()} formatında dışa aktarılıyor...`,
    });
  };

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !filters.search || 
      customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.company?.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || filters.status === "all" || customer.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  // Helper functions
  const getCustomerTasks = (customerId: string) => {
    return allCustomerTasks.filter(task => task.customerId === customerId);
  };

  const getCustomerPayments = (customerId: string) => {
    return allCustomerPayments.filter(payment => payment.customerId === customerId);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-white hover:bg-dark-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Müşteriler</h1>
        </div>

        <div className="mb-6 mt-6">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setShowCustomerForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Müşteri
          </Button>
        </div>

        <AdvancedFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
          onExport={handleExport}
          showExportButtons={false}
          entityType="customer"
        />

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Müşteriler yükleniyor...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Henüz müşteri kaydı bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredCustomers.map((customer) => {
              const customerTasks = getCustomerTasks(customer.id);
              const customerPayments = getCustomerPayments(customer.id);
              
              const totalTaskAmount = customerTasks.reduce((sum, task) => sum + parseFloat(task.amount), 0);
              const totalPaidAmount = customerPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
              const remainingAmount = totalTaskAmount - totalPaidAmount;

              return (
                <Card key={customer.id} className="bg-dark-secondary border-dark-accent">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-5 w-5 text-blue-400" />
                          <button
                            className="text-white font-medium text-lg hover:text-blue-400 underline cursor-pointer"
                            onClick={() => setLocation(`/customers/${encodeURIComponent(customer.name)}`)}
                          >
                            {customer.name}
                          </button>
                          <span className={`text-sm px-2 py-1 rounded ${
                            customer.status === "active" ? "text-green-400 bg-green-400/10" : "text-gray-400 bg-gray-400/10"
                          }`}>
                            {customer.status === "active" ? "Aktif" : "Pasif"}
                          </span>
                        </div>
                      
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          {customer.company && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-gray-400">Şirket</p>
                                <p className="text-white">{customer.company}</p>
                              </div>
                            </div>
                          )}
                          
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-gray-400">Telefon</p>
                                <p className="text-white">{customer.phone}</p>
                              </div>
                            </div>
                          )}
                          
                          {customer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-gray-400">E-posta</p>
                                <p className="text-white">{customer.email}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {customer.address && (
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm">Adres</p>
                            <p className="text-gray-300 text-sm">{customer.address}</p>
                          </div>
                        )}

                        {customer.taxNumber && (
                          <div className="mt-2">
                            <p className="text-gray-400 text-sm">Vergi No</p>
                            <p className="text-gray-300 text-sm">{customer.taxNumber}</p>
                          </div>
                        )}

                        {/* Financial Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-3 bg-dark-primary rounded-lg">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-blue-400" />
                              <p className="text-gray-400 text-sm">Toplam İş</p>
                            </div>
                            <p className="text-blue-400 font-semibold">{formatCurrency(totalTaskAmount)}</p>
                            <p className="text-gray-500 text-xs">{customerTasks.length} adet</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <TrendingDown className="h-4 w-4 text-green-400" />
                              <p className="text-gray-400 text-sm">Ödenen</p>
                            </div>
                            <p className="text-green-400 font-semibold">{formatCurrency(totalPaidAmount)}</p>
                            <p className="text-gray-500 text-xs">{customerPayments.length} ödeme</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <DollarSign className="h-4 w-4 text-orange-400" />
                              <p className="text-gray-400 text-sm">Kalan</p>
                            </div>
                            <p className={`font-semibold ${remainingAmount > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                              {formatCurrency(remainingAmount)}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {remainingAmount > 0 ? 'Alacak' : 'Tamam'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-400 hover:text-blue-300 hover:bg-dark-accent"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-dark-accent"
                          onClick={() => deleteCustomerMutation.mutate(customer.id)}
                          disabled={deleteCustomerMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Form Dialog - NEW */}
      <CustomerForm 
        open={showCustomerForm} 
        onOpenChange={(open) => {
          setShowCustomerForm(open);
          if (!open) setEditingCustomer(null);
        }}
        customer={editingCustomer || undefined}
      />
    </div>
  );
}