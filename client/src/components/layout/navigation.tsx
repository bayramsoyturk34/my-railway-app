import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  Building, 
  CalendarDays, 
  Wallet, 
  UserCheck,
  FileBarChart,
  Settings 
} from "lucide-react";

interface NavigationItem {
  path: string;
  label: string;
  icon: any;
  color: string;
}

const navigationItems: NavigationItem[] = [
  { path: "/", label: "Ana Sayfa", icon: Home, color: "text-blue-400" },
  { path: "/personnel", label: "Personel", icon: Users, color: "text-green-400" },
  { path: "/projects", label: "Projeler", icon: Building, color: "text-purple-400" },
  { path: "/timesheet", label: "Puantaj", icon: CalendarDays, color: "text-cyan-400" },
  { path: "/finances", label: "Finans", icon: Wallet, color: "text-yellow-400" },
  { path: "/customers", label: "Müşteriler", icon: UserCheck, color: "text-orange-400" },
  { path: "/reports", label: "Raporlar", icon: FileBarChart, color: "text-pink-400" },
];

export default function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <Card className="bg-dark-secondary border-dark-accent mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className={`flex flex-col items-center gap-2 h-auto py-3 px-2 ${
                  isActive 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "hover:bg-dark-accent text-gray-300 hover:text-white"
                }`}
                onClick={() => setLocation(item.path)}
              >
                <IconComponent className={`h-5 w-5 ${isActive ? "text-white" : item.color}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}