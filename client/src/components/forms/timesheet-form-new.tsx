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
import { useState } from "react";

interface TimesheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTimesheet?: Timesheet | null;
}

export default function TimesheetForm({ open, onOpenChange, editingTimesheet }: TimesheetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);
  const [workType, setWorkType] = useState<string>("tam");
  const [showPersonnelDropdown, setShowPersonnelDropdown] = useState(false);

  const form = useForm<InsertTimesheet>({
    resolver: zodResolver(insertTimesheetSchema),
    defaultValues: {
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
    },
  });

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Dialog açıldığında değerleri güncelle
  const handleDialogOpen = () => {
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
      setWorkType("tam");
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
  };

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
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (isOpen) {
          handleDialogOpen();
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
                  <FormLabel className="text-gray-300">Müşteri</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!editingTimesheet && (
              <div className="space-y-2">
                <FormLabel className="text-gray-300">Çalışma Şekli</FormLabel>
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
              <FormField
                control={form.control}
                name="overtimeHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Mesai Saati</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-dark-primary border-dark-accent text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Notlar</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ek notlar..."
                      className="bg-dark-primary border-dark-accent text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                type="submit"
                disabled={createTimesheetMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createTimesheetMutation.isPending 
                  ? "Kaydediliyor..." 
                  : editingTimesheet ? "Güncelle" : "Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}