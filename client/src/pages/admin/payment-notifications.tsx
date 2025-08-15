import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, User, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PaymentNotification {
  id: string;
  userId: string;
  paymentMethod: string;
  amount: number;
  paymentDate: string;
  referenceNumber?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function PaymentNotifications() {
  const [selectedNotification, setSelectedNotification] = useState<PaymentNotification | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminNote, setAdminNote] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: statusFilter === 'all' ? ['/api/admin/payment-notifications'] : ['/api/admin/payment-notifications', { status: statusFilter }],
    queryFn: () => statusFilter === 'all' 
      ? apiRequest('/api/admin/payment-notifications', 'GET')
      : apiRequest(`/api/admin/payment-notifications?status=${statusFilter}`, 'GET')
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) => {
      return apiRequest(`/api/admin/payment-notifications/${id}`, 'PUT', { status, adminNote });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Ödeme bildirimi durumu güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-notifications'] });
      setSelectedNotification(null);
      setAdminNote('');
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Durum güncellenirken hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (status: 'approved' | 'rejected') => {
    if (!selectedNotification) return;
    
    updateStatusMutation.mutate({
      id: selectedNotification.id,
      status,
      adminNote: adminNote.trim() || undefined
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Beklemede
        </Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <Check className="w-3 h-3 mr-1" />
          Onaylandı
        </Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <X className="w-3 h-3 mr-1" />
          Reddedildi
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ödeme Bildirimleri</h1>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
              <SelectItem value="approved">Onaylandı</SelectItem>
              <SelectItem value="rejected">Reddedildi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {notifications?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Henüz ödeme bildirimi bulunmuyor.</p>
            </CardContent>
          </Card>
        ) : (
          notifications?.map((notification: PaymentNotification) => (
            <Card key={notification.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>
                      {notification.user?.firstName} {notification.user?.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground font-normal">
                      ({notification.user?.email})
                    </span>
                  </CardTitle>
                  {getStatusBadge(notification.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ödeme Yöntemi</p>
                    <p className="font-medium">{notification.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tutar</p>
                    <p className="font-medium flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ₺{notification.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ödeme Tarihi</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(notification.paymentDate), 'dd MMM yyyy', { locale: tr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Referans No</p>
                    <p className="font-medium">{notification.referenceNumber || '-'}</p>
                  </div>
                </div>
                
                {notification.description && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Açıklama</p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      {notification.description}
                    </p>
                  </div>
                )}

                {notification.adminNote && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Admin Notu</p>
                    <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      {notification.adminNote}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Bildirim: {format(new Date(notification.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </span>
                  {notification.status === 'pending' && (
                    <Button
                      onClick={() => {
                        setSelectedNotification(notification);
                        setAdminNote('');
                      }}
                      size="sm"
                      variant="outline"
                    >
                      İşlem Yap
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog 
        open={!!selectedNotification} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNotification(null);
            setAdminNote('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme Bildirimini Değerlendir</DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="font-medium mb-2">
                  {selectedNotification.user?.firstName} {selectedNotification.user?.lastName}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Tutar:</span>
                  <span className="font-medium">₺{selectedNotification.amount}</span>
                  <span>Yöntem:</span>
                  <span>{selectedNotification.paymentMethod}</span>
                  <span>Tarih:</span>
                  <span>
                    {format(new Date(selectedNotification.paymentDate), 'dd MMM yyyy', { locale: tr })}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Admin Notu (Opsiyonel)
                </label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ödeme ile ilgili notlarınızı buraya yazın..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Onayla
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updateStatusMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reddet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}