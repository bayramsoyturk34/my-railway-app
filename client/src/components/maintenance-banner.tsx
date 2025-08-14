import { AlertTriangle, Wrench } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MaintenanceBannerProps {
  isAdmin?: boolean;
}

export default function MaintenanceBanner({ isAdmin = false }: MaintenanceBannerProps) {
  if (!isAdmin) return null;

  return (
    <Alert className="bg-yellow-900/30 border-yellow-600 mb-4">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-200">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          <span>
            <strong>Bakım Modu Aktif:</strong> Sistem şu anda bakım modunda. 
            Normal kullanıcılar sisteme erişemiyor, sadece admin kullanıcılar aktif.
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}