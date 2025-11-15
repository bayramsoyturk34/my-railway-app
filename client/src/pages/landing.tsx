import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Clock, DollarSign, BarChart3, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/login", "POST", { isDemo: true });
    },
    onSuccess: async (data) => {
      console.log("Login success:", data);
      
      // Store session ID in localStorage
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        console.log("Session ID stored:", data.sessionId);
        
        // Clear auth cache and force re-fetch
        queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
        
        // Trigger immediate auth refetch instead of page reload
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        // Navigate to dashboard without page reload
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
      
      toast({
        title: "Başarıyla giriş yapıldı!",
        description: "puantropls'ya hoş geldiniz.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
            puantropls
          </h1>
          <p className="text-2xl text-gray-100 mb-8 max-w-3xl mx-auto font-medium leading-relaxed">
            Türkiye'nin en gelişmiş personel puantaj ve proje yönetim sistemi. 
            İş gücü verimliliğinizi artırın, finansal takibinizi optimize edin.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={() => loginMutation.mutate()}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-10 py-5 rounded-xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Demo Giriş Yap"}
            </Button>
            
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-2 border-orange-400 text-orange-300 hover:bg-orange-500 hover:text-white px-8 py-5 text-xl font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-500 hover:text-black px-8 py-5 text-xl font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-blue-900/80 to-blue-800/60 border-2 border-blue-400/50 backdrop-blur-sm shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="h-10 w-10 text-blue-300" />
                <CardTitle className="text-white text-xl font-bold">Puantaj Yönetimi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100 text-base leading-relaxed">
                Personel çalışma saatlerini kolayca takip edin. Otomatik hesaplama ve raporlama sistemi.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/80 to-green-800/60 border-2 border-green-400/50 backdrop-blur-sm shadow-2xl hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-10 w-10 text-green-300" />
                <CardTitle className="text-white text-xl font-bold">Personel Yönetimi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-100 text-base leading-relaxed">
                Kapsamlı personel kayıtları, maaş takibi ve performans analizi.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/80 to-purple-800/60 border-2 border-purple-400/50 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-10 w-10 text-purple-300" />
                <CardTitle className="text-white text-xl font-bold">Proje Takibi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-100 text-base leading-relaxed">
                Müşteri projeleri, teklif sistemi ve iş akışı yönetimi.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/80 to-yellow-800/60 border-2 border-yellow-400/50 backdrop-blur-sm shadow-2xl hover:shadow-yellow-500/30 transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="h-10 w-10 text-yellow-300" />
                <CardTitle className="text-white text-xl font-bold">Finansal Takip</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-yellow-100 text-base leading-relaxed">
                Gelir-gider takibi, otomatik kasa yönetimi ve finansal raporlar.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/80 to-red-800/60 border-2 border-red-400/50 backdrop-blur-sm shadow-2xl hover:shadow-red-500/30 transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-10 w-10 text-red-300" />
                <CardTitle className="text-white text-xl font-bold">Analytics & Raporlar</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-red-100 text-base leading-relaxed">
                Detaylı analitik raporlar ve performans metrikleri.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/80 to-indigo-800/60 border-2 border-indigo-400/50 backdrop-blur-sm shadow-2xl hover:shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-10 w-10 text-indigo-300" />
                <CardTitle className="text-white text-xl font-bold">Firma Rehberi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-indigo-100 text-base leading-relaxed">
                Diğer firmalarla iletişim ve mesajlaşma sistemi.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-orange-900/80 to-red-900/80 border-2 border-orange-400/50 backdrop-blur-sm max-w-2xl mx-auto shadow-2xl hover:shadow-orange-500/40 transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-3xl text-white font-bold">Hemen Başlayın</CardTitle>
              <CardDescription className="text-orange-100 text-lg leading-relaxed">
                puantropls ile iş süreçlerinizi dijitalleştirin ve verimliliğinizi artırın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-2xl transform hover:scale-110 transition-all duration-200"
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