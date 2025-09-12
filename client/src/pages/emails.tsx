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
import { Plus, Search, Edit, Trash2, Mail, Calendar, User, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Email {
  id: number;
  to: string;
  cc: string | null;
  bcc: string | null;
  subject: string;
  body: string;
  type: string | null;
  status: string | null;
  leadId: number | null;
  ticketId: number | null;
  dealId: number | null;
  sentBy: number | null;
  sentAt: Date | null;
}

interface Lead {
  id: number;
  name: string;
  email: string;
}

interface User {
  id: number;
  fullName: string | null;
  email: string;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const typeColors = {
  promotional: "bg-purple-100 text-purple-800",
  transactional: "bg-blue-100 text-blue-800",
  newsletter: "bg-orange-100 text-orange-800",
  support: "bg-green-100 text-green-800",
};

export default function EmailsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Email | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ["/api/emails"],
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/emails", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to create email');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Email created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create email", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/emails/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update email');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      setEditingEmail(null);
      toast({ title: "Success", description: "Email updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update email", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/emails/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error('Failed to delete email');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      toast({ title: "Success", description: "Email deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete email", variant: "destructive" });
    },
  });

  const filteredEmails = (emails as Email[]).filter((email: Email) =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      to: formData.get("to") as string,
      cc: formData.get("cc") as string || null,
      bcc: formData.get("bcc") as string || null,
      subject: formData.get("subject") as string,
      body: formData.get("body") as string,
      type: formData.get("type") as string || "transactional",
      status: formData.get("status") as string || "draft",
      leadId: formData.get("leadId") && formData.get("leadId") !== "null" && formData.get("leadId") !== "" ? parseInt(formData.get("leadId") as string) : null,
      sentBy: formData.get("sentBy") && formData.get("sentBy") !== "null" && formData.get("sentBy") !== "" ? parseInt(formData.get("sentBy") as string) : null,
    };

    if (editingEmail) {
      updateMutation.mutate({ id: editingEmail.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Communications</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage email correspondence and campaigns</p>
        </div>
        <Dialog open={isCreateOpen || !!editingEmail} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingEmail(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Compose Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEmail ? "Edit Email" : "Compose New Email"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="to">To *</Label>
                  <Input id="to" name="to" type="email" defaultValue={editingEmail?.to || ""} required />
                </div>
                <div>
                  <Label htmlFor="cc">CC</Label>
                  <Input id="cc" name="cc" type="email" defaultValue={editingEmail?.cc || ""} />
                </div>
                <div>
                  <Label htmlFor="bcc">BCC</Label>
                  <Input id="bcc" name="bcc" type="email" defaultValue={editingEmail?.bcc || ""} />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" name="subject" defaultValue={editingEmail?.subject || ""} required />
              </div>
              <div>
                <Label htmlFor="body">Message *</Label>
                <Textarea id="body" name="body" defaultValue={editingEmail?.body || ""} rows={8} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={editingEmail?.type || "transactional"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingEmail?.status || "draft"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="leadId">Related Lead</Label>
                  <Select name="leadId" defaultValue={editingEmail?.leadId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No lead</SelectItem>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id.toString()}>
                          {lead.name} ({lead.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sentBy">Sent By</Label>
                  <Select name="sentBy" defaultValue={editingEmail?.sentBy?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Unknown</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName || `User ${user.id}`} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setEditingEmail(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Send className="w-4 h-4 mr-2" />
                  {editingEmail ? "Update" : "Send"} Email
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Emails ({filteredEmails.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search emails..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((email: Email) => (
                  <TableRow key={email.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {email.subject}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">{email.body}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{email.to}</div>
                        {email.cc && (
                          <div className="text-sm text-gray-500">CC: {email.cc}</div>
                        )}
                        {email.bcc && (
                          <div className="text-sm text-gray-500">BCC: {email.bcc}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColors[email.type as keyof typeof typeColors] || typeColors.transactional}>
                        {email.type || "transactional"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[email.status as keyof typeof statusColors] || statusColors.draft}>
                        {email.status || "draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {email.sentBy ? (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {users.find(u => u.id === email.sentBy)?.fullName || `User ${email.sentBy}`}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {email.sentAt ? (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(email.sentAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not sent</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEmail(email)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(email.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No emails found. Compose your first email to get started.
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