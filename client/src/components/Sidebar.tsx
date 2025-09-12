import { 
  Home, Users, Building2, UserCheck, Ticket, DollarSign, 
  FolderOpen, CheckSquare, Mail, BarChart3, Settings, 
  MessageSquare, Search, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RemindersNotification from "@/components/RemindersNotification";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "leads", label: "Leads", icon: UserCheck },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "deals", label: "Deals", icon: DollarSign },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "users", label: "Users", icon: Users },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FlowCore</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Business Management</p>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
          <Button size="sm" variant="outline">
            <Search className="w-4 h-4" />
          </Button>
          <RemindersNotification />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      {/* AI Assistant Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            // Toggle AI assistant - this will be handled by parent component
            const event = new CustomEvent('toggle-ai');
            window.dispatchEvent(event);
          }}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          AI Assistant
        </Button>
      </div>
      
      {/* Settings */}
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
}