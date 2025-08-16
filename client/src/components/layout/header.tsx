import { Menu, Settings, LogOut, User, Shield, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface HeaderProps {
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Header({ onMenuClick, onSettingsClick }: HeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    // Quick logout - clear storage and redirect immediately
    localStorage.clear();
    queryClient.clear();
    window.location.replace("/");
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-dark-primary border-b border-gray-200 dark:border-dark-accent">
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-accent"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">puantropls</h1>
      
      <div className="flex items-center gap-2">
        {user && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-white text-sm">
            <User className="h-4 w-4" />
            <span>{String((user as any).firstName || (user as any).email || "Kullanıcı")}</span>
          </div>
        )}
        
        {/* Account Button - for all authenticated users */}
        {user && (
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-400 hover:bg-dark-accent"
            onClick={() => window.location.href = "/account"}
            title="Hesabım"
          >
            <UserCircle className="h-6 w-6" />
          </Button>
        )}
        
        {/* Admin Panel Button - only for admins */}
        {user && (user as any).isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="text-purple-400 hover:bg-dark-accent"
            onClick={() => window.location.href = "/admin"}
            title="Admin Panel"
          >
            <Shield className="h-6 w-6" />
          </Button>
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

          title="Çıkış Yap"
        >
          <LogOut className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
