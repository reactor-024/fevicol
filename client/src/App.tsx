import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import AIAssistant from "@/components/AIAssistant";
import Dashboard from "@/pages/dashboard";
import LeadsPage from "@/pages/leads";
import TicketsPage from "@/pages/tickets";
import DealsPage from "@/pages/deals";
import ProjectsPage from "@/pages/projects";
import TasksPage from "@/pages/tasks";
import EmailsPage from "@/pages/emails";
import UsersPage from "@/pages/users";
import CompaniesPage from "@/pages/companies";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [aiOpen, setAiOpen] = useState(false);

  // Listen for AI toggle event
  useEffect(() => {
    const handleToggleAI = () => {
      setAiOpen(!aiOpen);
    };
    
    window.addEventListener('toggle-ai', handleToggleAI);
    return () => window.removeEventListener('toggle-ai', handleToggleAI);
  }, [aiOpen]);

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    // Navigate to the module programmatically
    window.history.pushState({}, '', module === 'dashboard' ? '/' : `/${module}`);
  };

  const handleAINavigate = (module: string, data?: any) => {
    setActiveModule(module);
    window.history.pushState({}, '', module === 'dashboard' ? '/' : `/${module}`);
    // Handle search data if provided
    if (data?.search) {
      console.log('AI Search:', data.search, 'in', module);
    }
  };

  const handleAIOpenModal = (module: string, type: string) => {
    console.log('AI Open Modal:', module, type);
    // This would trigger modal opening in the target module
  };

  return (
    <Layout activeModule={activeModule} onModuleChange={handleModuleChange}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/leads" component={LeadsPage} />
        <Route path="/tickets" component={TicketsPage} />
        <Route path="/deals" component={DealsPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/emails" component={EmailsPage} />
        <Route path="/users" component={UsersPage} />
        <Route path="/companies" component={CompaniesPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route component={NotFound} />
      </Switch>
      
      <AIAssistant 
        isOpen={aiOpen} 
        onClose={() => setAiOpen(false)}
        onNavigate={handleAINavigate}
        onOpenModal={handleAIOpenModal}
      />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
