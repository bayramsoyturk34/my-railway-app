import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationCardProps {
  icon: LucideIcon;
  title?: string;
  label?: string;
  description?: string;
  color?: string;
  onClick: () => void;
  iconColor?: string;
}

export default function NavigationCard({ 
  icon: Icon, 
  title,
  label, 
  description,
  color,
  onClick, 
  iconColor = "text-blue-400" 
}: NavigationCardProps) {
  const displayTitle = title || label;
  const displayColor = color ? `text-${color}-500` : iconColor;
  
  return (
    <button
      onClick={onClick}
      className="bg-card hover:bg-accent transition-colors p-6 rounded-xl flex flex-col items-center gap-3 border border-border text-left w-full group"
    >
      <Icon className={cn("h-8 w-8", displayColor)} />
      <span className="text-foreground font-semibold text-center text-lg">{displayTitle}</span>
      {description && (
        <span className="text-muted-foreground text-sm text-center">{description}</span>
      )}
    </button>
  );
}
