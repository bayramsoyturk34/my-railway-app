import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertCustomerSchema, type InsertCustomer, type Customer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
}

export default function CustomerForm({ open, onOpenChange, customer }: CustomerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: customer?.name || "",
      company: customer?.company || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      address: customer?.address || "",
      taxNumber: customer?.taxNumber || "",
      status: customer?.status || "active",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      console.log("🚀 Mutation starting...");
      const result = await apiRequest("/api/customers", "POST", data);
      console.log("✅ Mutation completed successfully:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("🎉 onSuccess triggered with data:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Başarılı",
        description: "Müşteri kaydı oluşturuldu.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.log("❌ onError triggered with error:", error);
      toast({
        title: "Hata",
        description: "Müşteri kaydı oluşturulamadı.",
        variant: "destructive",
      });
    },
    onMutate: () => {
      console.log("⏳ onMutate triggered");
    },
    onSettled: (data, error) => {
      console.log("🏁 onSettled triggered - data:", data, "error:", error);
    },
  }, queryClient);

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCustomer> }) => {
      return await apiRequest(`/api/customers/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Başarılı",
        description: "Müşteri kaydı güncellendi.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Müşteri kaydı güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCustomer) => {
    console.log("Form submitted with data:", data);
    console.log("Form validation errors:", form.formState.errors);
    
    const cleanedData = {
      ...data,
      company: data.company?.trim() || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      taxNumber: data.taxNumber?.trim() || null,
    };

    console.log("Cleaned data for submission:", cleanedData);

    if (customer) {
      console.log("Updating existing customer:", customer.id);
      updateCustomerMutation.mutate({ id: customer.id, data: cleanedData });
    } else {
      console.log("🎯 About to trigger mutation with:", cleanedData);
      console.log("🔍 Mutation status before:", {
        isIdle: createCustomerMutation.isIdle,
        isPending: createCustomerMutation.isPending,
        isError: createCustomerMutation.isError,
        isSuccess: createCustomerMutation.isSuccess
      });
      
      createCustomerMutation.mutate(cleanedData);
      
      // Check status after mutation call
      setTimeout(() => {
        console.log("🔍 Mutation status after:", {
          isIdle: createCustomerMutation.isIdle,
          isPending: createCustomerMutation.isPending,
          isError: createCustomerMutation.isError,
          isSuccess: createCustomerMutation.isSuccess,
          data: createCustomerMutation.data,
          error: createCustomerMutation.error
        });
      }, 100);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {customer ? "Müşteri Düzenle" : "Yeni Müşteri"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Müşteri Adı *</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-dark-primary border-dark-accent text-white"
                      placeholder="Müşteri adını girin"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Şirket</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-dark-primary border-dark-accent text-white"
                      placeholder="Şirket adını girin"
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Adres</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-dark-primary border-dark-accent text-white h-20"
                      placeholder="Müşteri adresi"
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Vergi No</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Vergi numarası"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Durum</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-primary border-dark-accent">
                        <SelectItem value="active" className="text-white">Aktif</SelectItem>
                        <SelectItem value="inactive" className="text-white">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
            />
          </div>

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
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
            >
              {(createCustomerMutation.isPending || updateCustomerMutation.isPending) 
                ? "Kaydediliyor..." 
                : customer 
                  ? "Güncelle" 
                  : "Kaydet"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
  );
}