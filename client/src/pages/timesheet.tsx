import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Calendar, Clock } from "lucide-react";
import { type Timesheet, type Personnel } from "@shared/schema";
import Header from "@/components/layout/header";
import TimesheetForm from "@/components/forms/timesheet-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TimesheetPage() {
  const [, setLocation] = useLocation();
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);

  const { data: timesheets = [], isLoading: timesheetsLoading } = useQuery<Timesheet[]>({
    queryKey: ["/api/timesheets"],
  });

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  const getPersonnelName = (personnelId: string) => {
    const person = personnel.find(p => p.id === personnelId);
    return person?.name || "Bilinmeyen Personel";
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
  };

  const formatTime = (time: string) => {
    return time;
  };

  if (timesheetsLoading) {
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
          <h1 className="text-2xl font-bold">Puantaj Kayıtları</h1>
        </div>

        <div className="mb-6">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setShowTimesheetForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Puantaj
          </Button>
        </div>

        {timesheets.length === 0 ? (
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Henüz puantaj kaydı eklenmemiş</p>
              <p className="text-gray-500 text-sm">Yeni puantaj kaydı eklemek için yukarıdaki butonu kullanın.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {timesheets.map((timesheet) => (
              <Card key={timesheet.id} className="bg-dark-secondary border-dark-accent">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <h4 className="text-white font-medium text-lg">
                          {getPersonnelName(timesheet.personnelId)}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Tarih</p>
                          <p className="text-white font-medium">{formatDate(timesheet.date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Giriş</p>
                          <p className="text-white font-medium">{formatTime(timesheet.startTime || "08:00")}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Çıkış</p>
                          <p className="text-white font-medium">{formatTime(timesheet.endTime || "17:00")}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Normal Saat</p>
                          <p className="text-white font-medium">{timesheet.totalHours}h</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Mesai Saati</p>
                          <p className="text-orange-400 font-medium">
                            {timesheet.overtimeHours && parseFloat(timesheet.overtimeHours) > 0 
                              ? `${timesheet.overtimeHours}h` 
                              : "0h"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Günlük Ücret</p>
                          <p className="text-green-400 font-medium">
                            ₺{parseFloat(timesheet.dailyWage || "0").toLocaleString('tr-TR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Mesai Ücreti</p>
                          <p className="text-yellow-400 font-medium">
                            {timesheet.overtimeHours && parseFloat(timesheet.overtimeHours) > 0 
                              ? `₺${(parseFloat(timesheet.hourlyRate || "0") * parseFloat(timesheet.overtimeHours || "0")).toLocaleString('tr-TR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}`
                              : "₺0,00"}
                          </p>
                        </div>
                      </div>

                      {timesheet.notes && (
                        <div className="mt-3">
                          <p className="text-gray-400 text-sm">Not</p>
                          <p className="text-gray-300 text-sm">{timesheet.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TimesheetForm 
        open={showTimesheetForm} 
        onOpenChange={setShowTimesheetForm} 
      />
    </div>
  );
}
