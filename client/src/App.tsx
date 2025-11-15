import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import MaintenanceCheck from "@/components/maintenance-check";

// Global theme management
function useGlobalTheme() {
  useEffect(() => {
    // Apply saved theme on app load
    const savedDarkTheme = localStorage.getItem('darkTheme');
    const savedCompactView = localStorage.getItem('compactView');
    
    const root = document.documentElement;
    
    // Apply dark theme - default to false (light theme) if not set
    if (savedDarkTheme === 'true') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      // Ensure light theme is default
      if (savedDarkTheme === null) {
        localStorage.setItem('darkTheme', 'false');
      }
    }
    
    // Apply compact view
    if (savedCompactView === 'true') {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }
  }, []);
}
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Personnel from "@/pages/personnel";
import PersonnelDetail from "@/pages/personnel-detail";
import Timesheet from "@/pages/timesheet";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail.tsx";
import Finances from "@/pages/finances";
import Customers from "@/pages/customers";
import ThemeTestPage from "@/pages/theme-test";
import CustomerDetail from "@/pages/customer-detail";
import CompanyDirectory from "@/pages/company-directory";
import EnhancedCompanyDirectory from "@/pages/enhanced-company-directory-fixed";
import Messages from "@/pages/messages";
import Reports from "@/pages/reports";
import AdminDashboard from "@/pages/admin-dashboard";
import BulkSMS from "@/pages/bulk-sms";
import AdminPanel from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import AdminAnnouncements from "@/pages/admin/announcements";
import AdminLogs from "@/pages/admin/logs";
import AdminSessions from "@/pages/admin/sessions";
import AdminPaymentNotifications from "@/pages/admin/payment-notifications";
import AdminPaymentSettings from "@/pages/admin/payment-settings";
import AdminGuard from "@/components/admin/AdminGuard";
import Account from "@/pages/account";
import Logout from "@/pages/logout";
import AiAssistant from "@/pages/ai-assistant";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  
  // Apply global theme settings
  useGlobalTheme();

  // Show authenticated routes if user is authenticated
  const shouldShowAuthenticatedRoutes = isAuthenticated && user;

  // Direct rendering for unauthenticated users
  if (!shouldShowAuthenticatedRoutes) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/api/auth/logout" component={Logout} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <>
      <MaintenanceCheck />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/personnel/:id" component={PersonnelDetail} />
      <Route path="/personnel" component={Personnel} />
      <Route path="/timesheet" component={Timesheet} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/projects" component={Projects} />
      <Route path="/finances" component={Finances} />
      <Route path="/customers/:customerName" component={CustomerDetail} />
      <Route path="/customers" component={Customers} />
      <Route path="/company-directory" component={EnhancedCompanyDirectory} />
      <Route path="/enhanced-company-directory" component={EnhancedCompanyDirectory} />
      <Route path="/messages" component={Messages} />
      <Route path="/reports" component={Reports} />
      <Route path="/bulk-sms" component={BulkSMS} />
      <Route path="/ai-assistant" component={AiAssistant} />
      <Route path="/theme-test" component={ThemeTestPage} />
      <Route path="/admin/dashboard">
        <AdminGuard>
          <AdminDashboard />
        </AdminGuard>
      </Route>
      <Route path="/admin">
        <AdminGuard>
          <AdminPanel />
        </AdminGuard>
      </Route>
      <Route path="/admin/users">
        <AdminGuard>
          <AdminUsers />
        </AdminGuard>
      </Route>
      <Route path="/admin/settings">
        <AdminGuard>
          <AdminSettings />
        </AdminGuard>
      </Route>
      <Route path="/admin/announcements">
        <AdminGuard>
          <AdminAnnouncements />
        </AdminGuard>
      </Route>
      <Route path="/admin/logs">
        <AdminGuard>
          <AdminLogs />
        </AdminGuard>
      </Route>
      <Route path="/admin/sessions">
        <AdminGuard>
          <AdminSessions />
        </AdminGuard>
      </Route>
      <Route path="/admin/payment-notifications">
        <AdminGuard>
          <AdminPaymentNotifications />
        </AdminGuard>
      </Route>
      <Route path="/admin/payment-settings">
        <AdminGuard>
          <AdminPaymentSettings />
        </AdminGuard>
      </Route>
      <Route path="/account" component={Account} />
      <Route path="/api/auth/logout" component={Logout} />
      <Route component={Dashboard} />
      </Switch>
    </>
  );
}

function App() {
  // Use global theme management
  useGlobalTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
