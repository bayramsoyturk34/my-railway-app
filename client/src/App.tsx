import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Personnel from "@/pages/personnel";
import PersonnelDetail from "@/pages/personnel-detail";
import Timesheet from "@/pages/timesheet";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail.tsx";
import Finances from "@/pages/finances";
import Customers from "@/pages/customers";
import CustomerDetail from "@/pages/customer-detail";
import CompanyDirectory from "@/pages/company-directory";
import EnhancedCompanyDirectory from "@/pages/enhanced-company-directory-fixed";
import Messages from "@/pages/messages";
import Reports from "@/pages/reports";
import AdminDashboard from "@/pages/admin-dashboard";
import BulkSMS from "@/pages/bulk-sms";
import AdminPanel from "@/pages/admin/dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasSessionId = !!localStorage.getItem('sessionId');
  const [location] = useLocation();

  // Debug removed - routing now stable

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-white">Sistemi kontrol ediyoruz...</div>
      </div>
    );
  }

  // Show authenticated routes if we have both session and user data
  const shouldShowAuthenticatedRoutes = isAuthenticated && user && hasSessionId;

  // Direct rendering for unauthenticated users
  if (!shouldShowAuthenticatedRoutes) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // For authenticated users, prioritize dashboard for root path
  if (location === "/") {
    return <Dashboard />;
  }

  return (
    <Switch>
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
      <Route path="/admin" component={AdminPanel} />
      <Route component={Dashboard} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-dark-primary">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
