import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationCardProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  iconColor?: string;
}

export default function NavigationCard({ 
  icon: Icon, 
  label, 
  onClick, 
  iconColor = "text-blue-400" 
}: NavigationCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-dark-secondary hover:bg-gray-100 dark:hover:bg-dark-accent transition-colors p-6 rounded-xl flex flex-col items-center gap-3 border border-gray-200 dark:border-dark-accent"
    >
      <Icon className={cn("text-2xl", iconColor)} />
      <span className="text-gray-800 dark:text-white font-medium text-center">{label}</span>
    </button>
  );
}
