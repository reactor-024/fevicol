interface AIResponse {
  action: "navigate" | "create" | "respond" | "open_modal";
  module?: string;
  type?: string;
  data?: any;
  message?: string;
}

// Advanced natural language processing patterns
const INTENT_PATTERNS = {
  navigation: [
    /(?:go to|navigate to|open|show me|take me to|view)\s+(?:the\s+)?(.+?)(?:\s+(?:page|section|module|dashboard))?$/i,
    /(?:switch to|change to)\s+(.+?)(?:\s+(?:mode|view))?$/i,
    /i\s+(?:want to|need to|would like to)\s+(?:see|check|view)\s+(.+?)$/i
  ],
  create: [
    /(?:create|add|new|make)\s+(?:a\s+)?(.+?)(?:\s+(?:record|entry|item))?(?:\s+for\s+(.+?))?$/i,
    /i\s+(?:want to|need to|would like to)\s+(?:create|add|make)\s+(?:a\s+)?(.+?)$/i,
    /(?:register|setup|establish)\s+(?:a\s+)?(.+?)$/i
  ],
  search: [
    /(?:find|search|look for|locate)\s+(.+?)$/i,
    /(?:show me|display)\s+(?:all\s+)?(.+?)(?:\s+(?:with|containing|matching)\s+(.+?))?$/i,
    /i\s+(?:want to|need to)\s+(?:find|search for)\s+(.+?)$/i
  ],
  update: [
    /(?:update|edit|modify|change)\s+(.+?)(?:\s+(?:to|with)\s+(.+?))?$/i,
    /(?:set|assign)\s+(.+?)(?:\s+(?:to|as)\s+(.+?))?$/i
  ],
  delete: [
    /(?:delete|remove|cancel)\s+(.+?)$/i,
    /(?:close|resolve)\s+(.+?)$/i
  ],
  status: [
    /(?:what|show)\s+(?:is\s+)?(?:the\s+)?(?:status of|current)\s+(.+?)$/i,
    /(?:how many|count)\s+(.+?)(?:\s+(?:are there|do we have))?$/i
  ],
  assign: [
    /(?:assign|give)\s+(.+?)\s+to\s+(.+?)$/i,
    /(?:set\s+)?(.+?)\s+(?:assignee|owner|responsible)\s+(?:to|as)\s+(.+?)$/i
  ]
};

const MODULE_MAPPINGS = {
  // CRM Module
  'lead': 'leads', 'leads': 'leads', 'customer': 'leads', 'customers': 'leads', 'prospect': 'leads', 'prospects': 'leads',
  'contact': 'leads', 'contacts': 'leads', 'client': 'leads', 'clients': 'leads',
  
  // Tickets Module
  'ticket': 'tickets', 'tickets': 'tickets', 'support': 'tickets', 'issue': 'tickets', 'issues': 'tickets',
  'bug': 'tickets', 'bugs': 'tickets', 'problem': 'tickets', 'problems': 'tickets', 'help': 'tickets',
  
  // Deals Module
  'deal': 'deals', 'deals': 'deals', 'sale': 'deals', 'sales': 'deals', 'opportunity': 'deals',
  'opportunities': 'deals', 'revenue': 'deals', 'pipeline': 'deals',
  
  // Projects Module
  'project': 'projects', 'projects': 'projects', 'work': 'projects', 'job': 'projects', 'jobs': 'projects',
  
  // Tasks Module
  'task': 'tasks', 'tasks': 'tasks', 'todo': 'tasks', 'todos': 'tasks', 'assignment': 'tasks',
  'assignments': 'tasks', 'action': 'tasks', 'actions': 'tasks',
  
  // Email Module
  'email': 'emails', 'emails': 'emails', 'message': 'emails', 'messages': 'emails', 'mail': 'emails',
  'communication': 'emails', 'correspondence': 'emails',
  
  // Users Module
  'user': 'users', 'users': 'users', 'employee': 'users', 'employees': 'users', 'staff': 'users',
  'team': 'users', 'member': 'users', 'members': 'users', 'person': 'users', 'people': 'users',
  
  // Companies Module
  'company': 'companies', 'companies': 'companies', 'business': 'companies', 'businesses': 'companies',
  'organization': 'companies', 'organizations': 'companies', 'firm': 'companies', 'firms': 'companies',
  
  // Dashboard
  'dashboard': 'dashboard', 'home': 'dashboard', 'overview': 'dashboard', 'summary': 'dashboard',
  'stats': 'dashboard', 'statistics': 'dashboard', 'metrics': 'dashboard', 'analytics': 'dashboard',
  
  // Reports
  'report': 'reports', 'reports': 'reports', 'analytics': 'reports', 'insights': 'reports',
  'data': 'reports', 'analysis': 'reports'
};

