import { Menu, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Header({ onMenuClick, onSettingsClick }: HeaderProps) {
  const { user } = useAuth();

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
            <span>{user.firstName || user.email}</span>
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
          onClick={() => window.location.href = '/api/logout'}
          title="Çıkış Yap"
        >
          <LogOut className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
