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
import EnhancedCompanyDirectory from "@/pages/enhanced-company-directory-new";
import Reports from "@/pages/reports";
import AdminDashboard from "@/pages/admin-dashboard";

function DashboardWrapper() {
  const [location] = useLocation();
  
  console.log("DashboardWrapper location:", location);
  
  // Only render Dashboard on exact root path
  if (location !== "/") {
    console.log("Not rendering Dashboard, location is:", location);
    return null;
  }
  
  console.log("Rendering Dashboard");
  return <Dashboard />;
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasSessionId = !!localStorage.getItem('sessionId');

  console.log("Router Debug:", { 
    isAuthenticated, 
    isLoading, 
    hasSessionId,
    user: user ? `${user.email} (${user.id})` : 'null'
  });

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

  return (
    <Switch>
      {!shouldShowAuthenticatedRoutes ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={Landing} />
        </>
      ) : (
        <>
          <Route path="/personnel">
            <Personnel />
          </Route>
          <Route path="/personnel/:id">
            <PersonnelDetail />
          </Route>
          <Route path="/timesheet">
            <Timesheet />
          </Route>
          <Route path="/projects">
            <Projects />
          </Route>
          <Route path="/projects/:id">
            <ProjectDetail />
          </Route>
          <Route path="/finances">
            <Finances />
          </Route>
          <Route path="/customers">
            <Customers />
          </Route>
          <Route path="/customers/:customerName">
            <CustomerDetail />
          </Route>
          <Route path="/company-directory">
            <EnhancedCompanyDirectory />
          </Route>
          <Route path="/reports">
            <Reports />
          </Route>
          <Route path="/admin">
            <AdminDashboard />
          </Route>
          <Route path="/">
            <DashboardWrapper />
          </Route>
          <Route>
            <DashboardWrapper />
          </Route>
        </>
      )}
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
