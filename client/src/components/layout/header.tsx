import { Menu, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Header({ onMenuClick, onSettingsClick }: HeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/logout", "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Başarıyla çıkış yapıldı",
        description: "Güle güle!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Çıkış hatası",
        description: error.message || "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex justify-between items-center p-4 bg-dark-primary border-b border-dark-accent">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-dark-accent"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <h1 className="text-xl font-bold text-white">PuantajPro</h1>
      
      <div className="flex items-center gap-2">
        {user && (
          <div className="flex items-center gap-2 text-white text-sm">
            <User className="h-4 w-4" />
            <span>{(user as any).firstName || (user as any).email || "Kullanıcı"}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-dark-accent"
          onClick={onSettingsClick}
        >
          <Settings className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-dark-accent"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          title="Çıkış Yap"
        >
          <LogOut className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
