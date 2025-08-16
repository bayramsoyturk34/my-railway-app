import React from "react";
import { Menu, Settings, LogOut, User, Shield, UserCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export default function Header({ onMenuClick, onSettingsClick }: HeaderProps) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch notifications for authenticated users
  const { data: notifications = [], error: notificationError, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !authLoading && isAuthenticated && !!user,
    refetchInterval: (!authLoading && isAuthenticated && user) ? 3000 : false,
    retry: false,
  });

  // Gerçek API verilerini kullan - fallback test verileri kaldırıldı
  const finalNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = finalNotifications?.filter((n: any) => !n.isRead)?.length || 0;

  // Debug log for notifications
  console.log("🔔 All notifications:", notifications);
  console.log("🔔 Notifications count:", finalNotifications?.length || 0);
  console.log("🔔 First notification:", finalNotifications?.[0] || null);
  console.log("🔔 Unread Count:", unreadCount);
  console.log("🔔 Should show badge:", unreadCount > 0);
  console.log("🔔 User exists:", !!user);
  
  // Force check notifications immediately when user changes
  React.useEffect(() => {
    if (user) {
      console.log("🔔 User changed, user ID:", user.id);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    try {
      await apiRequest("PATCH", `/api/notifications/${notification.id}/read`);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }

    // Handle navigation based on notification type
    if (notification.type === 'NEW_MESSAGE') {
      const payload = notification.payload;
      if (payload?.fromCompanyId) {
        setLocation(`/messages?thread=${payload.fromCompanyId}`);
      }
    }
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
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              (user as any).subscriptionType === 'PRO' 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {(user as any).subscriptionType || 'DEMO'}
            </span>
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

        {/* Test - Bildirim ikonunu zorla göster */}
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:bg-dark-accent relative border-2 border-red-500"
          title="TEST - Bildirim Butonu"
        >
          <Bell className="h-8 w-8" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs bg-red-500"
          >
            1
          </Badge>
        </Button>

        {/* Notifications */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-dark-accent relative"
                title={`Bildirimler (${unreadCount} okunmamış)`}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-dark-secondary border-dark-accent">
              <div className="p-3 border-b border-dark-accent">
                <h3 className="font-semibold text-white">Bildirimler</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-400">{unreadCount} okunmamış bildirim</p>
                )}
              </div>
              
              {finalNotifications && finalNotifications.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {finalNotifications.slice(0, 10).map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-3 cursor-pointer hover:bg-dark-accent border-b border-dark-accent last:border-b-0"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.isRead ? 'bg-gray-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {notification.type === 'NEW_MESSAGE' ? 'Yeni Mesaj' : notification.title}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {notification.type === 'NEW_MESSAGE' 
                              ? `${notification.payload?.fromCompanyName || 'Bilinmeyen'} size mesaj gönderdi`
                              : notification.content
                            }
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(notification.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Henüz bildirim yok</p>
                </div>
              )}
              
              {finalNotifications && finalNotifications.length > 10 && (
                <div className="p-3 border-t border-dark-accent">
                  <Button
                    variant="ghost"
                    className="w-full text-blue-400 hover:bg-dark-accent"
                    onClick={() => setLocation("/notifications")}
                  >
                    Tüm bildirimleri görüntüle
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
