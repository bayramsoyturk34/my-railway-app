import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertTimesheetSchema, type InsertTimesheet, type Personnel, type Customer, type Timesheet } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface TimesheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTimesheet?: Timesheet | null;
}

export default function TimesheetForm({ open, onOpenChange, editingTimesheet }: TimesheetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);
  const [workType, setWorkType] = useState<string>("");
  const [showPersonnelDropdown, setShowPersonnelDropdown] = useState(false);

  const form = useForm<InsertTimesheet>({
    resolver: zodResolver(insertTimesheetSchema),
    defaultValues: {
      personnelId: editingTimesheet?.personnelId || "",
      customerId: editingTimesheet?.customerId || "",
      date: editingTimesheet?.date ? new Date(editingTimesheet.date) : new Date(),
      workType: editingTimesheet?.workType || "tam",
      startTime: editingTimesheet?.startTime || "08:00",
      endTime: editingTimesheet?.endTime || "17:00",
      totalHours: editingTimesheet?.totalHours || "8.00",
      overtimeHours: editingTimesheet?.overtimeHours || "0.00",
      hourlyRate: editingTimesheet?.hourlyRate || "0.00",
      dailyWage: editingTimesheet?.dailyWage || "0.00",
      notes: editingTimesheet?.notes || "",
    },
  });

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Dialog açıldığında form değerlerini ayarla
  useEffect(() => {
    if (open) {
      if (editingTimesheet) {
        // Edit mode
        setSelectedPersonnelIds([editingTimesheet.personnelId || ""]);
        setWorkType(editingTimesheet.workType || "tam");
        form.reset({
          personnelId: editingTimesheet.personnelId || "",
          customerId: editingTimesheet.customerId || "",
          date: editingTimesheet.date ? new Date(editingTimesheet.date) : new Date(),
          workType: editingTimesheet.workType || "tam",
          startTime: editingTimesheet.startTime || "08:00",
          endTime: editingTimesheet.endTime || "17:00",
          totalHours: editingTimesheet.totalHours || "8.00",
          overtimeHours: editingTimesheet.overtimeHours || "0.00",
          hourlyRate: editingTimesheet.hourlyRate || "0.00",
          dailyWage: editingTimesheet.dailyWage || "0.00",
          notes: editingTimesheet.notes || "",
        });
      } else {
        // New record mode
        setSelectedPersonnelIds([]);
        setWorkType("");
        form.reset({
          personnelId: "",
          customerId: "",
          date: new Date(),
          workType: "tam",
          startTime: "08:00",
          endTime: "17:00",
          totalHours: "8.00",
          overtimeHours: "0.00",
          hourlyRate: "0.00",
          dailyWage: "0.00",
          notes: "",
        });
      }
    }
  }, [open, editingTimesheet]);



  const createTimesheetMutation = useMutation({
    mutationFn: async (data: InsertTimesheet) => {
      if (editingTimesheet) {
        // Düzenleme modu - tek kayıt güncelle
        const response = await apiRequest(`/api/timesheets/${editingTimesheet.id}`, "PUT", data);
        return response.json();
      } else {
        // Yeni kayıt modu - seçili personeller için toplu kayıt
        const promises = selectedPersonnelIds.map(async (personnelId) => {
          const personnelData = personnel.find(p => p.id === personnelId);
          if (!personnelData) return null;
          
          const salary = parseFloat(personnelData.salary || "0");
          const dailyWage = salary / 30;
          
          let totalHours = "8.00";
          let hourlyRate = "0.00";
          let calculatedWage = "0.00";
          
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
              const overtimeHours = parseFloat(data.overtimeHours || "0");
              totalHours = overtimeHours.toFixed(2);
              hourlyRate = (dailyWage / 8).toFixed(2);
              calculatedWage = (parseFloat(hourlyRate) * overtimeHours).toFixed(2);
              break;
          }
          
          const timesheetData = {
            ...data,
            personnelId,
            totalHours,
            hourlyRate,
            dailyWage: calculatedWage,
            workType,
          };
          
          const response = await apiRequest("/api/timesheets", "POST", timesheetData);
          return response.json();
        });
        
        const results = await Promise.all(promises);
        return results.filter(r => r !== null);
      }
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      const count = editingTimesheet ? 1 : selectedPersonnelIds.length;
      toast({
        title: "Başarılı",
        description: editingTimesheet 
          ? "Puantaj kaydı güncellendi." 
          : `${count} personel için puantaj kaydı oluşturuldu.`,
      });
      form.reset();
      setSelectedPersonnelIds([]);
      setWorkType("tam");
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

  const onSubmit = (data: InsertTimesheet) => {
    // Düzenleme modunda validation
    if (editingTimesheet) {
      createTimesheetMutation.mutate(data);
      return;
    }
    
    // Yeni kayıt modunda multi-selection validation
    if (selectedPersonnelIds.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir personel seçin.",
        variant: "destructive",
      });
      return;
    }
    
    if (!workType) {
      toast({
        title: "Uyarı", 
        description: "Lütfen çalışma şekli seçin.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Submitting timesheet data for personnel:", selectedPersonnelIds);
    createTimesheetMutation.mutate(data);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingTimesheet ? "Puantaj Düzenle" : "Puantaj Yaz"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!editingTimesheet && (
              <div className="space-y-3">
                <FormLabel className="text-gray-300">Personel Seç</FormLabel>
                
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
                            onClick={() => togglePersonnelSelection(person.id)}
                          >
                            <Checkbox
                              checked={selectedPersonnelIds.includes(person.id)}
                              onCheckedChange={() => togglePersonnelSelection(person.id)}
                              className="border-gray-400"
                            />
                            <span className="text-white text-sm">{person.name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            )}
            
            {editingTimesheet && (
              <FormField
                control={form.control}
                name="personnelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Personel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                          <SelectValue placeholder="Personel seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-primary border-dark-accent">
                        {personnel.map((person) => (
                          <SelectItem key={person.id} value={person.id} className="text-white">
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Müşteri Seç</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                        <SelectValue placeholder="Müşteri seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-primary border-dark-accent">
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id} className="text-white">
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!editingTimesheet && (
              <div className="space-y-2">
                <FormLabel className="text-gray-300">Çalışma Şekli</FormLabel>
                <Select onValueChange={setWorkType} value={workType}>
                  <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                    <SelectValue placeholder="Çalışma şekli seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-primary border-dark-accent">
                    <SelectItem value="tam" className="text-white">TAM GÜN</SelectItem>
                    <SelectItem value="yarim" className="text-white">YARIM GÜN</SelectItem>
                    <SelectItem value="mesai" className="text-white">MESAİ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingTimesheet && (
              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Çalışma Şekli</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setWorkType(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                          <SelectValue placeholder="Çalışma şekli seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-primary border-dark-accent">
                        <SelectItem value="tam" className="text-white">TAM GÜN</SelectItem>
                        <SelectItem value="yarim" className="text-white">YARIM GÜN</SelectItem>
                        <SelectItem value="mesai" className="text-white">MESAİ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Tarih</FormLabel>
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

            {/* Mesai Saati Girişi */}
            {workType === "mesai" && (
              <FormField
                control={form.control}
                name="overtimeHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Mesai Saati</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="12"
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Mesai saati giriniz..."
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
            )}

            {/* Ücret Bilgileri - Multi-selection Preview */}
            {!editingTimesheet && selectedPersonnelIds.length > 0 && workType && (
              <div className="bg-dark-accent p-4 rounded-lg space-y-2">
                <h4 className="text-white font-medium">Ücret Önizlemesi ({selectedPersonnelIds.length} personel)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Çalışma Şekli:</span>
                    <p className="text-white">
                      {workType === "tam" ? "Tam Gün (8h)" : workType === "yarim" ? "Yarım Gün (4h)" : `Mesai (${form.watch("overtimeHours") || 0}h)`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Toplam Personel:</span>
                    <p className="text-blue-400">{selectedPersonnelIds.length} kişi</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  * Her personelin kendi maaşına göre ücret hesaplanacak
                </div>
              </div>
            )}

            {/* Ücret Bilgileri - Edit Mode */}
            {editingTimesheet && workType && (
              <div className="bg-dark-accent p-4 rounded-lg space-y-2">
                <h4 className="text-white font-medium">Ücret Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Çalışma Saati:</span>
                    <p className="text-white">
                      {workType === "mesai" ? `${form.watch("overtimeHours") || 0}h (Mesai)` : `${form.watch("totalHours")}h`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Saatlik Ücret:</span>
                    <p className="text-blue-400">{parseFloat(form.watch("hourlyRate") || "0").toLocaleString('tr-TR')} TL</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Günlük Ücret:</span>
                    <p className="text-green-400">{parseFloat(form.watch("dailyWage") || "0").toLocaleString('tr-TR')} TL</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Çalışma Şekli:</span>
                    <p className="text-white">
                      {workType === "tam" ? "Tam Gün" : workType === "yarim" ? "Yarım Gün" : "Mesai"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Not</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-dark-primary border-dark-accent text-white h-20"
                      placeholder="Ek bilgiler..."
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
                onClick={() => onOpenChange(false)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={createTimesheetMutation.isPending}
              >
                {createTimesheetMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
