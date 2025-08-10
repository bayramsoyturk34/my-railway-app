import { Home, Users, Briefcase, Wallet, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  total: string;
  activeLabel: string;
  activeValue: string;
  passiveLabel: string;
  passiveValue: string;
  type: "orange" | "teal" | "blue" | "green" | "purple";
  icon?: "home" | "users" | "briefcase" | "wallet" | "calculator";
}

export default function ProjectCard({
  title,
  total,
  activeLabel,
  activeValue,
  passiveLabel,
  passiveValue,
  type,
  icon = "home"
}: ProjectCardProps) {
  const getIconComponent = () => {
    switch (icon) {
      case "home": return Home;
      case "users": return Users;
      case "briefcase": return Briefcase;
      case "wallet": return Wallet;
      case "calculator": return Calculator;
      default: return Home;
    }
  };
  
  const IconComponent = getIconComponent();
  
  const getGradientClass = () => {
    switch (type) {
      case "orange": return "gradient-orange";
      case "teal": return "gradient-teal";
      case "blue": return "bg-gradient-to-br from-blue-500 to-blue-700";
      case "green": return "bg-gradient-to-br from-green-500 to-green-700";
      case "purple": return "bg-gradient-to-br from-purple-500 to-purple-700";
      default: return "gradient-orange";
    }
  };
  
  return (
    <div className={cn(
      "rounded-xl p-6 text-white relative overflow-hidden",
      getGradientClass()
    )}>
      <div className="absolute top-4 right-4">
        <IconComponent className="h-8 w-8 text-white/30" />
      </div>
      
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-4">{total}</div>
      
      <div className="flex justify-between text-sm opacity-90">
        <div>
          <span className="font-medium">{activeLabel}</span>
          <div className="font-bold">{activeValue}</div>
        </div>
        <div>
          <span className="font-medium">{passiveLabel}</span>
          <div className="font-bold">{passiveValue}</div>
        </div>
      </div>
    </div>
  );
}
