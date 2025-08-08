import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertTimesheetSchema, type InsertTimesheet, type Personnel, type Customer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface TimesheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TimesheetForm({ open, onOpenChange }: TimesheetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [workType, setWorkType] = useState<string>("");

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

  // Çalışma şekli değiştiğinde ücret hesapla
  useEffect(() => {
    if (selectedPersonnel && workType) {
      const salary = parseFloat(selectedPersonnel.salary || "0");
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
          const overtimeHours = parseFloat(form.watch("overtimeHours") || "0");
          totalHours = overtimeHours.toFixed(2);
          hourlyRate = (dailyWage / 8).toFixed(2); // Mesai normal ücret
          calculatedWage = (parseFloat(hourlyRate) * overtimeHours).toFixed(2);
          break;
      }
      
      form.setValue("totalHours", totalHours);
      form.setValue("hourlyRate", hourlyRate);
      form.setValue("dailyWage", calculatedWage);
    }
  }, [selectedPersonnel, workType, form]);

  const createTimesheetMutation = useMutation({
    mutationFn: async (data: InsertTimesheet) => {
      const response = await apiRequest("/api/timesheets", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      toast({
        title: "Başarılı",
        description: "Puantaj kaydı oluşturuldu.",
      });
      form.reset();
      setSelectedPersonnel(null);
      setWorkType("");
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Puantaj kaydı oluşturulamadı.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTimesheet) => {
    console.log("Submitting timesheet data:", data);
    createTimesheetMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Puantaj Yaz</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="personnelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Personel Seç</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    const person = personnel.find(p => p.id === value);
                    setSelectedPersonnel(person || null);
                  }} defaultValue={field.value}>
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

            {/* Ücret Bilgileri */}
            {selectedPersonnel && workType && (
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
