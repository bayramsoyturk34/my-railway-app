import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: InsertCustomer) => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);

    // Clean data
    const cleanedData = {
      name: data.name,
      company: data.company || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      taxNumber: data.taxNumber || null,
      status: data.status,
    };

    try {
      let result;
      if (customer) {
        // Update existing customer
        result = await apiRequest(`/api/customers/${customer.id}`, "PUT", cleanedData);
        console.log("✅ Update success:", result);
        toast({
          title: "Başarılı",
          description: "Müşteri kaydı güncellendi.",
        });
      } else {
        // Create new customer
        result = await apiRequest("/api/customers", "POST", cleanedData);
        console.log("✅ Create success:", result);
        toast({
          title: "Başarılı",
          description: "Müşteri kaydı oluşturuldu.",
        });
      }
      
      // Success handling - only if we get here
      console.log("✅ Running success handling...");
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      form.reset();
      onOpenChange(false);
      
    } catch (error) {
      console.error("❌ Customer operation failed:", error);
      toast({
        title: "Hata",
        description: customer ? "Müşteri kaydı güncellenemedi." : "Müşteri kaydı oluşturulamadı.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {customer ? "Müşteri Düzenle" : "Yeni Müşteri"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Müşteri Adı *</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-dark-primary border-dark-accent text-white"
                        placeholder="Müşteri adı"
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
                        placeholder="Şirket adı"
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Telefon</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
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

            <div className="flex gap-3 pt-4">
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Kaydediliyor..." : (customer ? "Güncelle" : "Kaydet")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}