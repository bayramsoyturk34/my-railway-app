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

  // Debug notification query status
  console.log("🔔 Notification query debug:", {
    authLoading,
    isAuthenticated, 
    user: !!user,
    enabled: !authLoading && isAuthenticated && !!user,
    notificationError: notificationError?.message,
    notificationsLoading
  });

  // Gerçek API verilerini kullan - fallback test verileri kaldırıldı
  const finalNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = finalNotifications?.filter((n: any) => !n.isRead)?.length || 0;

  // Debug bilgileri temizlendi - sadece önemli log'lar
  if (finalNotifications.length > 0) {
    console.log(`🔔 ${finalNotifications.length} bildirim var, ${unreadCount} okunmamış`);
  }
  
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
      await apiRequest(`/api/notifications/${notification.id}/read`, "PATCH");
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }

    // Handle navigation based on notification type
    if (notification.type === 'NEW_MESSAGE' || notification.type === 'NEW_DM') {
      const payload = notification.payload;
      console.log("🔔 Navigation - payload:", payload);
      if (payload?.fromCompanyId) {
        console.log("🔔 Navigating to company directory with thread:", payload.fromCompanyId);
        setLocation(`/enhanced-company-directory?activeThread=${payload.fromCompanyId}`);
      }
    }
  };

  return (
    <header 
      data-header="true" 
      data-testid="header" 
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-2 sm:p-4 bg-background border-b border-border"
    >
      <Button
        variant="ghost"
        size="icon"
        className="text-header-icon hover:bg-accent transition-colors flex-shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      
      <button 
        onClick={() => setLocation("/")}
        className="text-sm sm:text-lg font-bold text-header-brand hover:text-nav-text-hover transition-colors cursor-pointer truncate mx-2"
        data-brand="puantroplus"
        data-testid="brand-button"
      >
        puantroplus
      </button>
      
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {user && (
          <div className="flex items-center gap-1 sm:gap-2 text-nav-text text-xs sm:text-sm">
            <User className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block text-header-icon" />
            <span className="hidden sm:inline truncate max-w-[100px]">{String((user as any).firstName || (user as any).email || "Kullanıcı")}</span>
            <span className={`px-1 sm:px-2 py-1 rounded text-xs font-semibold ${
              (user as any).subscriptionType === 'PRO' 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              {(user as any).subscriptionType || 'DEMO'}
            </span>
          </div>
        )}
        
        {/* Account Button - for all authenticated users */}
        {/* Moved to sidebar navigation */}
        
        {/* Admin Panel Button - only for admins */}
        {user && (user as any).isAdmin && (
          <Button
            variant="ghost"
            size="icon"
                className="text-purple-600 dark:text-purple-400 hover:bg-accent transition-colors"
            onClick={() => window.location.href = "/admin"}
            title="Admin Panel"
          >
            <Shield className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        )}

        {/* Notifications */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-header-icon hover:bg-accent transition-colors relative"
                title={`Bildirimler (${unreadCount} okunmam\u0131\u015f)`}
              >
                <Bell className="h-4 w-4 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80 bg-dark-secondary border-dark-accent">
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
                      className="p-3 cursor-pointer hover:bg-surface-hover border-b border-border last:border-b-0"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.isRead ? 'bg-muted-foreground' : 'bg-primary'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">
                            {notification.type === 'NEW_MESSAGE' ? 'Yeni Mesaj' : notification.title}
                          </p>
                          <p className="text-muted-foreground text-xs truncate">
                            {notification.type === 'NEW_MESSAGE' 
                              ? `${notification.payload?.fromCompanyName || 'Bilinmeyen'} size mesaj gönderdi`
                              : notification.content
                            }
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(notification.createdAt).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Henüz bildirim yok</p>
                </div>
              )}
              
              {finalNotifications && finalNotifications.length > 10 && (
                <div className="p-3 border-t border-border">
                  <Button
                    variant="ghost"
                    className="w-full text-primary hover:bg-surface-hover"
                    onClick={() => setLocation("/notifications")}
                  >
                    Tüm bildirimleri görüntüle
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Settings button removed - moved to sidebar */}
        <Button
          variant="ghost"
          size="icon"
          className="text-header-icon hover:bg-accent transition-colors"
          onClick={handleLogout}
          title="Çıkış Yap"
        >
          <LogOut className="h-4 w-4 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </header>
  );
}
