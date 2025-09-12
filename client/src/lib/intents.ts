import { toast } from "@/hooks/use-toast";

export interface AIResponse {
  action: "navigate" | "create" | "respond" | "open_modal";
  module?: string;
  type?: string;
  data?: any;
  message?: string;
}

export function processAIResponse(
  response: AIResponse,
  onModuleChange: (module: string) => void,
  onOpenModal?: (type: string, module: string) => void
) {
  switch (response.action) {
    case "navigate":
      if (response.module) {
        onModuleChange(response.module);
        toast({
          title: "Navigation",
          description: `Navigated to ${response.module} module`,
        });
      }
      break;
    
    case "open_modal":
      if (response.module) {
        onModuleChange(response.module);
      }
      if (response.type && onOpenModal) {
        // Give the module time to load then open modal
        setTimeout(() => {
          onOpenModal(response.type!, response.module || "");
        }, 100);
      }
      break;
    
    case "create":
      // Handle creation actions (legacy support)
      if (response.type === "lead") {
        onModuleChange("crm");
        toast({
          title: "Create Lead",
          description: "Opening lead creation form...",
        });
      } else if (response.type === "ticket") {
        onModuleChange("tickets");
        toast({
          title: "Create Ticket",
          description: "Opening ticket creation form...",
        });
      }
      break;
    
    case "respond":
      // Just show the message - already handled by the chat component
      break;
  }
}

export function parseUserIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Navigation intents
  if (lowerMessage.includes("dashboard") || lowerMessage.includes("home")) {
    return "navigate:dashboard";
  }
  if (lowerMessage.includes("crm") || lowerMessage.includes("customer") || lowerMessage.includes("lead")) {
    return "navigate:crm";
  }
  if (lowerMessage.includes("ticket") || lowerMessage.includes("support")) {
    return "navigate:tickets";
  }
  if (lowerMessage.includes("sales") || lowerMessage.includes("revenue") || lowerMessage.includes("deal")) {
    return "navigate:sales";
  }
  if (lowerMessage.includes("project") || lowerMessage.includes("task")) {
    return "navigate:projects";
  }
  if (lowerMessage.includes("email") || lowerMessage.includes("mail")) {
    return "navigate:email";
  }
  
  // Creation intents
  if (lowerMessage.includes("create") || lowerMessage.includes("add") || lowerMessage.includes("new")) {
    if (lowerMessage.includes("lead")) {
      return "create:lead";
    }
    if (lowerMessage.includes("ticket")) {
      return "create:ticket";
    }
    if (lowerMessage.includes("deal")) {
      return "create:deal";
    }
    if (lowerMessage.includes("project")) {
      return "create:project";
    }
  }
  
  return "general";
}
