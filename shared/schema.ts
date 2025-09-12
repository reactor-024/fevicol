import { pgTable, text, varchar, timestamp, integer, serial, boolean, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Organizations for multi-tenant isolation
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 50 }).unique().notNull(),
  settings: json("settings").$type<Record<string, any>>().default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User roles and permissions
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  permissions: json("permissions").$type<string[]>().default([]),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  avatar: varchar("avatar", { length: 500 }),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  roleId: integer("role_id").references(() => userRoles.id).default(1),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  notes: text("notes"),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
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
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastContactedAt: timestamp("last_contacted_at"),
});

export const tickets = pgTable("tickets", {
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
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deals = pgTable("deals", {
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
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
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
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
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
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emails = pgTable("emails", {
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
  attachments: json("attachments").$type<string[]>().default([]),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: integer("entity_id"),
  userId: integer("user_id").references(() => users.id),
  metadata: json("metadata"),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  config: json("config").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  userRoles: many(userRoles),
  companies: many(companies),
  leads: many(leads),
  tickets: many(tickets),
  deals: many(deals),
  projects: many(projects),
  tasks: many(tasks),
  emails: many(emails),
  activities: many(activities),
  reports: many(reports),
}));

export const userRolesRelations = relations(userRoles, ({ one, many }) => ({
  organization: one(organizations, { fields: [userRoles.organizationId], references: [organizations.id] }),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, { fields: [users.organizationId], references: [organizations.id] }),
  role: one(userRoles, { fields: [users.roleId], references: [userRoles.id] }),
  assignedLeads: many(leads),
  assignedTickets: many(tickets),
  assignedDeals: many(deals),
  managedProjects: many(projects),
  assignedTasks: many(tasks),
  sentEmails: many(emails),
  activities: many(activities),
  reports: many(reports),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  leads: many(leads),
  deals: many(deals),
  projects: many(projects),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  company: one(companies, { fields: [leads.companyId], references: [companies.id] }),
  assignedUser: one(users, { fields: [leads.assignedTo], references: [users.id] }),
  deals: many(deals),
  tickets: many(tickets),
  emails: many(emails),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  assignedUser: one(users, { fields: [tickets.assignedTo], references: [users.id] }),
  reportedByUser: one(users, { fields: [tickets.reportedBy], references: [users.id] }),
  lead: one(leads, { fields: [tickets.leadId], references: [leads.id] }),
  emails: many(emails),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  lead: one(leads, { fields: [deals.leadId], references: [leads.id] }),
  company: one(companies, { fields: [deals.companyId], references: [companies.id] }),
  assignedUser: one(users, { fields: [deals.assignedTo], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(companies, { fields: [projects.clientId], references: [companies.id] }),
  manager: one(users, { fields: [projects.managerId], references: [users.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignedUser: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  parentTask: one(tasks, { fields: [tasks.parentTaskId], references: [tasks.id], relationName: "parentTask" }),
  subtasks: many(tasks, { relationName: "parentTask" }),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  lead: one(leads, { fields: [emails.leadId], references: [leads.id] }),
  ticket: one(tickets, { fields: [emails.ticketId], references: [tickets.id] }),
  deal: one(deals, { fields: [emails.dealId], references: [deals.id] }),
  sentByUser: one(users, { fields: [emails.sentBy], references: [users.id] }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  createdByUser: one(users, { fields: [reports.createdBy], references: [users.id] }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  lastContactedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  sentAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
