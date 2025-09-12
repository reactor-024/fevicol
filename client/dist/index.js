var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import path3 from "path";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  activitiesRelations: () => activitiesRelations,
  companies: () => companies,
  companiesRelations: () => companiesRelations,
  deals: () => deals,
  dealsRelations: () => dealsRelations,
  emails: () => emails,
  emailsRelations: () => emailsRelations,
  insertActivitySchema: () => insertActivitySchema,
  insertCompanySchema: () => insertCompanySchema,
  insertDealSchema: () => insertDealSchema,
  insertEmailSchema: () => insertEmailSchema,
  insertLeadSchema: () => insertLeadSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertReportSchema: () => insertReportSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTicketSchema: () => insertTicketSchema,
  insertUserRoleSchema: () => insertUserRoleSchema,
  insertUserSchema: () => insertUserSchema,
  leads: () => leads,
  leadsRelations: () => leadsRelations,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  reports: () => reports,
  reportsRelations: () => reportsRelations,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  tickets: () => tickets,
  ticketsRelations: () => ticketsRelations,
  userRoles: () => userRoles,
  userRolesRelations: () => userRolesRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, varchar, timestamp, integer, serial, boolean, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).unique().notNull(),
  description: text("description"),
  permissions: json("permissions").$type().default([]),
  createdAt: timestamp("created_at").defaultNow()
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  avatar: varchar("avatar", { length: 500 }),
  roleId: integer("role_id").references(() => userRoles.id).default(1),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  jobTitle: varchar("job_title", { length: 100 }),
  companyId: integer("company_id").references(() => companies.id),
  status: varchar("status", { length: 50 }).default("new"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  source: varchar("source", { length: 100 }),
  tags: text("tags").array(),
  notes: text("notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  lastContactedAt: timestamp("last_contacted_at")
});
var tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).default("open"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  category: varchar("category", { length: 100 }),
  assignedTo: integer("assigned_to").references(() => users.id),
  reportedBy: integer("reported_by").references(() => users.id),
  leadId: integer("lead_id").references(() => leads.id),
  resolution: text("resolution"),
  tags: text("tags").array(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  stage: varchar("stage", { length: 50 }).default("prospecting"),
  probability: integer("probability").default(0),
  leadId: integer("lead_id").references(() => leads.id),
  companyId: integer("company_id").references(() => companies.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow()
});
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("active"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  progress: integer("progress").default(0),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  clientId: integer("client_id").references(() => companies.id),
  managerId: integer("manager_id").references(() => users.id),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow()
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("todo"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  assignedTo: integer("assigned_to").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  parentTaskId: integer("parent_task_id"),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  dueDate: timestamp("due_date"),
  startDate: timestamp("start_date"),
  completedAt: timestamp("completed_at"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow()
});
var emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  to: varchar("to", { length: 255 }).notNull(),
  cc: varchar("cc", { length: 500 }),
  bcc: varchar("bcc", { length: 500 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  status: varchar("status", { length: 50 }).default("sent"),
  type: varchar("type", { length: 50 }).default("outbound"),
  leadId: integer("lead_id").references(() => leads.id),
  ticketId: integer("ticket_id").references(() => tickets.id),
  dealId: integer("deal_id").references(() => deals.id),
  sentBy: integer("sent_by").references(() => users.id),
  sentAt: timestamp("sent_at").defaultNow(),
  attachments: json("attachments").$type().default([])
});
var activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  userId: integer("user_id").references(() => users.id),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});
var reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  config: json("config").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users)
}));
var usersRelations = relations(users, ({ one, many }) => ({
  role: one(userRoles, { fields: [users.roleId], references: [userRoles.id] }),
  assignedLeads: many(leads),
  assignedTickets: many(tickets),
  assignedDeals: many(deals),
  managedProjects: many(projects),
  assignedTasks: many(tasks),
  sentEmails: many(emails),
  activities: many(activities),
  reports: many(reports)
}));
var companiesRelations = relations(companies, ({ many }) => ({
  leads: many(leads),
  deals: many(deals),
  projects: many(projects)
}));
var leadsRelations = relations(leads, ({ one, many }) => ({
  company: one(companies, { fields: [leads.companyId], references: [companies.id] }),
  assignedUser: one(users, { fields: [leads.assignedTo], references: [users.id] }),
  deals: many(deals),
  tickets: many(tickets),
  emails: many(emails)
}));
var ticketsRelations = relations(tickets, ({ one, many }) => ({
  assignedUser: one(users, { fields: [tickets.assignedTo], references: [users.id] }),
  reportedByUser: one(users, { fields: [tickets.reportedBy], references: [users.id] }),
  lead: one(leads, { fields: [tickets.leadId], references: [leads.id] }),
  emails: many(emails)
}));
var dealsRelations = relations(deals, ({ one }) => ({
  lead: one(leads, { fields: [deals.leadId], references: [leads.id] }),
  company: one(companies, { fields: [deals.companyId], references: [companies.id] }),
  assignedUser: one(users, { fields: [deals.assignedTo], references: [users.id] })
}));
var projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(companies, { fields: [projects.clientId], references: [companies.id] }),
  manager: one(users, { fields: [projects.managerId], references: [users.id] }),
  tasks: many(tasks)
}));
var tasksRelations = relations(tasks, ({ one, many }) => ({
  assignedUser: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  parentTask: one(tasks, { fields: [tasks.parentTaskId], references: [tasks.id], relationName: "parentTask" }),
  subtasks: many(tasks, { relationName: "parentTask" })
}));
var emailsRelations = relations(emails, ({ one }) => ({
  lead: one(leads, { fields: [emails.leadId], references: [leads.id] }),
  ticket: one(tickets, { fields: [emails.ticketId], references: [tickets.id] }),
  deal: one(deals, { fields: [emails.dealId], references: [deals.id] }),
  sentByUser: one(users, { fields: [emails.sentBy], references: [users.id] })
}));
var activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] })
}));
var reportsRelations = relations(reports, ({ one }) => ({
  createdByUser: one(users, { fields: [reports.createdBy], references: [users.id] })
}));
var insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true
});
var insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true
});
var insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  lastContactedAt: true
});
var insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true
});
var insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});
var insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  sentAt: true
});
var insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true
});
var insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, or, desc, asc, like } from "drizzle-orm";
var DatabaseStorage = class {
  // User roles
  async getUserRoles() {
    return await db.select().from(userRoles).orderBy(asc(userRoles.name));
  }
  async createUserRole(userRole) {
    const [result] = await db.insert(userRoles).values([userRole]).returning();
    return result;
  }
  // Users
  async getUsers() {
    return await db.select().from(users).orderBy(asc(users.fullName));
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Companies
  async getCompanies() {
    return await db.select().from(companies).orderBy(asc(companies.name));
  }
  async getCompany(id) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }
  async createCompany(insertCompany) {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }
  async updateCompany(id, updates) {
    const [company] = await db.update(companies).set(updates).where(eq(companies.id, id)).returning();
    return company;
  }
  async deleteCompany(id) {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Leads
  async getLeads() {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }
  async getLead(id) {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }
  async getLeadsByAssignee(assigneeId) {
    return await db.select().from(leads).where(eq(leads.assignedTo, assigneeId));
  }
  async createLead(insertLead) {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }
  async updateLead(id, updates) {
    const [lead] = await db.update(leads).set(updates).where(eq(leads.id, id)).returning();
    return lead;
  }
  async deleteLead(id) {
    const result = await db.delete(leads).where(eq(leads.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Tickets
  async getTickets() {
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }
  async getTicket(id) {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }
  async getTicketsByAssignee(assigneeId) {
    return await db.select().from(tickets).where(eq(tickets.assignedTo, assigneeId));
  }
  async createTicket(insertTicket) {
    const [ticket] = await db.insert(tickets).values(insertTicket).returning();
    return ticket;
  }
  async updateTicket(id, updates) {
    const [ticket] = await db.update(tickets).set(updates).where(eq(tickets.id, id)).returning();
    return ticket;
  }
  async deleteTicket(id) {
    const result = await db.delete(tickets).where(eq(tickets.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Deals
  async getDeals() {
    return await db.select().from(deals).orderBy(desc(deals.createdAt));
  }
  async getDeal(id) {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }
  async getDealsByAssignee(assigneeId) {
    return await db.select().from(deals).where(eq(deals.assignedTo, assigneeId));
  }
  async createDeal(insertDeal) {
    const [deal] = await db.insert(deals).values(insertDeal).returning();
    return deal;
  }
  async updateDeal(id, updates) {
    const [deal] = await db.update(deals).set(updates).where(eq(deals.id, id)).returning();
    return deal;
  }
  async deleteDeal(id) {
    const result = await db.delete(deals).where(eq(deals.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Projects
  async getProjects() {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }
  async getProject(id) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  async getProjectsByManager(managerId) {
    return await db.select().from(projects).where(eq(projects.managerId, managerId));
  }
  async createProject(insertProject) {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }
  async updateProject(id, updates) {
    const [project] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return project;
  }
  async deleteProject(id) {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Tasks
  async getTasks() {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }
  async getTask(id) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  async getTasksByProject(projectId) {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }
  async getTasksByAssignee(assigneeId) {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, assigneeId));
  }
  async createTask(insertTask) {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }
  async updateTask(id, updates) {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task;
  }
  async deleteTask(id) {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Emails
  async getEmails() {
    return await db.select().from(emails).orderBy(desc(emails.sentAt));
  }
  async getEmail(id) {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email;
  }
  async getEmailsByLead(leadId) {
    return await db.select().from(emails).where(eq(emails.leadId, leadId));
  }
  async createEmail(insertEmail) {
    const [email] = await db.insert(emails).values([insertEmail]).returning();
    return email;
  }
  async updateEmail(id, updates) {
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key, value]) => value !== void 0)
    );
    const [email] = await db.update(emails).set(cleanUpdates).where(eq(emails.id, id)).returning();
    return email;
  }
  async deleteEmail(id) {
    const result = await db.delete(emails).where(eq(emails.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Activities
  async getActivities() {
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }
  async getActivity(id) {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }
  async getActivitiesByUser(userId) {
    return await db.select().from(activities).where(eq(activities.userId, userId));
  }
  async createActivity(insertActivity) {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }
  // Reports
  async getReports() {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }
  async getReport(id) {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }
  async createReport(insertReport) {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }
  async updateReport(id, updates) {
    const [report] = await db.update(reports).set(updates).where(eq(reports.id, id)).returning();
    return report;
  }
  async deleteReport(id) {
    const result = await db.delete(reports).where(eq(reports.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Search functions
  async searchLeads(query) {
    return await db.select().from(leads).where(
      or(
        like(leads.name, `%${query}%`),
        like(leads.email, `%${query}%`),
        like(leads.notes, `%${query}%`)
      )
    );
  }
  async searchTickets(query) {
    return await db.select().from(tickets).where(
      or(
        like(tickets.title, `%${query}%`),
        like(tickets.description, `%${query}%`)
      )
    );
  }
  async searchDeals(query) {
    return await db.select().from(deals).where(
      or(
        like(deals.title, `%${query}%`),
        like(deals.notes, `%${query}%`)
      )
    );
  }
  async searchProjects(query) {
    return await db.select().from(projects).where(
      or(
        like(projects.name, `%${query}%`),
        like(projects.description, `%${query}%`)
      )
    );
  }
};
var storage = new DatabaseStorage();

// server/localAI.ts
var INTENT_PATTERNS = {
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
var MODULE_MAPPINGS = {
  // CRM Module
  "lead": "leads",
  "leads": "leads",
  "customer": "leads",
  "customers": "leads",
  "prospect": "leads",
  "prospects": "leads",
  "contact": "leads",
  "contacts": "leads",
  "client": "leads",
  "clients": "leads",
  // Tickets Module
  "ticket": "tickets",
  "tickets": "tickets",
  "support": "tickets",
  "issue": "tickets",
  "issues": "tickets",
  "bug": "tickets",
  "bugs": "tickets",
  "problem": "tickets",
  "problems": "tickets",
  "help": "tickets",
  // Deals Module
  "deal": "deals",
  "deals": "deals",
  "sale": "deals",
  "sales": "deals",
  "opportunity": "deals",
  "opportunities": "deals",
  "revenue": "deals",
  "pipeline": "deals",
  // Projects Module
  "project": "projects",
  "projects": "projects",
  "work": "projects",
  "job": "projects",
  "jobs": "projects",
  // Tasks Module
  "task": "tasks",
  "tasks": "tasks",
  "todo": "tasks",
  "todos": "tasks",
  "assignment": "tasks",
  "assignments": "tasks",
  "action": "tasks",
  "actions": "tasks",
  // Email Module
  "email": "emails",
  "emails": "emails",
  "message": "emails",
  "messages": "emails",
  "mail": "emails",
  "communication": "emails",
  "correspondence": "emails",
  // Users Module
  "user": "users",
  "users": "users",
  "employee": "users",
  "employees": "users",
  "staff": "users",
  "team": "users",
  "member": "users",
  "members": "users",
  "person": "users",
  "people": "users",
  // Companies Module
  "company": "companies",
  "companies": "companies",
  "business": "companies",
  "businesses": "companies",
  "organization": "companies",
  "organizations": "companies",
  "firm": "companies",
  "firms": "companies",
  // Dashboard
  "dashboard": "dashboard",
  "home": "dashboard",
  "overview": "dashboard",
  "summary": "dashboard",
  "stats": "dashboard",
  "statistics": "dashboard",
  "metrics": "dashboard",
  "analytics": "dashboard",
  // Reports
  "report": "reports",
  "reports": "reports",
  "analytics": "reports",
  "insights": "reports",
  "data": "reports",
  "analysis": "reports"
};
function normalizeText(text2) {
  return text2.toLowerCase().replace(/[^\w\s]/g, "").trim();
}
function extractIntent(message) {
  const normalizedMessage = normalizeText(message);
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalizedMessage.match(pattern);
      if (match) {
        const target = match[1] || "";
        const context = match.slice(2).filter(Boolean);
        return { action: intent, target, context };
      }
    }
  }
  if (normalizedMessage.includes("create") || normalizedMessage.includes("add") || normalizedMessage.includes("new")) {
    return { action: "create", target: normalizedMessage, context: [] };
  }
  if (normalizedMessage.includes("find") || normalizedMessage.includes("search") || normalizedMessage.includes("show")) {
    return { action: "search", target: normalizedMessage, context: [] };
  }
  if (normalizedMessage.includes("go") || normalizedMessage.includes("open") || normalizedMessage.includes("navigate")) {
    return { action: "navigation", target: normalizedMessage, context: [] };
  }
  return { action: "respond", target: normalizedMessage, context: [] };
}
function generateResponse(intent, originalMessage) {
  const { action, target, context } = intent;
  const words = target.split(/\s+/);
  let module = null;
  for (const word of words) {
    if (MODULE_MAPPINGS[word]) {
      module = MODULE_MAPPINGS[word];
      break;
    }
  }
  switch (action) {
    case "navigation":
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
    case "create":
      if (module) {
        const entityName = module.slice(0, -1);
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
    case "search":
      if (module) {
        const searchTerm = context[0] || target.replace(new RegExp(Object.keys(MODULE_MAPPINGS).join("|"), "gi"), "").trim();
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
    case "update":
      return {
        action: "respond",
        message: "To update records, please navigate to the specific module and select the item you want to modify. I can help you navigate there if you tell me what you want to update."
      };
    case "delete":
      return {
        action: "respond",
        message: "To delete records, please navigate to the specific module and select the item you want to remove. I can help you navigate there if you tell me what you want to delete."
      };
    case "status":
      if (module === "dashboard" || target.includes("overview") || target.includes("summary")) {
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
    case "assign":
      return {
        action: "respond",
        message: "To assign items, please navigate to the specific module (Leads, Tickets, Deals, Projects, or Tasks) and select the item you want to assign. I can help you navigate there."
      };
    default:
      if (originalMessage.toLowerCase().includes("help")) {
        return {
          action: "respond",
          message: "I can help you with: Navigate (go to any module), Create (add new records), Search (find specific items), View status (see dashboard), and manage all your business data. What would you like to do?"
        };
      }
      if (originalMessage.toLowerCase().includes("stats") || originalMessage.toLowerCase().includes("numbers")) {
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
async function processLocalAIMessage(message) {
  try {
    const intent = extractIntent(message);
    const response = generateResponse(intent, message);
    console.log("AI Intent:", intent);
    console.log("AI Response:", response);
    return response;
  } catch (error) {
    console.error("AI Processing Error:", error);
    return {
      action: "respond",
      message: "I'm having trouble understanding that request. Try asking me to navigate to a specific module, create a new record, or search for information."
    };
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  try {
    const roles = await storage.getUserRoles();
    if (roles.length === 0) {
      await storage.createUserRole({ name: "admin", description: "Full system access", permissions: ["*"] });
      await storage.createUserRole({ name: "manager", description: "Team management", permissions: ["read", "write", "manage_team"] });
      await storage.createUserRole({ name: "user", description: "Basic user access", permissions: ["read", "write"] });
    }
    const users2 = await storage.getUsers();
    if (users2.length === 0) {
      await storage.createUser({
        username: "admin",
        email: "admin@flowcore.com",
        password: "admin123",
        fullName: "System Administrator",
        roleId: 1,
        isActive: true
      });
    }
  } catch (error) {
    console.error("Failed to initialize default data:", error);
  }
  app2.get("/api/user-roles", async (req, res) => {
    try {
      const roles = await storage.getUserRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/companies", async (req, res) => {
    try {
      const companies2 = await storage.getCompanies();
      res.json(companies2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });
  app2.post("/api/companies", async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid company data" });
    }
  });
  app2.put("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, companyData);
      if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
      }
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid company data" });
    }
  });
  app2.delete("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCompany(id);
      if (!success) {
        res.status(404).json({ message: "Company not found" });
        return;
      }
      res.json({ message: "Company deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });
  app2.get("/api/leads", async (req, res) => {
    try {
      const leads2 = await storage.getLeads();
      res.json(leads2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });
  app2.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        res.status(404).json({ message: "Lead not found" });
        return;
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });
  app2.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid lead data" });
    }
  });
  app2.put("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const leadData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(id, leadData);
      if (!lead) {
        res.status(404).json({ message: "Lead not found" });
        return;
      }
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid lead data" });
    }
  });
  app2.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLead(id);
      if (!success) {
        res.status(404).json({ message: "Lead not found" });
        return;
      }
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });
  app2.get("/api/tickets", async (req, res) => {
    try {
      const tickets2 = await storage.getTickets();
      res.json(tickets2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });
  app2.get("/api/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });
  app2.post("/api/tickets", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(ticketData);
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });
  app2.put("/api/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticketData = insertTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateTicket(id, ticketData);
      if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });
  app2.delete("/api/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTicket(id);
      if (!success) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }
      res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });
  app2.get("/api/deals", async (req, res) => {
    try {
      const deals2 = await storage.getDeals();
      res.json(deals2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });
  app2.get("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      if (!deal) {
        res.status(404).json({ message: "Deal not found" });
        return;
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });
  app2.post("/api/deals", async (req, res) => {
    try {
      const dealData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(dealData);
      res.json(deal);
    } catch (error) {
      res.status(400).json({ message: "Invalid deal data" });
    }
  });
  app2.put("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dealData = insertDealSchema.partial().parse(req.body);
      const deal = await storage.updateDeal(id, dealData);
      if (!deal) {
        res.status(404).json({ message: "Deal not found" });
        return;
      }
      res.json(deal);
    } catch (error) {
      res.status(400).json({ message: "Invalid deal data" });
    }
  });
  app2.delete("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDeal(id);
      if (!success) {
        res.status(404).json({ message: "Deal not found" });
        return;
      }
      res.json({ message: "Deal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });
  app2.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });
  app2.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });
  app2.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  app2.get("/api/tasks", async (req, res) => {
    try {
      const tasks2 = await storage.getTasks();
      res.json(tasks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  app2.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  app2.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, taskData);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });
  app2.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  app2.get("/api/emails", async (req, res) => {
    try {
      const emails2 = await storage.getEmails();
      res.json(emails2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });
  app2.get("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const email = await storage.getEmail(id);
      if (!email) {
        res.status(404).json({ message: "Email not found" });
        return;
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email" });
    }
  });
  app2.post("/api/emails", async (req, res) => {
    try {
      const emailData = insertEmailSchema.parse(req.body);
      const email = await storage.createEmail(emailData);
      res.json(email);
    } catch (error) {
      res.status(400).json({ message: "Invalid email data" });
    }
  });
  app2.put("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const emailData = insertEmailSchema.partial().parse(req.body);
      const email = await storage.updateEmail(id, emailData);
      if (!email) {
        res.status(404).json({ message: "Email not found" });
        return;
      }
      res.json(email);
    } catch (error) {
      res.status(400).json({ message: "Invalid email data" });
    }
  });
  app2.delete("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmail(id);
      if (!success) {
        res.status(404).json({ message: "Email not found" });
        return;
      }
      res.json({ message: "Email deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete email" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const { q, type } = req.query;
      if (!q || typeof q !== "string") {
        res.status(400).json({ message: "Query parameter 'q' is required" });
        return;
      }
      let results = {};
      if (!type || type === "leads") {
        results.leads = await storage.searchLeads(q);
      }
      if (!type || type === "tickets") {
        results.tickets = await storage.searchTickets(q);
      }
      if (!type || type === "deals") {
        results.deals = await storage.searchDeals(q);
      }
      if (!type || type === "projects") {
        results.projects = await storage.searchProjects(q);
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });
  app2.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        res.status(400).json({ message: "Message is required" });
        return;
      }
      const result = await processLocalAIMessage(message.trim());
      res.json(result);
    } catch (error) {
      console.error("Local AI Chat error:", error);
      res.json({
        action: "respond",
        message: "I'm sorry, I encountered an error. Please try again."
      });
    }
  });
  app2.get("/api/stats", async (req, res) => {
    try {
      const [leads2, tickets2, deals2, projects2, users2] = await Promise.all([
        storage.getLeads(),
        storage.getTickets(),
        storage.getDeals(),
        storage.getProjects(),
        storage.getUsers()
      ]);
      const stats = {
        totalLeads: leads2.length,
        activeTickets: tickets2.filter((t) => t.status !== "resolved").length,
        totalRevenue: deals2.reduce((sum, deal) => sum + parseFloat(deal.value.toString()), 0),
        activeProjects: projects2.filter((p) => p.status === "active").length,
        totalUsers: users2.length,
        recentActivity: [
          ...leads2.slice(-3).map((lead) => ({
            type: "lead",
            message: `New lead created: ${lead.name}`,
            timestamp: lead.createdAt
          })),
          ...tickets2.slice(-3).map((ticket) => ({
            type: "ticket",
            message: `Ticket ${ticket.status}: ${ticket.title}`,
            timestamp: ticket.updatedAt || ticket.createdAt
          })),
          ...deals2.slice(-3).map((deal) => ({
            type: "deal",
            message: `Deal ${deal.stage}: ${deal.title}`,
            timestamp: deal.createdAt
          }))
        ].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()).slice(0, 10)
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const pathStr = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathStr.startsWith("/api")) {
      let logLine = `${req.method} ${pathStr} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
    app.get("*", (req, res) => {
      res.sendFile(path3.resolve(__dirname, "../client/dist/index.html"));
    });
  }
  const port = 5e3;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
