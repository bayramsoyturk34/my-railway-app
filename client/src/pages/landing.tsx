import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Clock, DollarSign, BarChart3, MessageSquare } from "lucide-react";

export default function Landing() {
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/login", "POST", {});
    },
    onSuccess: (data) => {
      console.log("Login success:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Başarıyla giriş yapıldı!",
        description: "PuantajPro'ya hoş geldiniz.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Giriş hatası",
        description: error.message || "Giriş yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            PuantajPro
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Türkiye'nin en gelişmiş personel puantaj ve proje yönetim sistemi. 
            İş gücü verimliliğinizi artırın, finansal takibinizi optimize edin.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Giriş Yap / Kaydol
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-400" />
                <CardTitle className="text-white">Puantaj Yönetimi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Personel çalışma saatlerini kolayca takip edin. Otomatik hesaplama ve raporlama sistemi.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-400" />
                <CardTitle className="text-white">Personel Yönetimi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Kapsamlı personel kayıtları, maaş takibi ve performans analizi.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-purple-400" />
                <CardTitle className="text-white">Proje Takibi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Müşteri projeleri, teklif sistemi ve iş akışı yönetimi.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-yellow-400" />
                <CardTitle className="text-white">Finansal Takip</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Gelir-gider takibi, otomatik kasa yönetimi ve finansal raporlar.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-red-400" />
                <CardTitle className="text-white">Analytics & Raporlar</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Detaylı analitik raporlar ve performans metrikleri.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-indigo-400" />
                <CardTitle className="text-white">Firma Rehberi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Diğer firmalarla iletişim ve mesajlaşma sistemi.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 border-blue-500/50 backdrop-blur-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Hemen Başlayın</CardTitle>
              <CardDescription className="text-gray-300">
                PuantajPro ile iş süreçlerinizi dijitalleştirin ve verimliliğinizi artırın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                onClick={handleLogin}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Giriş yapılıyor..." : "Demo Giriş Yap"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}