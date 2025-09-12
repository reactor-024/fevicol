import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Users, Building2, Ticket, 
  DollarSign, FolderOpen, CheckSquare, Mail, Calendar
} from "lucide-react";

interface Stats {
  totalLeads: number;
  activeTickets: number;
  totalRevenue: number;
  activeProjects: number;
  totalUsers: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
}

export default function ReportsPage() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["/api/tickets"],
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Calculate lead conversion rates
  const leadStats = {
    total: leads.length,
    new: leads.filter((l: any) => l.status === 'new').length,
    contacted: leads.filter((l: any) => l.status === 'contacted').length,
    qualified: leads.filter((l: any) => l.status === 'qualified').length,
    converted: leads.filter((l: any) => l.status === 'converted').length,
    lost: leads.filter((l: any) => l.status === 'lost').length,
  };

  // Calculate ticket resolution rates
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t: any) => t.status === 'open').length,
    inProgress: tickets.filter((t: any) => t.status === 'in_progress').length,
    resolved: tickets.filter((t: any) => t.status === 'resolved').length,
    closed: tickets.filter((t: any) => t.status === 'closed').length,
  };

  // Calculate deal pipeline
  const dealStats = {
    total: deals.length,
    totalValue: deals.reduce((sum: number, deal: any) => sum + parseFloat(deal.value), 0),
    won: deals.filter((d: any) => d.stage === 'closed_won').length,
    lost: deals.filter((d: any) => d.stage === 'closed_lost').length,
    active: deals.filter((d: any) => !['closed_won', 'closed_lost'].includes(d.stage)).length,
  };

  // Calculate project progress
  const projectStats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'active').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
    planning: projects.filter((p: any) => p.status === 'planning').length,
    avgProgress: projects.length > 0 ? 
      Math.round(projects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / projects.length) : 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Business insights and performance metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {leadStats.converted > 0 && leadStats.total > 0 && 
                `${Math.round((leadStats.converted / leadStats.total) * 100)}% conversion rate`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {ticketStats.resolved > 0 && ticketStats.total > 0 && 
                `${Math.round((ticketStats.resolved / ticketStats.total) * 100)}% resolved`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats?.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dealStats.won} deals won
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              {projectStats.avgProgress}% avg progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Lead Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>New Leads</span>
                <Badge variant="outline">{leadStats.new}</Badge>
              </div>
              <Progress value={leadStats.total > 0 ? (leadStats.new / leadStats.total) * 100 : 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Contacted</span>
                <Badge variant="outline">{leadStats.contacted}</Badge>
              </div>
              <Progress value={leadStats.total > 0 ? (leadStats.contacted / leadStats.total) * 100 : 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Qualified</span>
                <Badge variant="outline">{leadStats.qualified}</Badge>
              </div>
              <Progress value={leadStats.total > 0 ? (leadStats.qualified / leadStats.total) * 100 : 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Converted</span>
                <Badge className="bg-green-100 text-green-800">{leadStats.converted}</Badge>
              </div>
              <Progress value={leadStats.total > 0 ? (leadStats.converted / leadStats.total) * 100 : 0} className="bg-green-200" />
            </div>
          </CardContent>
        </Card>

        {/* Ticket Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="w-5 h-5 mr-2" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Open</span>
                <Badge variant="outline">{ticketStats.open}</Badge>
              </div>
              <Progress value={ticketStats.total > 0 ? (ticketStats.open / ticketStats.total) * 100 : 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>In Progress</span>
                <Badge className="bg-blue-100 text-blue-800">{ticketStats.inProgress}</Badge>
              </div>
              <Progress value={ticketStats.total > 0 ? (ticketStats.inProgress / ticketStats.total) * 100 : 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Resolved</span>
                <Badge className="bg-green-100 text-green-800">{ticketStats.resolved}</Badge>
              </div>
              <Progress value={ticketStats.total > 0 ? (ticketStats.resolved / ticketStats.total) * 100 : 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Closed</span>
                <Badge variant="secondary">{ticketStats.closed}</Badge>
              </div>
              <Progress value={ticketStats.total > 0 ? (ticketStats.closed / ticketStats.total) * 100 : 0} />
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dealStats.won}</div>
                <div className="text-sm text-gray-500">Deals Won</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{dealStats.lost}</div>
                <div className="text-sm text-gray-500">Deals Lost</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Win Rate</span>
                <Badge className="bg-green-100 text-green-800">
                  {dealStats.total > 0 ? Math.round((dealStats.won / dealStats.total) * 100) : 0}%
                </Badge>
              </div>
              <Progress value={dealStats.total > 0 ? (dealStats.won / dealStats.total) * 100 : 0} />
            </div>
            <div className="text-center pt-2">
              <div className="text-lg font-semibold">${dealStats.totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Pipeline Value</div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity?.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'lead' && <Users className="w-4 h-4 text-blue-500" />}
                    {activity.type === 'ticket' && <Ticket className="w-4 h-4 text-orange-500" />}
                    {activity.type === 'deal' && <DollarSign className="w-4 h-4 text-green-500" />}
                    {activity.type === 'project' && <FolderOpen className="w-4 h-4 text-purple-500" />}
                    {activity.type === 'email' && <Mail className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}