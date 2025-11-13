import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Wrench } from "lucide-react";

export default function MaintenanceCheck() {
  const { user } = useAuth();
  
  // Check maintenance status
  const { data: settings } = useQuery({
    queryKey: ["/api/admin/settings"],
    enabled: !!user, // Only run if user is logged in
  });

  const settingsMap = Array.isArray(settings) ? settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {}) : {};

  const isMaintenanceMode = settingsMap.maintenance_mode === "true";
  const isAdmin = user && ((user as any).role === 'ADMIN' || (user as any).role === 'SUPER_ADMIN');

  // If maintenance mode is active and user is not admin, show maintenance page
  if (isMaintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-6">
            <Wrench className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Sistem Bakımda
          </h1>
          
          <p className="text-gray-300 mb-6">
            PuantajPro şu anda bakım modunda. Sistem yöneticileri gerekli güncellemeleri yapmaktadır.
          </p>
          
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              Bakım işlemleri tamamlandıktan sonra sisteme tekrar erişebileceksiniz.
              Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
          
          <p className="text-gray-400 text-sm">
            Acil durumlar için sistem yöneticinizle iletişime geçin.
          </p>
        </div>
      </div>
    );
  }

  return null; // Don't render anything if not in maintenance mode or user is admin
}