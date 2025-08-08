import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Edit, Trash2, User, Clock, Calendar, CreditCard, Banknote } from "lucide-react";
import { type Personnel, type Timesheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import PersonnelForm from "@/components/forms/personnel-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Personnel() {
  const [, setLocation] = useLocation();
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: personnel = [], isLoading } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  const { data: timesheets = [] } = useQuery<Timesheet[]>({
    queryKey: ["/api/timesheets"],
  });

  const deletePersonnelMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/personnel/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      toast({
        title: "Başarılı",
        description: "Personel kaydı silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Personel kaydı silinemedi.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
  };

  const getPersonnelTimesheets = (personnelId: string) => {
    return timesheets.filter(timesheet => timesheet.personnelId === personnelId);
  };

  const formatSalary = (salary: string | null) => {
    if (!salary) return "Belirtilmemiş";
    return `${parseFloat(salary).toLocaleString('tr-TR')} TL`;
  };

  const calculateDailyWage = (salary: string | null) => {
    if (!salary) return "Hesaplanamaz";
    const monthlySalary = parseFloat(salary);
    const dailyWage = monthlySalary / 30;
    return `${dailyWage.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL/gün`;
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
          <h1 className="text-2xl font-bold">Personel Yönetimi</h1>
        </div>

        <div className="mb-6">
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => {
              setSelectedPersonnel(undefined);
              setShowPersonnelForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Personel
          </Button>
        </div>

{personnel.length === 0 ? (
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Henüz personel eklenmemiş</p>
              <p className="text-gray-500 text-sm">Yeni personel eklemek için yukarıdaki butonu kullanın.</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={personnel[0]?.id} className="w-full">
            <TabsList className="grid w-full bg-dark-secondary border-dark-accent" style={{ gridTemplateColumns: `repeat(${personnel.length}, minmax(0, 1fr))` }}>
              {personnel.map((person) => {
                const personTimesheets = getPersonnelTimesheets(person.id);
                return (
                  <TabsTrigger 
                    key={person.id} 
                    value={person.id}
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400"
                  >
                    {person.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {personnel.map((person) => {
              const personTimesheets = getPersonnelTimesheets(person.id);
              const totalHours = personTimesheets.reduce((sum, ts) => sum + parseFloat(ts.totalHours), 0);
              const totalOvertimeHours = personTimesheets.reduce((sum, ts) => sum + parseFloat(ts.overtimeHours || "0"), 0);
              
              return (
                <TabsContent key={person.id} value={person.id} className="mt-6">
                  {/* Personel Bilgi Kartı */}
                  <Card className="bg-dark-secondary border-dark-accent mb-6">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-lg">{person.name}</h4>
                            <p className="text-gray-400 text-sm">
                              {person.position} • Başlangıç: {formatDate(person.startDate)}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                              <div>
                                <p className="text-gray-500 text-sm">💰 Maaş: {formatSalary(person.salary)}</p>
                                <p className="text-blue-400 text-sm">💵 Yevmiye: {calculateDailyWage(person.salary)}</p>
                                {person.phone && (
                                  <p className="text-gray-500 text-sm">📞 {person.phone}</p>
                                )}
                                {person.email && (
                                  <p className="text-gray-500 text-sm">✉️ {person.email}</p>
                                )}
                              </div>
                              
                              <div className="text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="h-4 w-4 text-blue-400" />
                                  <span className="text-gray-400">Puantaj Özeti</span>
                                </div>
                                <p className="text-gray-300">
                                  {personTimesheets.length} kayıt • {totalHours.toFixed(1)}h normal
                                </p>
                                {totalOvertimeHours > 0 && (
                                  <p className="text-orange-400">
                                    {totalOvertimeHours.toFixed(1)}h mesai
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-400 hover:text-blue-300 hover:bg-dark-accent"
                            onClick={() => {
                              setSelectedPersonnel(person);
                              setShowPersonnelForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-dark-accent"
                            onClick={() => deletePersonnelMutation.mutate(person.id)}
                            disabled={deletePersonnelMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alt Sekmeler */}
                  <Tabs defaultValue="puantaj" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-dark-accent border-dark-accent">
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

                    {/* Puantaj Sekmesi */}
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
                              {personTimesheets
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((timesheet) => {
                                  const dailyWage = person.salary ? (parseFloat(person.salary) / 30) : 0;
                                  const calculatedWage = timesheet.workType === "tam" 
                                    ? dailyWage 
                                    : timesheet.workType === "yarim" 
                                    ? dailyWage / 2 
                                    : (dailyWage / 8) * parseFloat(timesheet.overtimeHours || "0");
                                  
                                  return (
                                    <Card key={timesheet.id} className="bg-dark-accent border-gray-600">
                                      <CardContent className="p-3">
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                              <Calendar className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div>
                                              <h4 className="text-white font-medium">
                                                {formatDate(timesheet.date)}
                                              </h4>
                                              <p className="text-gray-400 text-sm">
                                                {timesheet.workType === "tam" ? "Tam Gün" : 
                                                 timesheet.workType === "yarim" ? "Yarım Gün" : 
                                                 `Mesai ${timesheet.overtimeHours}h`}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          <div className="text-right">
                                            <p className="text-green-400 font-medium">
                                              {calculatedWage.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                              {timesheet.workType === "mesai" 
                                                ? `${timesheet.overtimeHours}h` 
                                                : parseFloat(timesheet.totalHours).toFixed(1) + "h"
                                              }
                                            </p>
                                          </div>
                                          
                                          <div className="flex gap-1 ml-4">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-dark-primary"
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                        
                                        {timesheet.notes && (
                                          <div className="mt-2 pt-2 border-t border-gray-600">
                                            <p className="text-gray-300 text-sm">{timesheet.notes}</p>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Hakediş Sekmesi */}
                    <TabsContent value="hakedis" className="mt-6">
                      <Card className="bg-dark-secondary border-dark-accent">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-5 w-5 text-green-400" />
                            <h3 className="text-white font-medium text-lg">Hakediş Hesaplaması</h3>
                          </div>
                          
                          {(() => {
                            const totalEarnings = personTimesheets.reduce((sum, timesheet) => {
                              const dailyWage = person.salary ? (parseFloat(person.salary) / 30) : 0;
                              const wage = timesheet.workType === "tam" 
                                ? dailyWage 
                                : timesheet.workType === "yarim" 
                                ? dailyWage / 2 
                                : (dailyWage / 8) * parseFloat(timesheet.overtimeHours || "0");
                              return sum + wage;
                            }, 0);
                            
                            return (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-dark-accent p-4 rounded-lg">
                                    <h4 className="text-green-400 font-medium mb-2">Toplam Hakediş</h4>
                                    <p className="text-2xl font-bold text-white">
                                      {totalEarnings.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">
                                      {personTimesheets.length} gün çalışma
                                    </p>
                                  </div>
                                  
                                  <div className="bg-dark-accent p-4 rounded-lg">
                                    <h4 className="text-blue-400 font-medium mb-2">Ortalama Günlük</h4>
                                    <p className="text-xl font-bold text-white">
                                      {personTimesheets.length > 0 
                                        ? (totalEarnings / personTimesheets.length).toLocaleString('tr-TR', { maximumFractionDigits: 2 })
                                        : "0"
                                      } TL
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">günlük ortalama</p>
                                  </div>
                                </div>
                                
                                <div className="bg-dark-accent p-4 rounded-lg">
                                  <h4 className="text-purple-400 font-medium mb-3">Çalışma Detayları</h4>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-400">Tam Gün</p>
                                      <p className="text-white font-medium">
                                        {personTimesheets.filter(t => t.workType === "tam").length} gün
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Yarım Gün</p>
                                      <p className="text-white font-medium">
                                        {personTimesheets.filter(t => t.workType === "yarim").length} gün
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400">Mesai</p>
                                      <p className="text-white font-medium">
                                        {personTimesheets.filter(t => t.workType === "mesai").reduce((sum, t) => sum + parseFloat(t.overtimeHours || "0"), 0).toFixed(1)}h
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Ödeme Sekmesi */}
                    <TabsContent value="odeme" className="mt-6">
                      <Card className="bg-dark-secondary border-dark-accent">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Banknote className="h-5 w-5 text-purple-400" />
                            <h3 className="text-white font-medium text-lg">Ödeme Kayıtları</h3>
                          </div>
                          
                          <div className="text-center py-8">
                            <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-2">Ödeme sistemi yakında</p>
                            <p className="text-gray-500 text-sm">Personel ödeme kayıtları burada görünecek.</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>

      <PersonnelForm 
        open={showPersonnelForm} 
        onOpenChange={(open) => {
          setShowPersonnelForm(open);
          if (!open) {
            setSelectedPersonnel(undefined);
          }
        }}
        personnel={selectedPersonnel}
      />
    </div>
  );
}
