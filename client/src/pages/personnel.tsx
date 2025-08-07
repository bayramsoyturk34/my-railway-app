import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Edit, Trash2, User, Clock, Calendar } from "lucide-react";
import { type Personnel, type Timesheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import PersonnelForm from "@/components/forms/personnel-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
          <div className="space-y-3">
            {personnel.map((person) => {
              const personTimesheets = getPersonnelTimesheets(person.id);
              const totalHours = personTimesheets.reduce((sum, ts) => sum + parseFloat(ts.totalHours), 0);
              const totalOvertimeHours = personTimesheets.reduce((sum, ts) => sum + parseFloat(ts.overtimeHours || "0"), 0);
              
              return (
                <Card key={person.id} className="bg-dark-secondary border-dark-accent">
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
                                <span className="text-gray-400">Puantaj Bilgileri</span>
                              </div>
                              <p className="text-gray-300">
                                {personTimesheets.length} kayıt • {totalHours.toFixed(1)}h normal
                              </p>
                              {totalOvertimeHours > 0 && (
                                <p className="text-orange-400">
                                  {totalOvertimeHours.toFixed(1)}h mesai
                                </p>
                              )}
                              {personTimesheets.length === 0 && (
                                <p className="text-gray-500">Henüz puantaj kaydı yok</p>
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
              );
            })}
          </div>
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
