import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Register() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    city: "",
    industry: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (data.password !== data.confirmPassword) {
        throw new Error("Şifreler eşleşmiyor");
      }
      
      return await apiRequest("/api/auth/register", "POST", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        phone: data.phone,
        city: data.city,
        industry: data.industry,
      });
    },
    onSuccess: (data) => {
      console.log("Register success:", data);
      
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        console.log("Register Session ID stored:", data.sessionId);
        
        // Set user in cache for faster loading
        queryClient.setQueryData(["/api/auth/user", data.sessionId], data.user);
        
        // Redirect immediately
        window.location.href = '/';
      }
    },
    onError: (error: Error) => {
      console.error("Register error:", error);
      toast({
        title: "Kayıt başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Kayıt Ol</CardTitle>
          <CardDescription className="text-gray-400">
            PuantajPro hesabınızı oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300">Ad</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Adınız"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300">Soyad</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Soyadınız"
                />
              </div>
            </div>
            
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
                placeholder="En az 6 karakter"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>
            
            {/* Firma Bilgileri Bölümü */}
            <div className="pt-4 border-t border-gray-600">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">Firma Bilgileri</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-300">Firma Adı</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Firma adınız"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0555 123 45 67"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-300">Şehir</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="İstanbul"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-gray-300">Sektör</Label>
                  <Input
                    id="industry"
                    type="text"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="İnşaat, Teknoloji, Gıda vs."
                  />
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                Giriş yapın
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}