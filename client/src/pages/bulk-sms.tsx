import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Home, MessageSquare, Send, Users, Phone, Clock, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  category: 'personnel' | 'customer' | 'general';
}

interface SMSRecipient {
  id: string;
  name: string;
  phone: string;
  type: 'personnel' | 'customer';
  selected?: boolean;
}

interface SMSHistory {
  id: string;
  message: string;
  recipientCount: number;
  sentAt: string;
  status: 'pending' | 'sent' | 'failed';
  cost: number;
}

const smsTemplates: SMSTemplate[] = [
  {
    id: 'salary-notification',
    name: 'Maaş Bildirimi',
    content: 'Sayın {name}, {month} ayı maaşınız hesabınıza yatırılmıştır. İyi çalışmalar.',
    category: 'personnel'
  },
  {
    id: 'meeting-reminder',
    name: 'Toplantı Hatırlatması',
    content: 'Sayın {name}, yarın saat {time}\'da toplantımız bulunmaktadır. Katılımınızı bekleriz.',
    category: 'personnel'
  },
  {
    id: 'project-update',
    name: 'Proje Güncellemesi',
    content: 'Merhaba {name}, {project} projeniz ile ilgili güncelleme: {message}',
    category: 'customer'
  },
  {
    id: 'payment-reminder',
    name: 'Ödeme Hatırlatması',
    content: 'Sayın {name}, {amount} TL tutarındaki borcunuzun son ödeme tarihi yaklaşmaktadır.',
    category: 'customer'
  },
  {
    id: 'holiday-greeting',
    name: 'Bayram Tebriği',
    content: 'Bayramınız mübarek olsun! Sağlık ve mutluluk dolu günler dileriz.',
    category: 'general'
  }
];

export default function BulkSMSPage() {
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [recipientType, setRecipientType] = useState<'all' | 'personnel' | 'customer'>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch personnel and customers
  const { data: personnel = [] } = useQuery<any[]>({
    queryKey: ["/api/personnel"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: smsHistory = [] } = useQuery<SMSHistory[]>({
    queryKey: ["/api/sms/history"],
  });

  // Combine recipients
  const allRecipients: SMSRecipient[] = [
    ...personnel.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone || '',
      type: 'personnel' as const
    })),
    ...customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      type: 'customer' as const
    }))
  ].filter(r => r.phone); // Only include recipients with phone numbers

  const filteredRecipients = allRecipients.filter(r => 
    recipientType === 'all' || r.type === recipientType
  );

  const sendSMSMutation = useMutation({
    mutationFn: async (data: {
      message: string;
      recipients: string[];
      templateId?: string;
    }) => {
      return await apiRequest("/api/sms/send", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "SMS Gönderildi",
        description: "Toplu SMS başarıyla gönderildi.",
      });
      setCustomMessage("");
      setSelectedRecipients([]);
      setSelectedTemplate("");
      queryClient.invalidateQueries({ queryKey: ["/api/sms/history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "SMS Gönderimi Başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = smsTemplates.find(t => t.id === templateId);
    if (template) {
      setCustomMessage(template.content);
    }
  };

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId) 
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredRecipients.map(r => r.id));
    }
  };

  const handleSendSMS = () => {
    if (!customMessage.trim()) {
      toast({
        title: "Hata",
        description: "Mesaj içeriği boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    if (selectedRecipients.length === 0) {
      toast({
        title: "Hata", 
        description: "En az bir alıcı seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    const characterCount = customMessage.length;
    const smsCount = Math.ceil(characterCount / 160);
    const estimatedCost = selectedRecipients.length * smsCount * 0.08; // 0.08 TL per SMS

    if (window.confirm(
      `${selectedRecipients.length} kişiye ${smsCount} SMS gönderilecek.\n` +
      `Tahmini maliyet: ${estimatedCost.toFixed(2)} TL\n` +
      `Göndermek istediğinizden emin misiniz?`
    )) {
      sendSMSMutation.mutate({
        message: customMessage,
        recipients: selectedRecipients,
        templateId: selectedTemplate || undefined
      });
    }
  };

  const messageLength = customMessage.length;
  const smsCount = Math.ceil(messageLength / 160);
  const estimatedCost = selectedRecipients.length * smsCount * 0.08;

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-white"
          >
            <Home className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Toplu SMS</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SMS Composition */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selection */}
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  SMS Şablonları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="bg-dark-accent border-gray-600 text-white">
                    <SelectValue placeholder="Hazır şablon seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-secondary border-gray-600">
                    {smsTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id} className="text-white hover:bg-dark-accent">
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Message Composition */}
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white">Mesaj İçeriği</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Mesaj Metni</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="SMS mesajınızı yazın..."
                      className="bg-dark-accent border-gray-600 text-white min-h-[120px]"
                      maxLength={1000}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      <span className={messageLength > 160 ? 'text-orange-400' : ''}>
                        {messageLength}/160 karakter
                      </span>
                      {smsCount > 1 && (
                        <span className="ml-2 text-orange-400">
                          ({smsCount} SMS)
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400">
                      Tahmini maliyet: {estimatedCost.toFixed(2)} TL
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recipients */}
          <div className="space-y-6">
            <Card className="bg-dark-secondary border-dark-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  Alıcılar ({selectedRecipients.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Alıcı Türü</Label>
                    <Select value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                      <SelectTrigger className="bg-dark-accent border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-secondary border-gray-600">
                        <SelectItem value="all" className="text-white hover:bg-dark-accent">
                          Tüm Kişiler
                        </SelectItem>
                        <SelectItem value="personnel" className="text-white hover:bg-dark-accent">
                          Sadece Personel
                        </SelectItem>
                        <SelectItem value="customer" className="text-white hover:bg-dark-accent">
                          Sadece Müşteriler
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="border-gray-600 text-gray-300 hover:bg-dark-accent"
                    >
                      {selectedRecipients.length === filteredRecipients.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                    </Button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredRecipients.map(recipient => (
                      <div
                        key={recipient.id}
                        className="flex items-center space-x-2 p-2 rounded border border-gray-600 hover:bg-dark-accent"
                      >
                        <Checkbox
                          checked={selectedRecipients.includes(recipient.id)}
                          onCheckedChange={() => handleRecipientToggle(recipient.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {recipient.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <p className="text-gray-400 text-xs">
                              {recipient.phone}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {recipient.type === 'personnel' ? 'Personel' : 'Müşteri'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Button */}
            <Button
              onClick={handleSendSMS}
              disabled={sendSMSMutation.isPending || !customMessage.trim() || selectedRecipients.length === 0}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendSMSMutation.isPending ? "Gönderiliyor..." : "SMS Gönder"}
            </Button>
          </div>
        </div>

        {/* SMS History */}
        <Card className="bg-dark-secondary border-dark-accent mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              SMS Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {smsHistory.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Henüz SMS gönderimi yapılmamış</p>
              </div>
            ) : (
              <div className="space-y-3">
                {smsHistory.map(sms => (
                  <div
                    key={sms.id}
                    className="flex items-center justify-between p-3 border border-gray-600 rounded hover:bg-dark-accent"
                  >
                    <div className="flex-1">
                      <p className="text-white text-sm line-clamp-2 mb-1">
                        {sms.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{sms.recipientCount} kişi</span>
                        <span>{new Date(sms.sentAt).toLocaleString('tr-TR')}</span>
                        <span>{sms.cost.toFixed(2)} TL</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sms.status === 'sent' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                      {sms.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      {sms.status === 'pending' && (
                        <Clock className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}