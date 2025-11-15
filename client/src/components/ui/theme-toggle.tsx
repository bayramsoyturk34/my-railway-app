import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${className}`}
      title={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-500 transition-all duration-200" />
      ) : (
        <Moon className="h-4 w-4 text-blue-600 transition-all duration-200" />
      )}
      <span className="sr-only">Tema değiştir</span>
    </Button>
  );
}