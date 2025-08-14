import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // Added for regular user authentication
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false), // Admin flag
  status: varchar("status").default("ACTIVE"), // User status: ACTIVE, SUSPENDED
  role: varchar("role").default("USER"), // User role: USER, ADMIN, SUPER_ADMIN
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const personnel = pgTable("personnel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Foreign key to users table
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
  userId: varchar("user_id").notNull(), // Foreign key to users table
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
  userId: varchar("user_id").notNull(), // Foreign key to users table
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
  userId: varchar("user_id").notNull(), // Foreign key to users table
  type: text("type").notNull(), // "income" or "expense"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Foreign key to users table
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const contractors = pgTable("contractors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Foreign key to users table
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
  userId: varchar("user_id").notNull(), // Foreign key to users table
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
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull().default("1.00"),
  unit: text("unit").notNull().default("adet"), // "adet", "m2", "m"
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull().default("0"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  hasVAT: boolean("has_vat").default(false),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("1.00"), // %1 KDV
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalWithVAT: decimal("total_with_vat", { precision: 10, scale: 2 }).notNull().default("0"),
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
  hasVAT: boolean("has_vat").default(false),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("1.00"), // %1 KDV
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalWithVAT: decimal("total_with_vat", { precision: 10, scale: 2 }).notNull().default("0"),
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
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull().default("1.00"),
  unit: text("unit").notNull().default("adet"), // "adet", "m2", "m"
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  isApproved: boolean("is_approved").default(false),
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
  userId: true, // Server will add this
}).extend({
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  userId: true, // Server will add this
}).extend({
  description: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  createdAt: true,
  userId: true, // Server will add this
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
  userId: true, // Server will add this
}).extend({
  category: z.string().optional().nullable(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  userId: true, // Server will add this
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  createdAt: true,
  userId: true, // Server will add this
}).extend({
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  userId: true, // Server will add this
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
  quantity: z.number().min(0.1),
  unitPrice: z.number().min(0),
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
}).extend({
  description: z.string().optional().nullable(),
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

// Company Directory table
export const companyDirectory = pgTable("company_directory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Owner of this company entry
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"), // Şehir
  industry: text("industry"), // Sektör
  website: text("website"),
  description: text("description"),
  bio: text("bio"), // Biyografi
  logoUrl: text("logo_url"), // Logo URL
  isActive: boolean("is_active").default(true),
  isProVisible: boolean("is_pro_visible").default(false), // PRO üyelik görünürlüğü
  isVerified: boolean("is_verified").default(false), // Doğrulanmış firma rozeti
  subscriptionStatus: text("subscription_status").default("FREE"), // FREE, PRO
  profileImage: text("profile_image"), // Avatar URL
  verifiedAt: timestamp("verified_at"),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Messages table for company messaging
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),      // Gönderen kullanıcı ID
  toUserId: varchar("to_user_id").notNull(),          // Alan kullanıcı ID
  fromCompanyId: varchar("from_company_id").notNull(), // Gönderen firma ID
  toCompanyId: varchar("to_company_id").notNull(),     // Alan firma ID
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  messageType: text("message_type").default("text"), // "text", "image", "file"
  attachmentUrl: text("attachment_url"), // Dosya ekler için
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Conversations table for organizing messages
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company1Id: varchar("company1_id").notNull(),
  company2Id: varchar("company2_id").notNull(),
  lastMessageId: varchar("last_message_id"),
  lastMessageAt: timestamp("last_message_at"),
  unreadCount1: integer("unread_count1").default(0), // company1 için okunmamış mesaj sayısı
  unreadCount2: integer("unread_count2").default(0), // company2 için okunmamış mesaj sayısı
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Notification system for messaging
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // NEW_DM, DM_DELIVERED, DM_READ, PROFILE_VERIFIED
  payload: jsonb("payload"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Company blocking system
export const companyBlocks = pgTable("company_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerCompanyId: varchar("blocker_company_id").notNull(),
  blockedCompanyId: varchar("blocked_company_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Company mute system
export const companyMutes = pgTable("company_mutes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  muterCompanyId: varchar("muter_company_id").notNull(),
  mutedCompanyId: varchar("muted_company_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Report abuse system
export const abuseReports = pgTable("abuse_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterCompanyId: varchar("reporter_company_id").notNull(),
  reportedCompanyId: varchar("reported_company_id").notNull(),
  reason: text("reason").notNull(),
  messageSample: text("message_sample"),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCompanyDirectorySchema = createInsertSchema(companyDirectory).omit({
  id: true,
  userId: true, // Server will add this
  createdAt: true,
  lastSeen: true,
  profileImage: true,
  verifiedAt: true,
  isVerified: true,
}).extend({
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  bio: z.string().optional(),
  logoUrl: z.string().optional(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Firm Invite System
export const firmInvites = pgTable("firm_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firmId: varchar("firm_id").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // "ADMIN" | "USER"
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdByUserId: varchar("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Presence Logs
export const presenceLogs = pgTable("presence_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firmId: varchar("firm_id").notNull(),
  userId: varchar("user_id").notNull(),
  lastHeartbeatAt: timestamp("last_heartbeat_at").default(sql`now()`),
  clientInfo: text("client_info"), // User agent/IP
  updatedAt: timestamp("updated_at").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
  index("idx_presence_firm_user").on(table.firmId, table.userId)
]);

// Message Drafts
export const messageDrafts = pgTable("message_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull(),
  authorFirmId: varchar("author_firm_id").notNull(),
  body: text("body").notNull().default(""),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
  index("idx_draft_thread_author").on(table.threadId, table.authorFirmId)
]);

// Auto Responder
export const autoResponders = pgTable("auto_responders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firmId: varchar("firm_id").notNull(),
  enabled: boolean("enabled").default(false),
  mode: text("mode").notNull().default("KEYWORD"), // "KEYWORD" | "ALWAYS" | "OFFHOURS"
  keywords: jsonb("keywords"), // string[]
  offHoursTZ: text("off_hours_tz"), // "Europe/Istanbul"
  offHours: jsonb("off_hours"), // { days: number[], start: string, end: string }
  cooldownSec: integer("cooldown_sec").default(600),
  messageBody: text("message_body").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Auto Reply Logs (to track cooldowns)
export const autoReplyLogs = pgTable("auto_reply_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  responderFirmId: varchar("responder_firm_id").notNull(),
  targetFirmId: varchar("target_firm_id").notNull(),
  lastReplyAt: timestamp("last_reply_at").default(sql`now()`),
  messageId: varchar("message_id"),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
  index("idx_auto_reply_firms").on(table.responderFirmId, table.targetFirmId)
]);

// Enhanced Messages with image support
export const directThreads = pgTable("direct_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firm1Id: varchar("firm1_id").notNull(),
  firm2Id: varchar("firm2_id").notNull(),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
  index("idx_thread_firms").on(table.firm1Id, table.firm2Id)
]);

export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull(),
  senderFirmId: varchar("sender_firm_id").notNull(),
  receiverFirmId: varchar("receiver_firm_id").notNull(),
  body: text("body"),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"), // "image" | "file"
  attachmentThumbUrl: text("attachment_thumb_url"), // thumbnail for images
  messageType: text("message_type").default("user"), // "user" | "auto_reply"
  isRead: boolean("is_read").default(false),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
  index("idx_message_thread").on(table.threadId),
  index("idx_message_receiver").on(table.receiverFirmId)
]);

// Image Upload Logs
export const imageUploads = pgTable("image_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  firmId: varchar("firm_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  url: text("url").notNull(),
  thumbUrl: text("thumb_url"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas for new tables
export const insertFirmInviteSchema = createInsertSchema(firmInvites).omit({
  id: true,
  tokenHash: true,
  createdAt: true,
});

export const insertPresenceLogSchema = createInsertSchema(presenceLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageDraftSchema = createInsertSchema(messageDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutoResponderSchema = createInsertSchema(autoResponders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDirectThreadSchema = createInsertSchema(directThreads).omit({
  id: true,
  createdAt: true,
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({
  id: true,
  createdAt: true,
  deliveredAt: true,
  readAt: true,
});

export const insertImageUploadSchema = createInsertSchema(imageUploads).omit({
  id: true,
  createdAt: true,
});

// Types
export type FirmInvite = typeof firmInvites.$inferSelect;
export type InsertFirmInvite = z.infer<typeof insertFirmInviteSchema>;

export type PresenceLog = typeof presenceLogs.$inferSelect;
export type InsertPresenceLog = z.infer<typeof insertPresenceLogSchema>;

export type MessageDraft = typeof messageDrafts.$inferSelect;
export type InsertMessageDraft = z.infer<typeof insertMessageDraftSchema>;

export type AutoResponder = typeof autoResponders.$inferSelect;
export type InsertAutoResponder = z.infer<typeof insertAutoResponderSchema>;

export type DirectThread = typeof directThreads.$inferSelect;
export type InsertDirectThread = z.infer<typeof insertDirectThreadSchema>;

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;

export type ImageUpload = typeof imageUploads.$inferSelect;
export type InsertImageUpload = z.infer<typeof insertImageUploadSchema>;

export type Notification = typeof notifications.$inferSelect;
export type CompanyDirectory = typeof companyDirectory.$inferSelect;

export const insertCompanyBlockSchema = createInsertSchema(companyBlocks).omit({
  id: true,
  createdAt: true,
});

export const insertCompanyMuteSchema = createInsertSchema(companyMutes).omit({
  id: true,
  createdAt: true,
});

export const insertAbuseReportSchema = createInsertSchema(abuseReports).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
  resolvedBy: true,
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

export type CompanyDirectory = typeof companyDirectory.$inferSelect;
export type InsertCompanyDirectory = z.infer<typeof insertCompanyDirectorySchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type CompanyBlock = typeof companyBlocks.$inferSelect;
export type InsertCompanyBlock = z.infer<typeof insertCompanyBlockSchema>;

export type CompanyMute = typeof companyMutes.$inferSelect;
export type InsertCompanyMute = z.infer<typeof insertCompanyMuteSchema>;

export type AbuseReport = typeof abuseReports.$inferSelect;
export type InsertAbuseReport = z.infer<typeof insertAbuseReportSchema>;

// SMS Management System
export const smsHistory = pgTable("sms_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Foreign key to users table
  message: text("message").notNull(),
  recipientCount: integer("recipient_count").notNull(),
  recipientData: jsonb("recipient_data").notNull(), // Array of {id, name, phone, type}
  templateId: varchar("template_id"), // Optional template reference
  status: text("status").notNull().default("pending"), // "pending", "sent", "failed"
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  netgsmResponse: jsonb("netgsm_response"), // NetGSM API response
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const smsTemplates = pgTable("sms_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Foreign key to users table
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // "personnel", "customer", "general"
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSMSHistorySchema = createInsertSchema(smsHistory).omit({
  id: true,
  userId: true,
  createdAt: true,
  sentAt: true,
}).extend({
  templateId: z.string().optional().nullable(),
  errorMessage: z.string().optional().nullable(),
  netgsmResponse: z.any().optional().nullable(),
});

export const insertSMSTemplateSchema = createInsertSchema(smsTemplates).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  usageCount: z.number().optional(),
});

export type SMSHistory = typeof smsHistory.$inferSelect;
export type InsertSMSHistory = z.infer<typeof insertSMSHistorySchema>;

export type SMSTemplate = typeof smsTemplates.$inferSelect;
export type InsertSMSTemplate = z.infer<typeof insertSMSTemplateSchema>;

// Admin Panel Tables
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").notNull(),
  action: text("action").notNull(), // "USER_SUSPENDED", "FEATURE_TOGGLED", etc.
  targetEntity: text("target_entity"), // "User", "Firm", "System"
  targetId: varchar("target_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  category: text("category").default("general"), // "general", "email", "sms", "billing"
  updatedBy: varchar("updated_by"),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  level: text("level").default("info"), // "info", "warning", "critical"
  targets: jsonb("targets").default('["all"]'), // ["all"] or ["user:id", "admin"]
  publishAt: timestamp("publish_at").default(sql`now()`),
  expireAt: timestamp("expire_at"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionToken: text("session_token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
  expiresAt: timestamp("expires_at").notNull(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricType: text("metric_type").notNull(), // "users", "messages", "storage", "api_calls"
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  metadata: jsonb("metadata"),
  recordedAt: timestamp("recorded_at").default(sql`now()`),
});

// Insert schemas for admin tables
export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  recordedAt: true,
});

// Admin Notes Table - for admin comments on users
export const adminNotes = pgTable("admin_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetUserId: varchar("target_user_id").notNull(), // User being noted
  adminUserId: varchar("admin_user_id").notNull(), // Admin making the note
  note: text("note").notNull(),
  category: text("category").default("general"), // "general", "warning", "positive", "violation"
  isPrivate: boolean("is_private").default(true), // Private to admins only
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAdminNoteSchema = createInsertSchema(adminNotes).omit({
  id: true,
  createdAt: true,
});

// Types for admin panel
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;

export type AdminNote = typeof adminNotes.$inferSelect;
export type InsertAdminNote = z.infer<typeof insertAdminNoteSchema>;
