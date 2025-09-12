import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import type { Deal } from "@shared/schema";

interface SalesModuleProps {
  modalRequest?: {type: string; module: string} | null;
  onModalHandled?: () => void;
}

export default function SalesModule({ modalRequest, onModalHandled }: SalesModuleProps = {}) {
  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
    refetchInterval: 30000,
  });

  const revenueData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue',
        data: [85000, 92000, 78000, 95000],
        backgroundColor: 'hsl(207, 90%, 54%)',
        borderColor: 'hsl(207, 90%, 54%)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const totalRevenue = deals?.reduce((sum, deal) => sum + deal.value, 0) || 0;
  const activeDeals = deals?.filter(deal => deal.stage !== "closed").length || 0;
  const conversionRate = deals?.length > 0 ? (deals.filter(deal => deal.stage === "closed").length / deals.length * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Sales & Revenue</h3>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Sales & Revenue</h3>
        <Button onClick={() => alert("Add Deal functionality would be implemented here")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-800">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Deals</p>
                <p className="text-2xl font-bold text-slate-800">{activeDeals}</p>
                <p className="text-sm text-blue-600 mt-1">5 closing this week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-800">{conversionRate}%</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +3% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-800">Revenue Chart</h4>
          </div>
          <div className="h-80">
            <Bar data={revenueData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
