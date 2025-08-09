import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertContractorPaymentSchema, type InsertContractorPayment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ContractorPaymentFormProps {
  contractorId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContractorPaymentForm({ contractorId, open, onOpenChange }: ContractorPaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertContractorPayment>({
    resolver: zodResolver(insertContractorPaymentSchema),
    defaultValues: {
      contractorId,
      amount: "",
      description: "",
      paymentDate: new Date(),
      paymentMethod: "cash",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: InsertContractorPayment) => {
      const response = await fetch("/api/contractor-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contractor-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contractor-payments", "contractor", contractorId] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({
        title: "Başarılı",
        description: "Ödeme başarıyla yapıldı ve kasa gider kaydı oluşturuldu.",
      });
      form.reset({
        contractorId,
        amount: "",
        description: "",
        paymentDate: new Date(),
        paymentMethod: "cash",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Ödeme yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContractorPayment) => {
    createPaymentMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto bg-dark-secondary border-dark-accent">
        <DialogHeader>
          <DialogTitle className="text-white">Yüklenici Ödemesi</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Ödeme Tutarı (₺)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-dark-primary border-dark-accent text-white placeholder:text-gray-400"
                      {...field} 
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
                  <FormLabel className="text-white">Ödeme Açıklaması</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ödeme açıklaması"
                      className="bg-dark-primary border-dark-accent text-white placeholder:text-gray-400"
                      rows={2}
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
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Ödeme Yöntemi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "cash"}>
                    <FormControl>
                      <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                        <SelectValue placeholder="Ödeme yöntemi seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-secondary border-dark-accent">
                      <SelectItem value="cash">Nakit</SelectItem>
                      <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                      <SelectItem value="check">Çek</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-white">Ödeme Tarihi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="bg-dark-primary border-dark-accent text-white hover:bg-dark-accent w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span className="text-gray-400">Tarih seçiniz</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-dark-secondary border-dark-accent" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-transparent border-dark-accent text-white hover:bg-dark-accent"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createPaymentMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {createPaymentMutation.isPending ? "Ödeme Yapılıyor..." : "Ödeme Yap"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}