const STATUS_MAPPINGS = {
  // Lead statuses
  'new': 'new', 'fresh': 'new', 'recent': 'new',
  'contacted': 'contacted', 'reached': 'contacted', 'called': 'contacted',
  'qualified': 'qualified', 'good': 'qualified', 'promising': 'qualified',
  'converted': 'converted', 'closed': 'converted', 'won': 'converted',
  'lost': 'lost', 'dead': 'lost', 'rejected': 'lost',
  
  // Ticket statuses
  'open': 'open', 'new': 'open', 'active': 'open',
  'progress': 'in_progress', 'working': 'in_progress', 'processing': 'in_progress',
  'resolved': 'resolved', 'fixed': 'resolved', 'done': 'resolved', 'completed': 'resolved',
  'closed': 'closed', 'finished': 'closed',
  
  // Project/Task statuses
  'todo': 'todo', 'pending': 'todo', 'planned': 'todo',
  'active': 'active', 'current': 'active', 'ongoing': 'active',
  'completed': 'completed', 'finished': 'completed', 'done': 'completed',
  'cancelled': 'cancelled', 'canceled': 'cancelled', 'stopped': 'cancelled'
};

const PRIORITY_MAPPINGS = {
  'low': 'low', 'minor': 'low', 'small': 'low',
  'medium': 'medium', 'normal': 'medium', 'regular': 'medium', 'standard': 'medium',
  'high': 'high', 'important': 'high', 'urgent': 'high', 'critical': 'high', 'major': 'high'
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

function extractIntent(message: string): { action: string; target: string; context: string[] } {
  const normalizedMessage = normalizeText(message);
  
  // Check each intent pattern
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalizedMessage.match(pattern);
      if (match) {
        const target = match[1] || '';
        const context = match.slice(2).filter(Boolean);
        return { action: intent, target, context };
      }
    }
  }
  
  // Fallback: look for keywords
  if (normalizedMessage.includes('create') || normalizedMessage.includes('add') || normalizedMessage.includes('new')) {
    return { action: 'create', target: normalizedMessage, context: [] };
  }
  if (normalizedMessage.includes('find') || normalizedMessage.includes('search') || normalizedMessage.includes('show')) {
    return { action: 'search', target: normalizedMessage, context: [] };
  }
  if (normalizedMessage.includes('go') || normalizedMessage.includes('open') || normalizedMessage.includes('navigate')) {
    return { action: 'navigation', target: normalizedMessage, context: [] };
  }
  
  return { action: 'respond', target: normalizedMessage, context: [] };
}

