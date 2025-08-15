import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, CreditCard, Building, Banknote } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";

const paymentSettingsSchema = z.object({
  bankName: z.string().min(1, "Banka adı gereklidir"),
  accountHolder: z.string().min(1, "Hesap sahibi gereklidir"),
  iban: z.string().min(1, "IBAN gereklidir"),
  amount: z.string().min(1, "Tutar gereklidir"),
  paymentMethod: z.string().min(1, "Ödeme yöntemi gereklidir"),
});

type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;

export default function PaymentSettings() {
  const { toast } = useToast();

  // Fetch current payment settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/payment-settings"],
  });

  const form = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      bankName: settings?.bankName || "Ziraat Bankası",
      accountHolder: settings?.accountHolder || "puantropls Ltd.",
      iban: settings?.iban || "TR64 0001 0017 4513 6456 7890 01",
      amount: settings?.amount || "99 TL",
      paymentMethod: settings?.paymentMethod || "EFT/Havale",
    },
  });

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        iban: settings.iban,
        amount: settings.amount,
        paymentMethod: settings.paymentMethod,
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: PaymentSettingsFormData) => {
      return apiRequest("/api/admin/payment-settings", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-settings"] });
      toast({
        title: "Başarılı",
        description: "Ödeme ayarları güncellendi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Güncelleme işlemi başarısız",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentSettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Yükleniyor...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Ödeme Ayarları</h1>
            <p className="text-gray-400">PRO üyelik ödeme bilgilerini yönetin</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <Card className="bg-dark-secondary border-dark-accent">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="h-5 w-5" />
                Banka Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Ödeme Yöntemi</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-dark-primary border-gray-600 text-white"
                              placeholder="EFT/Havale"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Banka</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-dark-primary border-gray-600 text-white"
                              placeholder="Ziraat Bankası"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Hesap Sahibi</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-dark-primary border-gray-600 text-white"
                              placeholder="puantropls Ltd."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="iban"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">IBAN</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-dark-primary border-gray-600 text-white"
                              placeholder="TR64 0001 0017 4513 6456 7890 01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Tutar</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-dark-primary border-gray-600 text-white"
                              placeholder="99 TL"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="bg-dark-secondary border-dark-accent">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Önizleme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-dark-primary p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Ödeme Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ödeme Yöntemi:</span>
                    <span className="text-white">{form.watch("paymentMethod")}</span>
                  </div>
                  <div className="bg-dark-accent p-3 rounded">
                    <h4 className="text-white font-medium mb-2">Banka Bilgileri:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Banka:</span>
                        <span className="text-white">{form.watch("bankName")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hesap Sahibi:</span>
                        <span className="text-white">{form.watch("accountHolder")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">IBAN:</span>
                        <span className="text-white font-mono text-xs">{form.watch("iban")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tutar:</span>
                        <span className="text-white font-bold">{form.watch("amount")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}