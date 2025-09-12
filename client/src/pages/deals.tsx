import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, DollarSign, Calendar, Building2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: number;
  title: string;
  value: string;
  stage: string | null;
  probability: number | null;
  leadId: number | null;
  companyId: number | null;
  assignedTo: number | null;
  expectedCloseDate: Date | null;
  actualCloseDate: Date | null;
  notes: string | null;
  createdAt: Date | null;
}

interface Lead {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
}

interface User {
  id: number;
  fullName: string | null;
}

const stageColors = {
  prospecting: "bg-blue-100 text-blue-800",
  qualification: "bg-yellow-100 text-yellow-800",
  proposal: "bg-orange-100 text-orange-800",
  negotiation: "bg-purple-100 text-purple-800",
  closed_won: "bg-green-100 text-green-800",
  closed_lost: "bg-red-100 text-red-800",
};

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["/api/deals"],
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/deals", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to create deal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Deal created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create deal", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/deals/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update deal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setEditingDeal(null);
      toast({ title: "Success", description: "Deal updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update deal", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/deals/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error('Failed to delete deal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({ title: "Success", description: "Deal deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete deal", variant: "destructive" });
    },
  });

  const filteredDeals = (deals as Deal[]).filter((deal: Deal) =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (deal.notes && deal.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalValue = filteredDeals.reduce((sum: number, deal: Deal) => sum + parseFloat(deal.value), 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      value: formData.get("value") as string,
      stage: formData.get("stage") as string || "prospecting",
      probability: formData.get("probability") ? parseInt(formData.get("probability") as string) : 0,
      leadId: formData.get("leadId") && formData.get("leadId") !== "null" ? parseInt(formData.get("leadId") as string) : null,
      companyId: formData.get("companyId") && formData.get("companyId") !== "null" ? parseInt(formData.get("companyId") as string) : null,
      assignedTo: formData.get("assignedTo") && formData.get("assignedTo") !== "null" ? parseInt(formData.get("assignedTo") as string) : null,
      expectedCloseDate: formData.get("expectedCloseDate") ? new Date(formData.get("expectedCloseDate") as string) : null,
      actualCloseDate: formData.get("actualCloseDate") ? new Date(formData.get("actualCloseDate") as string) : null,
      notes: formData.get("notes") as string || null,
    };

    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Pipeline</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your sales opportunities</p>
        </div>
        <Dialog open={isCreateOpen || !!editingDeal} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingDeal(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDeal ? "Edit Deal" : "Create New Deal"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Deal Title *</Label>
                <Input id="title" name="title" defaultValue={editingDeal?.title || ""} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Value *</Label>
                  <Input 
                    id="value" 
                    name="value" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingDeal?.value || ""} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input 
                    id="probability" 
                    name="probability" 
                    type="number" 
                    min="0" 
                    max="100" 
                    defaultValue={editingDeal?.probability || 50} 
                  />
                </div>
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select name="stage" defaultValue={editingDeal?.stage || "prospecting"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecting">Prospecting</SelectItem>
                      <SelectItem value="qualification">Qualification</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select name="assignedTo" defaultValue={editingDeal?.assignedTo?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName || `User ${user.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="leadId">Related Lead</Label>
                  <Select name="leadId" defaultValue={editingDeal?.leadId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No lead</SelectItem>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id.toString()}>
                          {lead.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="companyId">Company</Label>
                  <Select name="companyId" defaultValue={editingDeal?.companyId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No company</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                  <Input 
                    id="expectedCloseDate" 
                    name="expectedCloseDate" 
                    type="date" 
                    defaultValue={editingDeal?.expectedCloseDate ? new Date(editingDeal.expectedCloseDate).toISOString().split('T')[0] : ""} 
                  />
                </div>
                <div>
                  <Label htmlFor="actualCloseDate">Actual Close Date</Label>
                  <Input 
                    id="actualCloseDate" 
                    name="actualCloseDate" 
                    type="date" 
                    defaultValue={editingDeal?.actualCloseDate ? new Date(editingDeal.actualCloseDate).toISOString().split('T')[0] : ""} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={editingDeal?.notes || ""} rows={3} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setEditingDeal(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingDeal ? "Update" : "Create"} Deal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDeals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredDeals.filter((d: Deal) => d.stage === 'closed_won').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredDeals.length > 0 
                ? Math.round((filteredDeals.filter((d: Deal) => d.stage === 'closed_won').length / filteredDeals.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Deals ({filteredDeals.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Expected Close</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal: Deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{deal.title}</div>
                        {deal.notes && (
                          <div className="text-sm text-gray-500 line-clamp-1">{deal.notes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                        {parseFloat(deal.value).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={stageColors[deal.stage as keyof typeof stageColors] || stageColors.prospecting}>
                        {deal.stage || "prospecting"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${deal.probability || 0}%` }}
                          ></div>
                        </div>
                        {deal.probability || 0}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {deal.companyId ? (
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {companies.find(c => c.id === deal.companyId)?.name || "Unknown"}
                        </div>
                      ) : (
                        <span className="text-gray-400">No company</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {deal.assignedTo ? (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {users.find(u => u.id === deal.assignedTo)?.fullName || `User ${deal.assignedTo}`}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {deal.expectedCloseDate ? (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(deal.expectedCloseDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">No date set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDeal(deal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(deal.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDeals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No deals found. Create your first deal to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}