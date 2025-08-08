import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, User, Clock, CreditCard, Banknote, Plus, Calendar, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonnelPaymentForm from "@/components/forms/personnel-payment-form";
import { queryClient } from "@/lib/queryClient";
import type { Personnel, Timesheet, PersonnelPayment, Transaction } from "@shared/schema";

export default function PersonnelDetailPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/personnel/:id");
  const personnelId = params?.id || "";
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PersonnelPayment | undefined>();

  // Queries
  const { data: personnel } = useQuery<Personnel[]>({
    queryKey: ['/api/personnel'],
  });

  const { data: timesheets = [] } = useQuery<Timesheet[]>({
    queryKey: ['/api/timesheets'],
  });

  const { data: payments = [] } = useQuery<PersonnelPayment[]>({
    queryKey: ['/api/personnel-payments'],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const person = personnel?.find(p => p.id === personnelId);
  const personTimesheets = timesheets.filter(ts => ts.personnelId === personnelId);
  const personPayments = payments.filter(p => p.personnelId === personnelId);

  // Calculations
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const formatSalary = (amount: number) => {
    return `₺${amount.toLocaleString('tr-TR')}`;
  };

  const calculateDailyWage = (monthlySalary: string | null) => {
    if (!monthlySalary) return formatSalary(0);
    return formatSalary(Math.round(parseFloat(monthlySalary) / 30));
  };

  const calculateEarnings = () => {
    let earnings = 0;
    
    personTimesheets.forEach(ts => {
      const hours = parseFloat(ts.totalHours || "0");
      const overtimeHours = parseFloat(ts.overtimeHours || "0");
      const dailyWage = person && person.salary ? parseFloat(person.salary) / 30 : 0;
      
      if (ts.workType === "TAM") {
        earnings += dailyWage;
      } else if (ts.workType === "YARIM") {
        earnings += dailyWage / 2;
      } else if (ts.workType === "MESAİ") {
        earnings += dailyWage * overtimeHours;
      }
    });
    
    return earnings;
  };

  const calculatePayments = () => {
    return personPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  };

  const totalEarnings = calculateEarnings();
  const totalPayments = calculatePayments();
  const remainingDebt = totalEarnings - totalPayments;

  if (!person) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-dark-accent"
            onClick={() => setLocation("/personnel")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Personel Bulunamadı</h1>
        </div>
        <Card className="bg-dark-secondary border-dark-accent">
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Bu personel bulunamadı.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-dark-accent"
          onClick={() => setLocation("/personnel")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">{person.name}</h1>
      </div>

      {/* Personnel Info Card */}
      <Card className="bg-dark-secondary border-dark-accent mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-xl mb-1">{person.name}</h2>
              <p className="text-gray-400 mb-2">{person.position}</p>
              <p className="text-gray-400 text-sm mb-4">
                Başlangıç: {formatDate(person.startDate.toISOString())}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Maaş</p>
                  <p className="text-white font-medium">{person.salary ? formatSalary(parseFloat(person.salary)) : "₺0"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Yevmiye</p>
                  <p className="text-blue-400 font-medium">{calculateDailyWage(person.salary)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Toplam Hakediş</p>
                  <p className="text-green-400 font-medium">{formatSalary(totalEarnings)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Kalan Borç</p>
                  <p className={`font-medium ${remainingDebt > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {formatSalary(remainingDebt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="puantaj" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-dark-secondary border-dark-accent">
          <TabsTrigger 
            value="puantaj"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400"
          >
            <Clock className="h-4 w-4 mr-2" />
            Puantaj
          </TabsTrigger>
          <TabsTrigger 
            value="hakedis"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-400"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Hakediş
          </TabsTrigger>
          <TabsTrigger 
            value="odeme"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-400"
          >
            <Banknote className="h-4 w-4 mr-2" />
            Ödeme
          </TabsTrigger>
        </TabsList>

        {/* Puantaj Tab */}
        <TabsContent value="puantaj" className="mt-6">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-400" />
                <h3 className="text-white font-medium text-lg">Puantaj Kayıtları</h3>
              </div>
              
              {personTimesheets.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Henüz puantaj kaydı yok</p>
                  <p className="text-gray-500 text-sm">Bu personel için henüz puantaj kaydı eklenmemiş.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {personTimesheets.map((timesheet) => (
                    <Card key={timesheet.id} className="bg-dark-primary border-dark-accent">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{formatDate(timesheet.date.toISOString())}</p>
                            <p className="text-gray-400 text-sm">
                              {timesheet.workType} • {timesheet.totalHours} saat
                              {timesheet.overtimeHours && ` • ${timesheet.overtimeHours} mesai`}
                            </p>
                            {timesheet.notes && (
                              <p className="text-gray-500 text-sm mt-1">{timesheet.notes}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hakediş Tab */}
        <TabsContent value="hakedis" className="mt-6">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-green-400" />
                <h3 className="text-white font-medium text-lg">Hakediş Detayları</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-dark-primary border border-dark-accent rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Toplam Çalışma Saati:</span>
                    <span className="text-white font-medium">
                      {personTimesheets.reduce((sum, ts) => sum + parseFloat(ts.totalHours || "0"), 0)} saat
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-dark-primary border border-dark-accent rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Toplam Mesai Saati:</span>
                    <span className="text-white font-medium">
                      {personTimesheets.reduce((sum, ts) => sum + parseFloat(ts.overtimeHours || "0"), 0)} saat
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-medium">Toplam Hakediş:</span>
                    <span className="text-green-400 font-bold text-lg">{formatSalary(totalEarnings)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ödeme Tab */}
        <TabsContent value="odeme" className="mt-6">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-purple-400" />
                  <h3 className="text-white font-medium text-lg">Ödeme Geçmişi</h3>
                </div>
                <Button
                  onClick={() => {
                    setSelectedPayment(undefined);
                    setShowPaymentForm(true);
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ödeme Yap
                </Button>
              </div>
              
              {personPayments.length === 0 ? (
                <div className="text-center py-8">
                  <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Henüz ödeme yapılmamış</p>
                  <p className="text-gray-500 text-sm">Bu personele henüz ödeme yapılmamış.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {personPayments.map((payment) => (
                    <Card key={payment.id} className="bg-dark-primary border-dark-accent">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`
                                px-2 py-1 text-xs rounded-full font-medium
                                ${payment.paymentType === 'salary' ? 'bg-blue-500/20 text-blue-400' : ''}
                                ${payment.paymentType === 'bonus' ? 'bg-green-500/20 text-green-400' : ''}
                                ${payment.paymentType === 'advance' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                ${payment.paymentType === 'deduction' ? 'bg-red-500/20 text-red-400' : ''}
                              `}>
                                {payment.paymentType === 'salary' ? 'Maaş' : ''}
                                {payment.paymentType === 'bonus' ? 'İkramiye' : ''}
                                {payment.paymentType === 'advance' ? 'Avans' : ''}
                                {payment.paymentType === 'deduction' ? 'Kesinti' : ''}
                              </span>
                              <span className="text-white font-medium">{formatSalary(parseFloat(payment.amount))}</span>
                            </div>
                            <p className="text-gray-400 text-sm">{formatDate(payment.paymentDate.toISOString())}</p>
                            {payment.notes && (
                              <p className="text-gray-500 text-sm mt-1">{payment.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-dark-primary"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentForm(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Form */}
      <PersonnelPaymentForm
        open={showPaymentForm}
        onOpenChange={(open) => {
          setShowPaymentForm(open);
          if (!open) {
            setSelectedPayment(undefined);
          }
        }}
        personnelId={personnelId}
        personnelName={person.name}
        payment={selectedPayment}
      />
    </div>
  );
}