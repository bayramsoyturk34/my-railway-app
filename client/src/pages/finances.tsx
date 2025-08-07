import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Wallet, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { type Transaction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import TransactionForm from "@/components/forms/transaction-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export default function FinancesPage() {
  const [, setLocation] = useLocation();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial-summary"],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/transactions/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({
        title: "Başarılı",
        description: "İşlem kaydı silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İşlem kaydı silinemedi.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-400' : 'text-red-400';
  };

  const getTypeText = (type: string) => {
    return type === 'income' ? 'Gelir' : 'Gider';
  };

  if (transactionsLoading) {
    return (
      <div className="min-h-screen bg-dark-primary text-white">
        <Header />
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-dark-accent"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Kasa Yönetimi</h1>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-500/20 border-green-500/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 text-2xl font-bold">
                {formatCurrency(summary?.totalIncome || 0)}
              </div>
              <div className="text-green-300 text-sm">Toplam Gelir</div>
            </CardContent>
          </Card>

          <Card className="bg-red-500/20 border-red-500/30">
            <CardContent className="p-4 text-center">
              <TrendingDown className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <div className="text-red-400 text-2xl font-bold">
                {formatCurrency(summary?.totalExpenses || 0)}
              </div>
              <div className="text-red-300 text-sm">Toplam Gider</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Wallet className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-blue-400 text-2xl font-bold">
                {formatCurrency(summary?.netBalance || 0)}
              </div>
              <div className="text-blue-300 text-sm">Net Bakiye</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setShowTransactionForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni İşlem
          </Button>
        </div>

        {transactions.length === 0 ? (
          <Card className="bg-dark-secondary border-dark-accent">
            <CardContent className="py-12 text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Henüz işlem kaydı eklenmemiş</p>
              <p className="text-gray-500 text-sm">Yeni işlem eklemek için yukarıdaki butonu kullanın.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const IconComponent = getTypeIcon(transaction.type);
              return (
                <Card key={transaction.id} className="bg-dark-secondary border-dark-accent">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-1">
                        <IconComponent className={`h-6 w-6 ${getTypeColor(transaction.type)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-white font-medium text-lg">{transaction.description}</h4>
                            <span className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{getTypeText(transaction.type)}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.date)}</span>
                            {transaction.category && (
                              <>
                                <span>•</span>
                                <span>{transaction.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-dark-accent"
                        onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                        disabled={deleteTransactionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <TransactionForm 
        open={showTransactionForm} 
        onOpenChange={setShowTransactionForm} 
      />
    </div>
  );
}
