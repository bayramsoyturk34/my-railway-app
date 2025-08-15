import { Link, useLocation } from "wouter";
import { 
  Settings, 
  Users, 
  CreditCard, 
  BarChart3, 
  Bell, 
  MessageSquare,
  FileText,
  Home,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const sidebarItems = [
    { href: "/admin/dashboard", icon: Home, label: "Ana Sayfa" },
    { href: "/admin/users", icon: Users, label: "Kullanıcılar" },
    { href: "/admin/payment-settings", icon: CreditCard, label: "Ödeme Ayarları" },
    { href: "/admin/payment-notifications", icon: Bell, label: "Ödeme Bildirimleri" },
    { href: "/admin/system-settings", icon: Settings, label: "Sistem Ayarları" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analitik" },
    { href: "/admin/messages", icon: MessageSquare, label: "Mesajlar" },
    { href: "/admin/reports", icon: FileText, label: "Raporlar" },
  ];

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <header className="bg-dark-secondary border-b border-dark-accent">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-gray-400">puantropls Yönetimi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-dark-accent">
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </Link>
            <Link href="/api/auth/logout">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-dark-accent">
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-dark-secondary border-r border-dark-accent min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-300 hover:bg-dark-accent hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card className="bg-dark-secondary border-dark-accent p-6">
            {children}
          </Card>
        </main>
      </div>
    </div>
  );
}