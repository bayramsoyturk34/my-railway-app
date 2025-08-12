import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertPersonnelPaymentSchema, type PersonnelPayment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const formSchema = insertPersonnelPaymentSchema.extend({
  paymentDate: z.date(),
  amount: z.string().min(1, "Tutar gerekli"),
});

type FormData = z.infer<typeof formSchema>;

interface PersonnelPaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnelId: string;
  personnelName: string;
  payment?: PersonnelPayment;
}

function PersonnelPaymentForm({
  open,
  onOpenChange,
  personnelId,
  personnelName,
  payment,
}: PersonnelPaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personnelId,
      amount: payment?.amount || "",
      paymentDate: payment?.paymentDate ? new Date(payment.paymentDate) : new Date(),
      paymentType: payment?.paymentType || "salary",
      description: payment?.description || "",
      notes: payment?.notes || "",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const endpoint = payment 
        ? `/api/personnel-payments/${payment.id}`
        : "/api/personnel-payments";
      const method = payment ? "PUT" : "POST";
      
      console.log("Submitting personnel payment data:", data);
      // Backend will automatically create the transaction, no need for manual API call
      const paymentResult = await apiRequest(endpoint, method, data);
      
      return paymentResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personnel-payments", "personnel", personnelId] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({
        title: "Başarılı",
        description: payment ? "Ödeme güncellendi." : "Ödeme kaydı oluşturuldu ve otomatik olarak kasa giderlerine eklendi.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Personnel payment error:", error);
      toast({
        title: "Hata",
        description: "Ödeme kaydı oluşturulamadı.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createPaymentMutation.mutate(data);
  };

  const paymentTypes = [
    { value: "salary", label: "Maaş" },
    { value: "bonus", label: "Prim/Bonus" },
    { value: "advance", label: "Avans" },
    { value: "deduction", label: "Kesinti" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border-dark-accent text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {payment ? "Ödeme Düzenle" : "Yeni Ödeme"}
          </DialogTitle>
          <p className="text-gray-400 text-sm">{personnelName}</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Ödeme Türü</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                        <SelectValue placeholder="Ödeme türünü seçin..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-primary border-dark-accent">
                      {paymentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white hover:bg-dark-accent">
                          {type.label}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Tutar (TL)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="bg-dark-primary border-dark-accent text-white"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Ödeme Tarihi</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Açıklama</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-dark-primary border-dark-accent text-white"
                      placeholder="Ödeme açıklaması..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Not</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-dark-primary border-dark-accent text-white h-20"
                      placeholder="Ek notlar..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4 mt-6 border-t border-gray-600">
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
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                disabled={createPaymentMutation.isPending}
              >
                {createPaymentMutation.isPending ? "Kaydediliyor..." : payment ? "Güncelle" : "Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default PersonnelPaymentForm;