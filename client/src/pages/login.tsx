import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
    onSuccess: (data) => {
      // Cookie automatically set by server, just redirect
      if (data.success) {
        window.location.href = '/';
      }
    },
    onError: (error: Error) => {
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
    onSuccess: (data) => {
      // Cookie automatically set by server, just redirect
      if (data.success) {
        window.location.href = '/';
      }
    },
    onError: (error: Error) => {
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
            puantropls hesabınıza giriş yapın
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
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="Email adresinizi girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="Şifrenizi girin"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              className="w-full bg-green-600 hover:bg-green-700 text-white border-green-600"
              onClick={() => demoLoginMutation.mutate()}
              disabled={demoLoginMutation.isPending}
            >
              {demoLoginMutation.isPending ? "Demo yükleniyor..." : "Demo Hesabı İle Giriş"}
            </Button>
          </div>

          <div className="mt-4 text-center">
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