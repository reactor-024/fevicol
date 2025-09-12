import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mail, Send, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Email } from "@shared/schema";

interface EmailModuleProps {
  modalRequest?: {type: string; module: string} | null;
  onModalHandled?: () => void;
}

export default function EmailModule({ modalRequest, onModalHandled }: EmailModuleProps = {}) {
  const { data: emails, isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
    refetchInterval: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Email & Communication</h3>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Compose Email
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Email & Communication</h3>
        <Button onClick={() => alert("Compose Email functionality would be implemented here")}>
          <Plus className="w-4 h-4 mr-2" />
          Compose Email
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200">
            <h4 className="text-lg font-semibold text-slate-800">Email History</h4>
          </div>
          
          <div className="divide-y divide-slate-200">
            {emails?.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">No emails yet</h4>
                <p className="text-slate-600 mb-4">Send your first email to start communicating with clients</p>
                <Button onClick={() => alert("Compose Email functionality would be implemented here")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Compose Email
                </Button>
              </div>
            ) : (
              emails?.map((email) => (
                <div key={email.id} className="p-4 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {email.to.split('@')[0].charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{email.to}</p>
                        <p className="text-sm text-slate-600">{email.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{formatDate(email.sentAt)}</p>
                      <Badge className={getStatusColor(email.status)}>
                        {email.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {email.body}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
