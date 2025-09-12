import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Clock, AlertTriangle, Calendar, CheckCircle } from "lucide-react";

interface Reminder {
  id: string;
  type: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'overdue' | 'urgent' | 'upcoming' | 'follow_up';
  itemId: number;
}

const priorityConfig = {
  overdue: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600"
  },
  urgent: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Clock,
    iconColor: "text-orange-600"
  },
  upcoming: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Calendar,
    iconColor: "text-blue-600"
  },
  follow_up: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: CheckCircle,
    iconColor: "text-yellow-600"
  }
};

export default function RemindersNotification() {
  const [open, setOpen] = useState(false);
  
  const { data: reminders = [], refetch } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const urgentCount = reminders.filter(r => r.priority === 'overdue' || r.priority === 'urgent').length;

  const navigateToItem = (reminder: Reminder) => {
    const routes = {
      lead: '/leads',
      ticket: '/tickets',
      deal: '/deals',
      task: '/tasks',
      project: '/projects'
    };
    
    const route = routes[reminder.type as keyof typeof routes];
    if (route) {
      window.location.href = route;
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {urgentCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {urgentCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders ({reminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {reminders.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No reminders at the moment
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {reminders.map((reminder) => {
                  const config = priorityConfig[reminder.priority];
                  const Icon = config.icon;
                  
                  return (
                    <div 
                      key={reminder.id}
                      className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToItem(reminder)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`h-4 w-4 mt-0.5 ${config.iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {reminder.title}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${config.color}`}
                            >
                              {reminder.priority.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {reminder.description}
                          </p>
                          {reminder.dueDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(reminder.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}