function generateResponse(intent: { action: string; target: string; context: string[] }, originalMessage: string): AIResponse {
  const { action, target, context } = intent;
  
  // Map target to module
  const words = target.split(/\s+/);
  let module = null;
  
  for (const word of words) {
    if (MODULE_MAPPINGS[word]) {
      module = MODULE_MAPPINGS[word];
      break;
    }
  }
  
  switch (action) {
    case 'navigation':
      if (module) {
        return {
          action: "navigate",
          module,
          message: `Navigating to ${module} module.`
        };
      } else {
        return {
          action: "respond",
          message: "I can help you navigate to: Dashboard, Leads, Tickets, Deals, Projects, Tasks, Emails, Users, or Companies. Which would you like to visit?"
        };
      }
      
    case 'create':
      if (module) {
        const entityName = module.slice(0, -1); // Remove 's' from plural
        return {
          action: "open_modal",
          module,
          type: "create",
          message: `Opening form to create a new ${entityName}.`
        };
      } else {
        return {
          action: "respond",
          message: "I can help you create: Leads, Tickets, Deals, Projects, Tasks, Emails, Users, or Companies. What would you like to create?"
        };
      }
      
    case 'search':
      if (module) {
        const searchTerm = context[0] || target.replace(new RegExp(Object.keys(MODULE_MAPPINGS).join('|'), 'gi'), '').trim();
        return {
          action: "navigate",
          module,
          data: { search: searchTerm },
          message: searchTerm ? `Searching for "${searchTerm}" in ${module}.` : `Showing all ${module}.`
        };
      } else {
        return {
          action: "respond",
          message: "I can search through: Leads, Tickets, Deals, Projects, Tasks, Emails, Users, or Companies. What would you like to search for?"
        };
      }
      
    case 'update':
      return {
        action: "respond",
        message: "To update records, please navigate to the specific module and select the item you want to modify. I can help you navigate there if you tell me what you want to update."
      };
      
    case 'delete':
      return {
        action: "respond",
        message: "To delete records, please navigate to the specific module and select the item you want to remove. I can help you navigate there if you tell me what you want to delete."
      };
      
    case 'status':
      if (module === 'dashboard' || target.includes('overview') || target.includes('summary')) {
        return {
          action: "navigate",
          module: "dashboard",
          message: "Showing dashboard with current statistics and overview."
        };
      } else if (module) {
        return {
          action: "navigate",
          module,
          message: `Showing ${module} status and information.`
        };
      } else {
        return {
          action: "navigate",
          module: "dashboard",
          message: "Showing overall system status and statistics."
        };
      }
      
    case 'assign':
      return {
        action: "respond",
        message: "To assign items, please navigate to the specific module (Leads, Tickets, Deals, Projects, or Tasks) and select the item you want to assign. I can help you navigate there."
      };
      
    default:
      // Try to handle common business queries
      if (originalMessage.toLowerCase().includes('help')) {
        return {
          action: "respond",
          message: "I can help you with: Navigate (go to any module), Create (add new records), Search (find specific items), View status (see dashboard), and manage all your business data. What would you like to do?"
        };
      }
      
      if (originalMessage.toLowerCase().includes('stats') || originalMessage.toLowerCase().includes('numbers')) {
        return {
          action: "navigate",
          module: "dashboard",
          message: "Showing your business statistics and key metrics."
        };
      }
      
      return {
        action: "respond",
        message: "I understand you want to work with your business data. I can help you navigate to different modules, create new records, search for information, or show statistics. Try saying something like 'show me leads', 'create a new ticket', or 'go to dashboard'."
      };
  }
}

export async function processLocalAIMessage(message: string): Promise<AIResponse> {
  try {
    const intent = extractIntent(message);
    const response = generateResponse(intent, message);
    
    // Log for debugging
    console.log('AI Intent:', intent);
    console.log('AI Response:', response);
    
    return response;
  } catch (error) {
    console.error('AI Processing Error:', error);
    return {
      action: "respond",
      message: "I'm having trouble understanding that request. Try asking me to navigate to a specific module, create a new record, or search for information."
    };
  }
}

export function suggestCorrections(message: string): string[] {
  const suggestions = [];
  const words = normalizeText(message).split(/\s+/);
  
  // Suggest module names if partial matches found
  for (const word of words) {
    for (const [key, value] of Object.entries(MODULE_MAPPINGS)) {
      if (key.includes(word) || word.includes(key)) {
        suggestions.push(`Did you mean "${key}"?`);
      }
    }
  }
  
  // Common suggestions
  if (message.length < 3) {
    suggestions.push("Try asking me to 'show dashboard' or 'create new lead'");
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}