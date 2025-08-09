import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Personnel, type Customer, type Timesheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TimesheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTimesheet?: Timesheet | null;
}

export default function TimesheetForm({ open, onOpenChange, editingTimesheet }: TimesheetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);
  const [workType, setWorkType] = useState<string>("tam");
  const [showPersonnelDropdown, setShowPersonnelDropdown] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [overtimeHours, setOvertimeHours] = useState("0");
  const [notes, setNotes] = useState("");

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Dialog açıldığında değerleri reset et
  const initializeForm = () => {
    if (editingTimesheet) {
      setSelectedPersonnelIds([editingTimesheet.personnelId || ""]);
      setWorkType(editingTimesheet.workType || "tam");
      setCustomerId(editingTimesheet.customerId || "");
      setDate(editingTimesheet.date ? new Date(editingTimesheet.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setOvertimeHours(editingTimesheet.overtimeHours || "0");
      setNotes(editingTimesheet.notes || "");
    } else {
      setSelectedPersonnelIds([]);
      setWorkType("tam");
      setCustomerId("");
      setDate(new Date().toISOString().split('T')[0]);
      setOvertimeHours("0");
      setNotes("");
    }
    setShowPersonnelDropdown(false);
  };

  const createTimesheetMutation = useMutation({
    mutationFn: async () => {
      if (editingTimesheet) {
        // Edit mode
        const data = {
          personnelId: selectedPersonnelIds[0],
          customerId,
          date: new Date(date),
          workType,
          startTime: "08:00",
          endTime: "17:00",
          totalHours: workType === "tam" ? "8.00" : workType === "yarim" ? "4.00" : overtimeHours,
          overtimeHours: workType === "mesai" ? overtimeHours : "0.00",
          hourlyRate: "0.00",
          dailyWage: "0.00",
          notes,
        };
        const response = await apiRequest(`/api/timesheets/${editingTimesheet.id}`, "PUT", data);
        return response.json();
      } else {
        // Multi-create mode
        const promises = selectedPersonnelIds.map(async (personnelId) => {
          const personnelData = personnel.find(p => p.id === personnelId);
          if (!personnelData) return null;
          
          const salary = parseFloat(personnelData.salary || "0");
          const dailyWage = salary / 30;
          
          let totalHours = "8.00";
          let calculatedWage = "0.00";
          let hourlyRate = "0.00";
          
          switch (workType) {
            case "tam":
              totalHours = "8.00";
              calculatedWage = dailyWage.toFixed(2);
              hourlyRate = (dailyWage / 8).toFixed(2);
              break;
            case "yarim":
              totalHours = "4.00";
              calculatedWage = (dailyWage / 2).toFixed(2);
              hourlyRate = (dailyWage / 8).toFixed(2);
              break;
            case "mesai":
              totalHours = overtimeHours;
              hourlyRate = (dailyWage / 8).toFixed(2);
              calculatedWage = (parseFloat(hourlyRate) * parseFloat(overtimeHours)).toFixed(2);
              break;
          }
          
          const data = {
            personnelId,
            customerId,
            date: new Date(date),
            workType,
            startTime: "08:00",
            endTime: "17:00",
            totalHours,
            overtimeHours: workType === "mesai" ? overtimeHours : "0.00",
            hourlyRate,
            dailyWage: calculatedWage,
            notes,
          };
          
          const response = await apiRequest("/api/timesheets", "POST", data);
          return response.json();
        });
        
        const results = await Promise.all(promises);
        return results.filter(r => r !== null);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      const count = editingTimesheet ? 1 : selectedPersonnelIds.length;
      toast({
        title: "Başarılı",
        description: editingTimesheet 
          ? "Puantaj kaydı güncellendi." 
          : `${count} personel için puantaj kaydı oluşturuldu.`,
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: editingTimesheet ? "Puantaj kaydı güncellenemedi." : "Puantaj kayıtları oluşturulamadı.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!editingTimesheet && selectedPersonnelIds.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir personel seçin.",
        variant: "destructive",
      });
      return;
    }

    if (!customerId) {
      toast({
        title: "Uyarı",
        description: "Lütfen müşteri seçin.",
        variant: "destructive",
      });
      return;
    }

    if (workType === "mesai" && (!overtimeHours || parseFloat(overtimeHours) <= 0)) {
      toast({
        title: "Uyarı",
        description: "Mesai saati girmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    createTimesheetMutation.mutate();
  };
  
  const togglePersonnelSelection = (personnelId: string) => {
    setSelectedPersonnelIds(prev => {
      if (prev.includes(personnelId)) {
        return prev.filter(id => id !== personnelId);
      } else {
        return [...prev, personnelId];
      }
    });
  };
  
  const removePersonnel = (personnelId: string) => {
    setSelectedPersonnelIds(prev => prev.filter(id => id !== personnelId));
  };
  
  const selectedPersonnelList = personnel.filter(p => selectedPersonnelIds.includes(p.id));

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (isOpen) {
          initializeForm();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingTimesheet ? "Puantaj Düzenle" : "Puantaj Yaz"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!editingTimesheet && (
            <div className="space-y-3">
              <label className="text-gray-300 block">Personel Seç</label>
              
              {/* Seçili Personeller */}
              {selectedPersonnelList.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Seçili Personeller:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersonnelList.map((person) => (
                      <Badge
                        key={person.id}
                        variant="secondary"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                      >
                        {person.name}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removePersonnel(person.id)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Personel Listesi */}
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start bg-dark-primary border-dark-accent text-white hover:bg-dark-accent"
                  onClick={() => setShowPersonnelDropdown(!showPersonnelDropdown)}
                >
                  {selectedPersonnelIds.length > 0 
                    ? `${selectedPersonnelIds.length} personel seçildi` 
                    : "Personel seçin"}
                </Button>
                
                {showPersonnelDropdown && (
                  <ScrollArea className="h-40 w-full border border-dark-accent rounded-md bg-dark-primary">
                    <div className="p-2 space-y-1">
                      {personnel.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-dark-accent p-2 rounded"
                        >
                          <Checkbox
                            checked={selectedPersonnelIds.includes(person.id)}
                            onCheckedChange={() => togglePersonnelSelection(person.id)}
                            className="border-gray-400"
                          />
                          <span 
                            className="text-white text-sm flex-1"
                            onClick={() => togglePersonnelSelection(person.id)}
                          >
                            {person.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
          
          {editingTimesheet && (
            <div className="space-y-2">
              <label className="text-gray-300 block">Personel</label>
              <Select value={selectedPersonnelIds[0] || ""} onValueChange={(value) => setSelectedPersonnelIds([value])}>
                <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent className="bg-dark-primary border-dark-accent">
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id} className="text-white">
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-gray-300 block">Müşteri</label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                <SelectValue placeholder="Müşteri seçin" />
              </SelectTrigger>
              <SelectContent className="bg-dark-primary border-dark-accent">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id} className="text-white">
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 block">Tarih</label>
            <Input
              type="date"
              className="bg-dark-primary border-dark-accent text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {!editingTimesheet && (
            <div className="space-y-2">
              <label className="text-gray-300 block">Çalışma Şekli</label>
              <div className="flex gap-2">
                {["tam", "yarim", "mesai"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={workType === type ? "default" : "outline"}
                    size="sm"
                    className={workType === type 
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-dark-primary border-dark-accent text-white hover:bg-dark-accent"
                    }
                    onClick={() => setWorkType(type)}
                  >
                    {type === "tam" ? "TAM" : type === "yarim" ? "YARIM" : "MESAİ"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {(editingTimesheet || workType === "mesai") && (
            <div className="space-y-2">
              <label className="text-gray-300 block">Mesai Saati</label>
              <Select value={overtimeHours} onValueChange={setOvertimeHours}>
                <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                  <SelectValue placeholder="Mesai saati seçin" />
                </SelectTrigger>
                <SelectContent className="bg-dark-primary border-dark-accent">
                  <SelectItem value="1.00" className="text-white">1 saat</SelectItem>
                  <SelectItem value="1.50" className="text-white">1.5 saat</SelectItem>
                  <SelectItem value="2.00" className="text-white">2 saat</SelectItem>
                  <SelectItem value="2.50" className="text-white">2.5 saat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-gray-300 block">Notlar</label>
            <Textarea
              placeholder="Ek notlar..."
              className="bg-dark-primary border-dark-accent text-white"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-dark-accent text-white hover:bg-dark-accent"
            >
              İptal
            </Button>
            <Button
              type="button"
              disabled={createTimesheetMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
            >
              {createTimesheetMutation.isPending 
                ? "Kaydediliyor..." 
                : editingTimesheet ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}