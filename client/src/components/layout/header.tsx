import { Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Header({ onMenuClick, onSettingsClick }: HeaderProps) {
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
      
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-dark-accent"
        onClick={onSettingsClick}
      >
        <Settings className="h-6 w-6" />
      </Button>
    </header>
  );
}
