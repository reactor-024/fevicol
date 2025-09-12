import { useQuery } from "@tanstack/react-query";

export interface Stats {
  totalLeads: number;
  activeTickets: number;
  totalRevenue: number;
  activeProjects: number;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
