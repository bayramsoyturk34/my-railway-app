import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Login() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/auth/login", "POST", {
        email: data.email,
        password: data.password,
        isDemo: false,
      });
    },
    onSuccess: async (data) => {
      console.log("Login success:", data);
      
      // Store session ID in localStorage (30 days server-side expiry)
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        console.log("Session ID stored:", data.sessionId);
        
        // Clear auth cache to refresh user data
        queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
        
        // Invalidate auth query to trigger re-fetch
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
      
      toast({
        title: "Başarıyla giriş yapıldı!",
        description: "PuantajPro'ya hoş geldiniz.",
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Giriş başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const demoLoginMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/login", "POST", { isDemo: true });
    },
    onSuccess: async (data) => {
      console.log("Demo login success:", data);
      
      // Store session ID in localStorage (30 days server-side expiry)
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        console.log("Demo Session ID stored:", data.sessionId);
        
        // Clear auth cache to refresh user data
        queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
        
        // Invalidate auth query to trigger re-fetch
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
      
      toast({
        title: "Demo hesabına giriş yapıldı!",
        description: "PuantajPro'yu keşfedin.",
      });
    },
    onError: (error: Error) => {
      console.error("Demo login error:", error);
      toast({
        title: "Demo giriş başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Giriş Yap</CardTitle>
          <CardDescription className="text-gray-400">
            PuantajPro hesabınıza giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="email@ornek.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Şifreniz"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
          
          <div className="mt-4">
            <Button
              onClick={() => demoLoginMutation.mutate()}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              disabled={demoLoginMutation.isPending}
            >
              {demoLoginMutation.isPending ? "Demo giriş yapılıyor..." : "Demo Giriş Yap"}
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Hesabınız yok mu?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300">
                Kayıt olun
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}