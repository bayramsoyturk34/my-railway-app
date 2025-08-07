import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Personnel from "@/pages/personnel";
import Timesheet from "@/pages/timesheet";
import Projects from "@/pages/projects";
import Finances from "@/pages/finances";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/personnel" component={Personnel} />
      <Route path="/timesheet" component={Timesheet} />
      <Route path="/projects" component={Projects} />
      <Route path="/finances" component={Finances} />
      <Route component={NotFound} />
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
