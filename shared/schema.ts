import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const personnel = pgTable("personnel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(),
  startDate: timestamp("start_date").notNull(),
  phone: text("phone"),
  email: text("email"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  salaryType: text("salary_type").default("monthly"), // "monthly" or "daily"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "given" or "received"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // "active", "passive", "completed"
  description: text("description"),
  clientName: text("client_name"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const timesheets = pgTable("timesheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").notNull(),
  customerId: varchar("customer_id"),
  date: timestamp("date").notNull(),
  workType: text("work_type").notNull(), // "tam", "yarim", "mesai"
  startTime: text("start_time"),
  endTime: text("end_time"),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }).default("0.00"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  dailyWage: decimal("daily_wage", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "income" or "expense"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const contractors = pgTable("contractors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone"),
  email: text("email"),
  status: text("status").notNull(), // "active", "completed"
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  taxNumber: text("tax_number"),
  status: text("status").notNull().default("active"), // "active", "inactive"
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Customer Tasks (Yapılacak İşler)
export const customerTasks = pgTable("customer_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "in_progress", "completed"
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Customer Quotes (Müşteri Teklifleri)
export const customerQuotes = pgTable("customer_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  isApproved: boolean("is_approved").default(false),
  quoteDate: timestamp("quote_date").notNull(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Customer Quote Items (Teklif Kalemleri)
export const customerQuoteItems = pgTable("customer_quote_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: varchar("quote_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Customer Payments (Müşteri Ödemeleri)
export const customerPayments = pgTable("customer_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method"), // "cash", "bank_transfer", "check", "other"
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Contractor Tasks (Yüklenici Görevleri)
export const contractorTasks = pgTable("contractor_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractorId: varchar("contractor_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "in_progress", "completed"
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Contractor Payments (Yüklenici Ödemeleri)
export const contractorPayments = pgTable("contractor_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractorId: varchar("contractor_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method"), // "cash", "bank_transfer", "check", "other"
  transactionId: varchar("transaction_id"), // Link to auto-created expense transaction
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("18.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"), // "draft", "sent", "paid", "overdue"
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("1.00"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "financial", "timesheet", "project", "custom"
  config: text("config").notNull(), // JSON string
  createdBy: text("created_by").notNull(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas
export const insertPersonnelSchema = createInsertSchema(personnel).omit({
  id: true,
  createdAt: true,
}).extend({
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
}).extend({
  description: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  createdAt: true,
}).extend({
  customerId: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  hourlyRate: z.string().optional().nullable(),
  dailyWage: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  overtimeHours: z.string().optional().nullable(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  category: z.string().optional().nullable(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  createdAt: true,
}).extend({
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
}).extend({
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
});

export const insertCustomerTaskSchema = createInsertSchema(customerTasks).omit({
  id: true,
  createdAt: true,
}).extend({
  description: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

export const insertCustomerQuoteSchema = createInsertSchema(customerQuotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  description: z.string().optional().nullable(),
  validUntil: z.date().optional().nullable(),
});

export const insertCustomerQuoteItemSchema = createInsertSchema(customerQuoteItems).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerPaymentSchema = createInsertSchema(customerPayments).omit({
  id: true,
  createdAt: true,
}).extend({
  paymentMethod: z.string().optional().nullable(),
});

export const insertContractorTaskSchema = createInsertSchema(contractorTasks).omit({
  id: true,
  createdAt: true,
}).extend({
  description: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

export const insertContractorPaymentSchema = createInsertSchema(contractorPayments).omit({
  id: true,
  createdAt: true,
}).extend({
  paymentMethod: z.string().optional().nullable(),
  transactionId: z.string().optional().nullable(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

// Personnel Payments table
export const personnelPayments = pgTable("personnel_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personnelId: varchar("personnel_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentType: text("payment_type").notNull(), // "salary", "bonus", "advance", "deduction"
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPersonnelPaymentSchema = createInsertSchema(personnelPayments).omit({
  id: true,
  createdAt: true,
}).extend({
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Types
export type Personnel = typeof personnel.$inferSelect;
export type InsertPersonnel = z.infer<typeof insertPersonnelSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type PersonnelPayment = typeof personnelPayments.$inferSelect;
export type InsertPersonnelPayment = z.infer<typeof insertPersonnelPaymentSchema>;

export type Timesheet = typeof timesheets.$inferSelect;
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type CustomerTask = typeof customerTasks.$inferSelect;
export type InsertCustomerTask = z.infer<typeof insertCustomerTaskSchema>;

export type CustomerQuote = typeof customerQuotes.$inferSelect;
export type InsertCustomerQuote = z.infer<typeof insertCustomerQuoteSchema>;

export type CustomerQuoteItem = typeof customerQuoteItems.$inferSelect;
export type InsertCustomerQuoteItem = z.infer<typeof insertCustomerQuoteItemSchema>;

export type CustomerPayment = typeof customerPayments.$inferSelect;
export type InsertCustomerPayment = z.infer<typeof insertCustomerPaymentSchema>;

export type ContractorTask = typeof contractorTasks.$inferSelect;
export type InsertContractorTask = z.infer<typeof insertContractorTaskSchema>;

export type ContractorPayment = typeof contractorPayments.$inferSelect;
export type InsertContractorPayment = z.infer<typeof insertContractorPaymentSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
