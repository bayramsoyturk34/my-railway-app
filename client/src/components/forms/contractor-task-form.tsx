import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertContractorTaskSchema, type InsertContractorTask } from "@shared/schema";
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

interface ContractorTaskFormProps {
  contractorId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: any;
}

export default function ContractorTaskForm({ contractorId, open, onOpenChange, editingTask }: ContractorTaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertContractorTask>({
    resolver: zodResolver(insertContractorTaskSchema),
    defaultValues: {
      contractorId,
      title: editingTask?.title || "",
      description: editingTask?.description || "",
      amount: editingTask?.amount || "",
      status: editingTask?.status || "pending",
      dueDate: editingTask?.dueDate ? new Date(editingTask.dueDate) : undefined,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertContractorTask) => {
      const url = editingTask ? `/api/contractor-tasks/${editingTask.id}` : "/api/contractor-tasks";
      const method = editingTask ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Failed to ${editingTask ? 'update' : 'create'} task`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contractor-tasks"] });
      queryClient.invalidateQueries({ queryKey: ['/api/contractor-tasks/contractor/' + contractorId] });
      toast({
        title: "Başarılı",
        description: editingTask ? "Görev başarıyla güncellendi." : "Görev başarıyla eklendi.",
      });
      form.reset({
        contractorId,
        title: "",
        description: "",
        amount: "",
        status: "pending",
        dueDate: undefined,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: editingTask ? "Görev güncellenirken bir hata oluştu." : "Görev eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Form değerlerini editingTask değiştiğinde güncelle
  useEffect(() => {
    if (editingTask) {
      form.reset({
        contractorId,
        title: editingTask.title || "",
        description: editingTask.description || "",
        amount: editingTask.amount || "",
        status: editingTask.status || "pending",
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : undefined,
      });
    } else {
      form.reset({
        contractorId,
        title: "",
        description: "",
        amount: "",
        status: "pending",
        dueDate: undefined,
      });
    }
  }, [editingTask, contractorId, form]);

  const onSubmit = (data: InsertContractorTask) => {
    createTaskMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto bg-dark-secondary border-dark-accent">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingTask ? "Görevi Düzenle" : "Yeni Görev Ekle"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Görev Başlığı</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Görev başlığını giriniz"
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
                  <FormLabel className="text-white">Açıklama</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Görev açıklaması"
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tutar (₺)</FormLabel>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Durum</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-dark-primary border-dark-accent text-white">
                        <SelectValue placeholder="Durum seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-secondary border-dark-accent">
                      <SelectItem value="pending">Bekliyor</SelectItem>
                      <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-white">Bitiş Tarihi</FormLabel>
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
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
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
                disabled={createTaskMutation.isPending}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {createTaskMutation.isPending ? "Ekleniyor..." : "Görev Ekle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}