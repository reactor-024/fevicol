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
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Edit, Trash2, Calendar, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  progress: number | null;
  budget: string | null;
  clientId: number | null;
  managerId: number | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date | null;
}

interface User {
  id: number;
  fullName: string | null;
}

interface Company {
  id: number;
  name: string;
}

const statusColors = {
  planning: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  on_hold: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-800",
};

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Project created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditingProject(null);
      toast({ title: "Success", description: "Project updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error('Failed to delete project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    },
  });

  const filteredProjects = (projects as Project[]).filter((project: Project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      status: formData.get("status") as string || "planning",
      priority: formData.get("priority") as string || "medium",
      progress: formData.get("progress") ? parseInt(formData.get("progress") as string) : 0,
      budget: formData.get("budget") as string || null,
      clientId: formData.get("clientId") && formData.get("clientId") !== "null" && formData.get("clientId") !== "" ? parseInt(formData.get("clientId") as string) : null,
      managerId: formData.get("managerId") && formData.get("managerId") !== "null" && formData.get("managerId") !== "" ? parseInt(formData.get("managerId") as string) : null,
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your projects and track progress</p>
        </div>
        <Dialog open={isCreateOpen || !!editingProject} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingProject(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input id="name" name="name" defaultValue={editingProject?.name || ""} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingProject?.description || ""} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingProject?.status || "planning"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue={editingProject?.priority || "medium"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input 
                    id="progress" 
                    name="progress" 
                    type="number" 
                    min="0" 
                    max="100" 
                    defaultValue={editingProject?.progress || 0} 
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input id="budget" name="budget" defaultValue={editingProject?.budget || ""} placeholder="e.g., $50,000" />
                </div>
                <div>
                  <Label htmlFor="managerId">Project Manager</Label>
                  <Select name="managerId" defaultValue={editingProject?.managerId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No manager</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName || `User ${user.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="clientId">Client</Label>
                  <Select name="clientId" defaultValue={editingProject?.clientId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No client</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="date" 
                    defaultValue={editingProject?.startDate ? new Date(editingProject.startDate).toISOString().split('T')[0] : ""} 
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="date" 
                    defaultValue={editingProject?.endDate ? new Date(editingProject.endDate).toISOString().split('T')[0] : ""} 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setEditingProject(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? "Update" : "Create"} Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Projects ({filteredProjects.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
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
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project: Project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500 line-clamp-2">{project.description}</div>
                        )}
                        {project.budget && (
                          <div className="text-sm font-medium text-green-600">{project.budget}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[project.status as keyof typeof statusColors] || statusColors.planning}>
                        {project.status || "planning"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityColors[project.priority as keyof typeof priorityColors] || priorityColors.medium}>
                        {project.priority || "medium"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={project.progress || 0} className="w-20" />
                        <div className="text-xs text-gray-500">{project.progress || 0}%</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.managerId ? (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {users.find(u => u.id === project.managerId)?.fullName || `User ${project.managerId}`}
                        </div>
                      ) : (
                        <span className="text-gray-400">No manager</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.clientId ? (
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {companies.find(c => c.id === project.clientId)?.name || "Unknown"}
                        </div>
                      ) : (
                        <span className="text-gray-400">No client</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {project.startDate && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            Start: {new Date(project.startDate).toLocaleDateString()}
                          </div>
                        )}
                        {project.endDate && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            End: {new Date(project.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProject(project)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(project.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No projects found. Create your first project to get started.
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