import { Home, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  total: string;
  activeLabel: string;
  activeValue: string;
  passiveLabel: string;
  passiveValue: string;
  type: "orange" | "teal";
  icon?: "home" | "users";
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
  const IconComponent = icon === "home" ? Home : Users;
  
  return (
    <div className={cn(
      "rounded-xl p-6 text-white relative overflow-hidden",
      type === "orange" ? "gradient-orange" : "gradient-teal"
    )}>
      <div className="absolute top-4 right-4">
        <IconComponent className="h-8 w-8 text-white/30" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-4">{total}</div>
      
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
