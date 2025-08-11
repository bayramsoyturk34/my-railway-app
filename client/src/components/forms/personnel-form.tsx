import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { insertPersonnelSchema, type InsertPersonnel, type Personnel } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PersonnelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnel?: Personnel;
}

export default function PersonnelForm({ open, onOpenChange, personnel }: PersonnelFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertPersonnel>({
    resolver: zodResolver(insertPersonnelSchema),
    defaultValues: {
      name: "",
      position: "",
      startDate: new Date(),
      phone: null,
      email: null,
      salary: null,
      salaryType: "monthly",
      isActive: true,
    },
  });

  // Update form when personnel changes
  useEffect(() => {
    if (personnel) {
      form.reset({
        name: personnel.name,
        position: personnel.position,
        startDate: new Date(personnel.startDate),
        phone: personnel.phone,
        email: personnel.email,
        salary: personnel.salary,
        salaryType: personnel.salaryType || "monthly",
        isActive: personnel.isActive,
      });
    } else {
      form.reset({
        name: "",
        position: "",
        startDate: new Date(),
        phone: null,
        email: null,
        salary: null,
        salaryType: "monthly",
        isActive: true,
      });
    }
  }, [personnel, form]);

  const createPersonnelMutation = useMutation({
    mutationFn: async (data: InsertPersonnel) => {
      return await apiRequest("/api/personnel", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      toast({
        title: "Başarılı",
        description: "Personel kaydı oluşturuldu.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Personel kaydı oluşturulamadı.",
        variant: "destructive",
      });
    },
  });

  const updatePersonnelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPersonnel> }) => {
      return await apiRequest(`/api/personnel/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      toast({
        title: "Başarılı",
        description: "Personel kaydı güncellendi.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Personel kaydı güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPersonnel) => {
    // Convert empty strings to null for optional fields
    const cleanedData = {
      ...data,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
    };
    console.log("Submitting personnel data:", cleanedData);
    
    if (personnel) {
      updatePersonnelMutation.mutate({ id: personnel.id, data: cleanedData });
    } else {
      createPersonnelMutation.mutate(cleanedData);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {personnel ? "Personel Düzenle" : "Yeni Personel"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Ad Soyad</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-dark-primary border-dark-accent text-white"
                      placeholder="Personel adı"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Pozisyon</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-dark-primary border-dark-accent text-white"
                      placeholder="Çalışma pozisyonu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Başlangıç Tarihi</FormLabel>
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

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Telefon</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-dark-primary border-dark-accent text-white"
                      placeholder="Telefon numarası"
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">E-posta</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="bg-dark-primary border-dark-accent text-white"
                      placeholder="E-posta adresi"
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

            <FormField
              control={form.control}
              name="salaryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Maaş Türü</FormLabel>
                  <FormControl>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={field.value === "monthly" ? "default" : "outline"}
                        className={`flex-1 ${
                          field.value === "monthly" 
                            ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500" 
                            : "bg-dark-primary border-dark-accent text-gray-300 hover:bg-dark-accent"
                        }`}
                        onClick={() => field.onChange("monthly")}
                      >
                        Maaş
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "daily" ? "default" : "outline"}
                        className={`flex-1 ${
                          field.value === "daily" 
                            ? "bg-green-500 hover:bg-green-600 text-white border-green-500" 
                            : "bg-dark-primary border-dark-accent text-gray-300 hover:bg-dark-accent"
                        }`}
                        onClick={() => field.onChange("daily")}
                      >
                        Günlük
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => {
                const salaryType = form.watch("salaryType");
                return (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      {salaryType === "monthly" ? "Maaş (TL)" : "Günlük Ücret (TL)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder={salaryType === "monthly" ? "Aylık maaş tutarı" : "Günlük ücret tutarı"}
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                onClick={handleClose}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                disabled={createPersonnelMutation.isPending || updatePersonnelMutation.isPending}
              >
                {(createPersonnelMutation.isPending || updatePersonnelMutation.isPending) ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}