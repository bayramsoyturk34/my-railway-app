import { 
  type Personnel, type InsertPersonnel,
  type Project, type InsertProject,
  type Timesheet, type InsertTimesheet,
  type Transaction, type InsertTransaction,
  type Note, type InsertNote,
  type Contractor, type InsertContractor,
  type Customer, type InsertCustomer,
  type CustomerTask, type InsertCustomerTask,
  type CustomerQuote, type InsertCustomerQuote,
  type CustomerQuoteItem, type InsertCustomerQuoteItem,
  type CustomerPayment, type InsertCustomerPayment,
  type ContractorTask, type InsertContractorTask,
  type ContractorPayment, type InsertContractorPayment,
  type PersonnelPayment, type InsertPersonnelPayment,
  type CompanyDirectory, type InsertCompanyDirectory,
  type Message, type InsertMessage,
  type Conversation, type InsertConversation,
  type Notification, type InsertNotification,
  type CompanyBlock, type InsertCompanyBlock,
  type CompanyMute, type InsertCompanyMute,
  type AbuseReport, type InsertAbuseReport,
  type User, type UpsertUser,
  type FirmInvite, type InsertFirmInvite,
  type PresenceLog, type InsertPresenceLog,
  type MessageDraft, type InsertMessageDraft,
  type AutoResponder, type InsertAutoResponder,
  type DirectThread, type InsertDirectThread,
  type DirectMessage, type InsertDirectMessage,
  type ImageUpload, type InsertImageUpload,
  type SMSHistory, type InsertSMSHistory,
  type SMSTemplate, type InsertSMSTemplate,
  type PaymentNotification, type InsertPaymentNotification,
  type AdminLog, type InsertAdminLog,
  type SystemSetting, type InsertSystemSetting,
  type Announcement, type InsertAnnouncement,
  type UserSession, type InsertUserSession,
  type SystemMetric, type InsertSystemMetric,
  type AdminNote, type InsertAdminNote,
  personnel, projects, timesheets, transactions, notes, contractors, customers,
  customerTasks, customerQuotes, customerQuoteItems, customerPayments, contractorTasks, contractorPayments, personnelPayments,
  companyDirectory, messages, conversations, notifications, companyBlocks, companyMutes, abuseReports, users,
  firmInvites, presenceLogs, messageDrafts, autoResponders, directThreads, directMessages, imageUploads, autoReplyLogs,
  smsHistory, smsTemplates, paymentNotifications, adminLogs, systemSettings, announcements, userSessions, systemMetrics, adminNotes
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, inArray, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations for authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User | undefined>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<void>;
  updateUserActiveStatus(userId: string, isActive: boolean): Promise<void>;
  getSystemSettings(): Promise<SystemSetting[]>;
  saveSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    demoUsers: number;
    todayRegistrations: number;
  }>;

  // Admin Notes
  getAdminNotesByUser(targetUserId: string): Promise<AdminNote[]>;
  createAdminNote(note: InsertAdminNote): Promise<AdminNote>;
  getAdminLogsRecent(): Promise<AdminLog[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getSystemMetrics(): Promise<SystemMetric[]>;
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;

  // Personnel
  getPersonnel(): Promise<Personnel[]>;
  getPersonnelByUserId(userId: string): Promise<Personnel[]>;
  getPersonnelById(id: string): Promise<Personnel | undefined>;
  createPersonnel(personnel: InsertPersonnel): Promise<Personnel>;
  updatePersonnel(id: string, personnel: Partial<InsertPersonnel>): Promise<Personnel | undefined>;
  deletePersonnel(id: string): Promise<boolean>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Timesheets
  getTimesheets(): Promise<Timesheet[]>;
  getTimesheetsByPersonnel(personnelId: string): Promise<Timesheet[]>;
  createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: string, timesheet: Partial<InsertTimesheet>): Promise<Timesheet | undefined>;
  deleteTimesheet(id: string): Promise<boolean>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // Notes
  getNotes(): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: string): Promise<boolean>;

  // Contractors
  getContractors(): Promise<Contractor[]>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  updateContractor(id: string, contractor: Partial<InsertContractor>): Promise<Contractor | undefined>;
  deleteContractor(id: string): Promise<boolean>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomersByUserId(userId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  // Customer Tasks
  getCustomerTasks(): Promise<CustomerTask[]>;
  getCustomerTasksByUserId(userId: string): Promise<CustomerTask[]>;
  getCustomerTasksByCustomerId(customerId: string): Promise<CustomerTask[]>;
  createCustomerTask(task: InsertCustomerTask): Promise<CustomerTask>;
  updateCustomerTask(id: string, task: Partial<InsertCustomerTask>): Promise<CustomerTask | undefined>;
  deleteCustomerTask(id: string): Promise<boolean>;

  // Customer Quotes
  getCustomerQuotes(): Promise<CustomerQuote[]>;
  getCustomerQuotesByUserId(userId: string): Promise<CustomerQuote[]>;
  getCustomerQuotesByCustomerId(customerId: string): Promise<CustomerQuote[]>;
  createCustomerQuote(quote: InsertCustomerQuote): Promise<CustomerQuote>;
  updateCustomerQuote(id: string, quote: Partial<InsertCustomerQuote>): Promise<CustomerQuote | undefined>;
  deleteCustomerQuote(id: string): Promise<boolean>;
  
  // Customer Quote Items
  getCustomerQuoteItems(): Promise<CustomerQuoteItem[]>;
  getCustomerQuoteItemsByQuoteId(quoteId: string): Promise<CustomerQuoteItem[]>;
  createCustomerQuoteItem(item: InsertCustomerQuoteItem): Promise<CustomerQuoteItem>;
  updateCustomerQuoteItem(id: string, item: Partial<InsertCustomerQuoteItem>): Promise<CustomerQuoteItem | undefined>;
  deleteCustomerQuoteItem(id: string): Promise<boolean>;

  // Customer Payments
  getCustomerPayments(): Promise<CustomerPayment[]>;
  getCustomerPaymentsByUserId(userId: string): Promise<CustomerPayment[]>;
  getCustomerPayment(id: string): Promise<CustomerPayment | undefined>;
  getCustomerPaymentsByCustomerId(customerId: string): Promise<CustomerPayment[]>;
  createCustomerPayment(payment: InsertCustomerPayment): Promise<CustomerPayment>;
  deleteCustomerPayment(id: string): Promise<boolean>;

  // Personnel Payments
  getPersonnelPayments(): Promise<PersonnelPayment[]>;
  getPersonnelPayment(id: string): Promise<PersonnelPayment | undefined>;
  getPersonnelPaymentsByPersonnelId(personnelId: string): Promise<PersonnelPayment[]>;
  createPersonnelPayment(payment: InsertPersonnelPayment): Promise<PersonnelPayment>;
  updatePersonnelPayment(id: string, payment: Partial<InsertPersonnelPayment>): Promise<PersonnelPayment | undefined>;
  deletePersonnelPayment(id: string): Promise<boolean>;

  // Contractor Tasks
  getContractorTasks(): Promise<ContractorTask[]>;
  getContractorTasksByContractorId(contractorId: string): Promise<ContractorTask[]>;
  createContractorTask(task: InsertContractorTask): Promise<ContractorTask>;
  updateContractorTask(id: string, task: Partial<InsertContractorTask>): Promise<ContractorTask | undefined>;
  deleteContractorTask(id: string): Promise<boolean>;

  // Contractor Payments
  getContractorPayments(): Promise<ContractorPayment[]>;
  getContractorPayment(id: string): Promise<ContractorPayment | undefined>;
  getContractorPaymentsByContractorId(contractorId: string): Promise<ContractorPayment[]>;
  createContractorPayment(payment: InsertContractorPayment): Promise<ContractorPayment>;
  updateContractorPayment(id: string, payment: Partial<InsertContractorPayment>): Promise<ContractorPayment | undefined>;
  deleteContractorPayment(id: string): Promise<boolean>;

  // Project lookup for contractors (since we use projects table)
  getProject(id: string): Promise<Project | undefined>;

  // Company Directory
  getCompanyDirectory(): Promise<CompanyDirectory[]>;
  getCompanyDirectoryByUserId(userId: string): Promise<CompanyDirectory[]>;
  getCompany(id: string): Promise<CompanyDirectory | undefined>;
  createCompany(company: InsertCompanyDirectory, userId: string): Promise<CompanyDirectory>;
  updateCompany(id: string, company: Partial<InsertCompanyDirectory>): Promise<CompanyDirectory | undefined>;
  deleteCompany(id: string): Promise<boolean>;

  // Messages
  getMessages(): Promise<Message[]>;
  getMessagesByUser(userId: string): Promise<Message[]>;
  getMessagesByConversation(company1Id: string, company2Id: string): Promise<Message[]>;
  getMessagesByConversationAndUser(company1Id: string, company2Id: string, userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;

  // Firm Invites
  createFirmInvite(invite: InsertFirmInvite & { tokenHash: string }): Promise<FirmInvite>;
  getFirmInvitesByToken(tokenHash: string): Promise<FirmInvite | undefined>;
  getFirmInvitesByFirm(firmId: string): Promise<FirmInvite[]>;
  acceptFirmInvite(id: string): Promise<boolean>;

  // Presence
  updatePresence(presenceLog: InsertPresenceLog): Promise<PresenceLog>;
  getPresenceByFirmAndUser(firmId: string, userId: string): Promise<PresenceLog | undefined>;
  getPresenceByFirm(firmId: string): Promise<PresenceLog[]>;
  
  // Message Drafts
  getDraft(threadId: string, authorFirmId: string): Promise<MessageDraft | undefined>;
  upsertDraft(draft: InsertMessageDraft): Promise<MessageDraft>;
  deleteDraft(threadId: string, authorFirmId: string): Promise<boolean>;

  // Auto Responders
  getAutoResponder(firmId: string): Promise<AutoResponder | undefined>;
  upsertAutoResponder(responder: InsertAutoResponder): Promise<AutoResponder>;
  getAutoReplyLog(responderFirmId: string, targetFirmId: string): Promise<Date | undefined>;
  setAutoReplyLog(responderFirmId: string, targetFirmId: string, messageId: string): Promise<void>;

  // Direct Threads & Messages
  getOrCreateDirectThread(firm1Id: string, firm2Id: string): Promise<DirectThread>;
  getDirectThreads(firmId: string): Promise<DirectThread[]>;
  getDirectThreadsByUserId(userId: string): Promise<DirectThread[]>;
  getDirectThreadById(threadId: string): Promise<DirectThread | undefined>;
  getDirectThreadMessages(threadId: string, offset?: number, limit?: number): Promise<DirectMessage[]>;
  createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  markDirectMessageAsRead(messageId: string): Promise<boolean>;
  
  // Image Uploads
  createImageUpload(upload: InsertImageUpload): Promise<ImageUpload>;

  // SMS Management
  getSMSHistory(userId: string): Promise<SMSHistory[]>;
  createSMSHistory(userId: string, sms: InsertSMSHistory): Promise<SMSHistory>;
  updateSMSHistory(id: string, updates: Partial<SMSHistory>): Promise<SMSHistory | undefined>;
  getSMSTemplates(userId: string): Promise<SMSTemplate[]>;
  createSMSTemplate(userId: string, template: InsertSMSTemplate): Promise<SMSTemplate>;

  // Payment notification operations
  createPaymentNotification(userId: string, notificationData: InsertPaymentNotification): Promise<PaymentNotification>;
  getPaymentNotifications(): Promise<PaymentNotification[]>;
  getPaymentNotificationsByStatus(status: string): Promise<PaymentNotification[]>;
  updatePaymentNotificationStatus(id: string, status: string, processedBy?: string, adminNote?: string): Promise<PaymentNotification | undefined>;

  // Payment Notifications
  createPaymentNotification(userId: string, notification: InsertPaymentNotification): Promise<PaymentNotification>;
  getPaymentNotifications(): Promise<PaymentNotification[]>;
  getPaymentNotificationsByStatus(status: string): Promise<PaymentNotification[]>;
  getPaymentNotificationsByUser(userId: string): Promise<PaymentNotification[]>;
  updatePaymentNotificationStatus(id: string, status: string, adminNote?: string, processedBy?: string): Promise<PaymentNotification | undefined>;

  // Admin Panel Operations
  getAllUsersForAdmin(): Promise<User[]>;
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, updates: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;
  getUserSessions(): Promise<UserSession[]>;
  getUserSessionsByUserId(userId: string): Promise<UserSession[]>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  deactivateUserSession(id: string): Promise<boolean>;
  getSystemMetrics(metricType?: string, limit?: number): Promise<SystemMetric[]>;
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalMessages: number;
    totalStorage: number;
    registrationsThisMonth: number;
    messagesThisMonth: number;
  }>;

  // Session management
  getActiveSessions(): Promise<{
    id: string;
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    lastActivity: string;
    createdAt: string;
    isActive: boolean;
    location?: string;
  }[]>;
  terminateSession(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private personnel: Map<string, Personnel> = new Map();
  private projects: Map<string, Project> = new Map();
  private timesheets: Map<string, Timesheet> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private notes: Map<string, Note> = new Map();
  private contractors: Map<string, Contractor> = new Map();
  private customers: Map<string, Customer> = new Map();
  private customerTasks: Map<string, CustomerTask> = new Map();
  private customerQuotes: Map<string, CustomerQuote> = new Map();
  private customerQuoteItems: Map<string, CustomerQuoteItem> = new Map();
  private customerPayments: Map<string, CustomerPayment> = new Map();
  private contractorTasks: Map<string, ContractorTask> = new Map();
  private contractorPayments: Map<string, ContractorPayment> = new Map();
  private personnelPayments: Map<string, PersonnelPayment> = new Map();

  constructor() {
    // Initialize with empty data
  }

  // Personnel methods
  async getPersonnel(): Promise<Personnel[]> {
    return Array.from(this.personnel.values());
  }

  async getPersonnelById(id: string): Promise<Personnel | undefined> {
    return this.personnel.get(id);
  }

  async createPersonnel(insertPersonnel: InsertPersonnel): Promise<Personnel> {
    const id = randomUUID();
    const personnel: Personnel = {
      ...insertPersonnel,
      id,
      createdAt: new Date(),
      phone: insertPersonnel.phone || null,
      email: insertPersonnel.email || null,
      salary: insertPersonnel.salary || null,
      salaryType: insertPersonnel.salaryType ?? null,
      isActive: insertPersonnel.isActive ?? true,
    };
    this.personnel.set(id, personnel);
    return personnel;
  }

  async updatePersonnel(id: string, updates: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    const personnel = this.personnel.get(id);
    if (!personnel) return undefined;

    const updated = { ...personnel, ...updates };
    this.personnel.set(id, updated);
    return updated;
  }

  async deletePersonnel(id: string): Promise<boolean> {
    return this.personnel.delete(id);
  }

  // Projects methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
      description: insertProject.description || null,
      clientName: insertProject.clientName || null,
      endDate: insertProject.endDate || null,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updated = { ...project, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Timesheets methods
  async getTimesheets(): Promise<Timesheet[]> {
    return Array.from(this.timesheets.values());
  }

  async getTimesheetsByPersonnel(personnelId: string): Promise<Timesheet[]> {
    return Array.from(this.timesheets.values()).filter(ts => ts.personnelId === personnelId);
  }

  async createTimesheet(insertTimesheet: InsertTimesheet): Promise<Timesheet> {
    const id = randomUUID();
    const timesheet: Timesheet = {
      ...insertTimesheet,
      id,
      createdAt: new Date(),
      customerId: insertTimesheet.customerId || null,
      startTime: insertTimesheet.startTime || null,
      endTime: insertTimesheet.endTime || null,
      hourlyRate: insertTimesheet.hourlyRate || null,
      dailyWage: insertTimesheet.dailyWage || null,
      notes: insertTimesheet.notes || null,
      overtimeHours: insertTimesheet.overtimeHours || "0.00",
    };
    this.timesheets.set(id, timesheet);
    return timesheet;
  }

  async updateTimesheet(id: string, updates: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const timesheet = this.timesheets.get(id);
    if (!timesheet) return undefined;

    const updated = { ...timesheet, ...updates };
    this.timesheets.set(id, updated);
    return updated;
  }

  async deleteTimesheet(id: string): Promise<boolean> {
    return this.timesheets.delete(id);
  }

  // Transactions methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
      category: insertTransaction.category || null,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updated = { ...transaction, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Notes methods
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Contractors methods
  async getContractors(): Promise<Contractor[]> {
    return Array.from(this.contractors.values());
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const id = randomUUID();
    const contractor: Contractor = {
      ...insertContractor,
      id,
      createdAt: new Date(),
      company: insertContractor.company || null,
      phone: insertContractor.phone || null,
      email: insertContractor.email || null,
    };
    this.contractors.set(id, contractor);
    return contractor;
  }

  async updateContractor(id: string, updates: Partial<InsertContractor>): Promise<Contractor | undefined> {
    const contractor = this.contractors.get(id);
    if (!contractor) return undefined;

    const updated = { ...contractor, ...updates };
    this.contractors.set(id, updated);
    return updated;
  }

  async deleteContractor(id: string): Promise<boolean> {
    return this.contractors.delete(id);
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
      company: insertCustomer.company || null,
      phone: insertCustomer.phone || null,
      email: insertCustomer.email || null,
      address: insertCustomer.address || null,
      taxNumber: insertCustomer.taxNumber || null,
      status: insertCustomer.status || "active",
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updated = { ...customer, ...updates };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Customer Tasks methods
  async getCustomerTasks(): Promise<CustomerTask[]> {
    return Array.from(this.customerTasks.values());
  }

  async getCustomerTasksByCustomerId(customerId: string): Promise<CustomerTask[]> {
    return Array.from(this.customerTasks.values()).filter(task => task.customerId === customerId);
  }

  async createCustomerTask(insertTask: InsertCustomerTask): Promise<CustomerTask> {
    const id = randomUUID();
    
    // Calculate VAT amounts if VAT is enabled
    let vatAmount = "0";
    let totalWithVAT = insertTask.amount;
    
    if (insertTask.hasVAT && insertTask.vatRate) {
      const amount = parseFloat(insertTask.amount.toString());
      const rate = parseFloat(insertTask.vatRate.toString());
      vatAmount = (amount * rate / 100).toFixed(2);
      totalWithVAT = (amount + parseFloat(vatAmount)).toFixed(2);
    }
    
    const task: CustomerTask = {
      ...insertTask,
      id,
      createdAt: new Date(),
      description: insertTask.description || null,
      dueDate: insertTask.dueDate || null,
      status: insertTask.status || "pending",
      hasVAT: insertTask.hasVAT || false,
      vatRate: insertTask.vatRate || "20.00",
      vatAmount,
      totalWithVAT,
    };
    this.customerTasks.set(id, task);
    return task;
  }

  async updateCustomerTask(id: string, updates: Partial<InsertCustomerTask>): Promise<CustomerTask | undefined> {
    const task = this.customerTasks.get(id);
    if (!task) return undefined;

    // Recalculate VAT if amount, hasVAT, or vatRate changed
    let vatAmount = task.vatAmount;
    let totalWithVAT = task.totalWithVAT;
    
    const finalAmount = updates.amount !== undefined ? updates.amount : task.amount;
    const finalHasVAT = updates.hasVAT !== undefined ? updates.hasVAT : task.hasVAT;
    const finalVatRate = updates.vatRate !== undefined ? updates.vatRate : task.vatRate;
    
    if (finalHasVAT && finalVatRate) {
      const amount = parseFloat(finalAmount.toString());
      const rate = parseFloat(finalVatRate.toString());
      vatAmount = (amount * rate / 100).toFixed(2);
      totalWithVAT = (amount + parseFloat(vatAmount)).toFixed(2);
    } else {
      vatAmount = "0";
      totalWithVAT = finalAmount;
    }

    const updated = { 
      ...task, 
      ...updates, 
      vatAmount, 
      totalWithVAT 
    };
    this.customerTasks.set(id, updated);
    return updated;
  }

  async deleteCustomerTask(id: string): Promise<boolean> {
    return this.customerTasks.delete(id);
  }

  // Customer Payments methods
  async getCustomerPayments(): Promise<CustomerPayment[]> {
    return Array.from(this.customerPayments.values());
  }

  async getCustomerPayment(id: string): Promise<CustomerPayment | undefined> {
    return this.customerPayments.get(id);
  }

  async getCustomerPaymentsByCustomerId(customerId: string): Promise<CustomerPayment[]> {
    return Array.from(this.customerPayments.values()).filter(payment => payment.customerId === customerId);
  }

  async createCustomerPayment(insertPayment: InsertCustomerPayment): Promise<CustomerPayment> {
    const id = randomUUID();
    const payment: CustomerPayment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
      paymentMethod: insertPayment.paymentMethod || null,
    };
    this.customerPayments.set(id, payment);
    return payment;
  }

  async deleteCustomerPayment(id: string): Promise<boolean> {
    return this.customerPayments.delete(id);
  }

  // Personnel Payments methods
  async getPersonnelPayments(): Promise<PersonnelPayment[]> {
    return Array.from(this.personnelPayments.values());
  }

  async getPersonnelPayment(id: string): Promise<PersonnelPayment | undefined> {
    return this.personnelPayments.get(id);
  }

  async getPersonnelPaymentsByPersonnelId(personnelId: string): Promise<PersonnelPayment[]> {
    return Array.from(this.personnelPayments.values()).filter(payment => payment.personnelId === personnelId);
  }

  async createPersonnelPayment(insertPayment: InsertPersonnelPayment): Promise<PersonnelPayment> {
    const id = randomUUID();
    const payment: PersonnelPayment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
      description: insertPayment.description || null,
      notes: insertPayment.notes || null,
    };
    this.personnelPayments.set(id, payment);
    return payment;
  }

  async updatePersonnelPayment(id: string, updates: Partial<InsertPersonnelPayment>): Promise<PersonnelPayment | undefined> {
    const payment = this.personnelPayments.get(id);
    if (!payment) return undefined;

    const updated = { ...payment, ...updates };
    this.personnelPayments.set(id, updated);
    return updated;
  }

  async deletePersonnelPayment(id: string): Promise<boolean> {
    return this.personnelPayments.delete(id);
  }

  // Contractor Tasks methods
  async getContractorTasks(): Promise<ContractorTask[]> {
    return Array.from(this.contractorTasks.values());
  }

  async getContractorTasksByContractorId(contractorId: string): Promise<ContractorTask[]> {
    return Array.from(this.contractorTasks.values()).filter(task => task.contractorId === contractorId);
  }

  async createContractorTask(insertTask: InsertContractorTask): Promise<ContractorTask> {
    const id = randomUUID();
    const task: ContractorTask = {
      ...insertTask,
      id,
      createdAt: new Date(),
      status: insertTask.status || "pending",
      description: insertTask.description || null,
      dueDate: insertTask.dueDate || null,
    };
    this.contractorTasks.set(id, task);
    return task;
  }

  async updateContractorTask(id: string, updates: Partial<InsertContractorTask>): Promise<ContractorTask | undefined> {
    const task = this.contractorTasks.get(id);
    if (!task) return undefined;

    const updated = { ...task, ...updates };
    this.contractorTasks.set(id, updated);
    return updated;
  }

  async deleteContractorTask(id: string): Promise<boolean> {
    return this.contractorTasks.delete(id);
  }

  // Contractor Payments methods
  async getContractorPayments(): Promise<ContractorPayment[]> {
    return Array.from(this.contractorPayments.values());
  }

  async getContractorPayment(id: string): Promise<ContractorPayment | undefined> {
    return this.contractorPayments.get(id);
  }

  async getContractorPaymentsByContractorId(contractorId: string): Promise<ContractorPayment[]> {
    return Array.from(this.contractorPayments.values()).filter(payment => payment.contractorId === contractorId);
  }

  async createContractorPayment(insertPayment: InsertContractorPayment): Promise<ContractorPayment> {
    const id = randomUUID();
    const payment: ContractorPayment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
      paymentMethod: insertPayment.paymentMethod || null,
      transactionId: insertPayment.transactionId || null,
    };
    this.contractorPayments.set(id, payment);
    return payment;
  }

  async updateContractorPayment(id: string, updates: Partial<InsertContractorPayment>): Promise<ContractorPayment | undefined> {
    const payment = this.contractorPayments.get(id);
    if (!payment) return undefined;

    const updated = { ...payment, ...updates };
    this.contractorPayments.set(id, updated);
    return updated;
  }

  async deleteContractorPayment(id: string): Promise<boolean> {
    return this.contractorPayments.delete(id);
  }

  // Project lookup method for contractors
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  // Customer Quotes methods
  async getCustomerQuotes(): Promise<CustomerQuote[]> {
    return Array.from(this.customerQuotes.values());
  }

  async getCustomerQuotesByCustomerId(customerId: string): Promise<CustomerQuote[]> {
    return Array.from(this.customerQuotes.values()).filter(quote => quote.customerId === customerId);
  }

  async createCustomerQuote(insertQuote: InsertCustomerQuote): Promise<CustomerQuote> {
    const id = randomUUID();
    const quote: CustomerQuote = {
      ...insertQuote,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: insertQuote.description || null,
      isApproved: insertQuote.isApproved || false,
      validUntil: insertQuote.validUntil || null,
      status: insertQuote.status || "pending",
    };
    this.customerQuotes.set(id, quote);
    return quote;
  }

  async updateCustomerQuote(id: string, updates: Partial<InsertCustomerQuote>): Promise<CustomerQuote | undefined> {
    const quote = this.customerQuotes.get(id);
    if (!quote) return undefined;

    const updated = { ...quote, ...updates, updatedAt: new Date() };
    this.customerQuotes.set(id, updated);
    return updated;
  }

  async deleteCustomerQuote(id: string): Promise<boolean> {
    return this.customerQuotes.delete(id);
  }

  // Customer Quote Items methods
  async getCustomerQuoteItems(): Promise<CustomerQuoteItem[]> {
    return Array.from(this.customerQuoteItems.values());
  }

  async getCustomerQuoteItemsByQuoteId(quoteId: string): Promise<CustomerQuoteItem[]> {
    return Array.from(this.customerQuoteItems.values()).filter(item => item.quoteId === quoteId);
  }

  async createCustomerQuoteItem(insertItem: InsertCustomerQuoteItem): Promise<CustomerQuoteItem> {
    const id = randomUUID();
    const item: CustomerQuoteItem = {
      ...insertItem,
      id,
      createdAt: new Date(),
      description: insertItem.description || null,
      status: insertItem.status || "pending",
      isApproved: insertItem.isApproved || false,
    };
    this.customerQuoteItems.set(id, item);
    return item;
  }

  async updateCustomerQuoteItem(id: string, updates: Partial<InsertCustomerQuoteItem>): Promise<CustomerQuoteItem | undefined> {
    const item = this.customerQuoteItems.get(id);
    if (!item) return undefined;

    const updated = { ...item, ...updates };
    this.customerQuoteItems.set(id, updated);
    
    // If item is approved, create corresponding customer task
    if (updated.isApproved && updated.status === 'approved' && !item.isApproved) {
      await this.createTaskFromQuoteItem(updated);
    }
    
    return updated;
  }

  // Helper method to create task from approved quote item
  private async createTaskFromQuoteItem(quoteItem: CustomerQuoteItem): Promise<void> {
    // Get the quote to find customer ID
    const quote = this.customerQuotes.get(quoteItem.quoteId);
    if (!quote) return;

    // Check if task already exists for this quote item
    const existingTask = Array.from(this.customerTasks.values())
      .find(task => task.title === quoteItem.title && task.customerId === quote.customerId);
    
    if (existingTask) return; // Task already exists

    // Create new task from quote item
    const taskData: InsertCustomerTask = {
      customerId: quote.customerId,
      title: quoteItem.title,
      description: quoteItem.description || `${quote.title} - ${quoteItem.title}`,
      amount: quoteItem.totalPrice.toString(),
      status: "pending",
      dueDate: quote.validUntil || null,
      hasVAT: false,
      vatRate: "20.00",
    };

    await this.createCustomerTask(taskData);
  }

  async deleteCustomerQuoteItem(id: string): Promise<boolean> {
    return this.customerQuoteItems.delete(id);
  }

  // Session management (mock implementation)
  async getActiveSessions(): Promise<{
    id: string;
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    lastActivity: string;
    createdAt: string;
    isActive: boolean;
    location?: string;
  }[]> {
    // Mock sessions data for development
    const mockSessions = [
      {
        id: randomUUID(),
        userId: "eynffxrvr1e",
        userEmail: "modacizimtasarim@gmail.com",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        lastActivity: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        isActive: true,
        location: "İstanbul, Türkiye"
      },
      {
        id: randomUUID(),
        userId: "user2",
        userEmail: "test@example.com",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        lastActivity: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        isActive: false,
        location: "Ankara, Türkiye"
      }
    ];
    return mockSessions;
  }

  async terminateSession(sessionId: string): Promise<boolean> {
    // Mock session termination - always returns success
    return true;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | undefined> {
    const [result] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result;
  }

  // Personnel methods
  async getPersonnel(): Promise<Personnel[]> {
    return await db.select().from(personnel);
  }

  async getPersonnelByUserId(userId: string): Promise<Personnel[]> {
    return await db.select().from(personnel).where(eq(personnel.userId, userId));
  }

  async getPersonnelById(id: string): Promise<Personnel | undefined> {
    const [result] = await db.select().from(personnel).where(eq(personnel.id, id));
    return result;
  }

  async createPersonnel(insertPersonnel: InsertPersonnel): Promise<Personnel> {
    const [result] = await db.insert(personnel).values(insertPersonnel).returning();
    return result;
  }

  async updatePersonnel(id: string, updates: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    const [result] = await db.update(personnel).set(updates).where(eq(personnel.id, id)).returning();
    return result;
  }

  async deletePersonnel(id: string): Promise<boolean> {
    const result = await db.delete(personnel).where(eq(personnel.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Projects methods
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const [result] = await db.select().from(projects).where(eq(projects.id, id));
    return result;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [result] = await db.select().from(projects).where(eq(projects.id, id));
    return result;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [result] = await db.insert(projects).values(insertProject).returning();
    return result;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [result] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return result;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Timesheets methods
  async getTimesheets(): Promise<Timesheet[]> {
    return await db.select().from(timesheets);
  }

  async getTimesheetsByUserId(userId: string): Promise<Timesheet[]> {
    return await db.select().from(timesheets).where(eq(timesheets.userId, userId));
  }

  async getTimesheetsByPersonnel(personnelId: string): Promise<Timesheet[]> {
    return await db.select().from(timesheets).where(eq(timesheets.personnelId, personnelId));
  }

  async createTimesheet(insertTimesheet: InsertTimesheet): Promise<Timesheet> {
    const [result] = await db.insert(timesheets).values(insertTimesheet).returning();
    return result;
  }

  async updateTimesheet(id: string, updates: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const [result] = await db.update(timesheets).set(updates).where(eq(timesheets.id, id)).returning();
    return result;
  }

  async deleteTimesheet(id: string): Promise<boolean> {
    const result = await db.delete(timesheets).where(eq(timesheets.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Transactions methods
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [result] = await db.insert(transactions).values(insertTransaction).returning();
    return result;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [result] = await db.update(transactions).set(updates).where(eq(transactions.id, id)).returning();
    return result;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Notes methods
  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [result] = await db.insert(notes).values(insertNote).returning();
    return result;
  }

  async deleteNote(id: string): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Contractors methods
  async getContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors);
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const [result] = await db.insert(contractors).values(insertContractor).returning();
    return result;
  }

  async updateContractor(id: string, updates: Partial<InsertContractor>): Promise<Contractor | undefined> {
    const [result] = await db.update(contractors).set(updates).where(eq(contractors.id, id)).returning();
    return result;
  }

  async deleteContractor(id: string): Promise<boolean> {
    const result = await db.delete(contractors).where(eq(contractors.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Customers methods
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomersByUserId(userId: string): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.userId, userId));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [result] = await db.select().from(customers).where(eq(customers.id, id));
    return result;
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [result] = await db.select().from(customers).where(eq(customers.id, id));
    return result;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [result] = await db.insert(customers).values(insertCustomer).returning();
    return result;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [result] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return result;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Customer Tasks methods
  async getCustomerTasks(): Promise<CustomerTask[]> {
    return await db.select().from(customerTasks);
  }

  async getCustomerTasksByUserId(userId: string): Promise<CustomerTask[]> {
    // Simple approach: Get user's customers first, then filter tasks
    const userCustomers = await db.select().from(customers).where(eq(customers.userId, userId));
    const customerIds = userCustomers.map(c => c.id);
    
    if (customerIds.length === 0) {
      return [];
    }
    
    // Get tasks for user's customers
    const tasks = await db.select().from(customerTasks);
    return tasks.filter(task => customerIds.includes(task.customerId));
  }

  async getCustomerTasksByCustomerId(customerId: string): Promise<CustomerTask[]> {
    return await db.select().from(customerTasks).where(eq(customerTasks.customerId, customerId));
  }

  async createCustomerTask(insertTask: InsertCustomerTask): Promise<CustomerTask> {
    const [result] = await db.insert(customerTasks).values(insertTask).returning();
    return result;
  }

  async updateCustomerTask(id: string, updates: Partial<InsertCustomerTask>): Promise<CustomerTask | undefined> {
    const [result] = await db.update(customerTasks).set(updates).where(eq(customerTasks.id, id)).returning();
    return result;
  }

  async deleteCustomerTask(id: string): Promise<boolean> {
    const result = await db.delete(customerTasks).where(eq(customerTasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Customer Quotes methods
  async getCustomerQuotes(): Promise<CustomerQuote[]> {
    return await db.select().from(customerQuotes);
  }

  async getCustomerQuotesByUserId(userId: string): Promise<CustomerQuote[]> {
    // Simple approach: Get user's customers first, then filter quotes
    const userCustomers = await db.select().from(customers).where(eq(customers.userId, userId));
    const customerIds = userCustomers.map(c => c.id);
    
    if (customerIds.length === 0) {
      return [];
    }
    
    // Get quotes for user's customers
    const quotes = await db.select().from(customerQuotes);
    return quotes.filter(quote => customerIds.includes(quote.customerId));
  }

  async getCustomerQuotesByCustomerId(customerId: string): Promise<CustomerQuote[]> {
    return await db.select().from(customerQuotes).where(eq(customerQuotes.customerId, customerId));
  }

  async createCustomerQuote(insertQuote: InsertCustomerQuote): Promise<CustomerQuote> {
    console.log("Storage: Creating quote with data:", insertQuote);
    const [result] = await db.insert(customerQuotes).values(insertQuote).returning();
    console.log("Storage: Quote creation result:", result);
    return result;
  }

  async updateCustomerQuote(id: string, updates: Partial<InsertCustomerQuote>): Promise<CustomerQuote | undefined> {
    const [result] = await db.update(customerQuotes).set(updates).where(eq(customerQuotes.id, id)).returning();
    
    // If quote is approved, create a task automatically
    if (updates.isApproved && result) {
      // Use totalWithVAT if available (for VAT-inclusive quotes), otherwise use totalAmount
      const finalAmount = result.hasVAT ? (result.totalWithVAT || result.totalAmount) : result.totalAmount;
      
      await db.insert(customerTasks).values({
        customerId: result.customerId,
        title: `${result.title} (Onaylanan Teklif)`,
        description: result.description || undefined,
        amount: finalAmount,
        status: "pending",
      });
    }
    
    return result;
  }

  async deleteCustomerQuote(id: string): Promise<boolean> {
    const result = await db.delete(customerQuotes).where(eq(customerQuotes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Customer Quote Items methods
  async getCustomerQuoteItems(): Promise<CustomerQuoteItem[]> {
    return await db.select().from(customerQuoteItems);
  }

  async getCustomerQuoteItemsByQuoteId(quoteId: string): Promise<CustomerQuoteItem[]> {
    return await db.select().from(customerQuoteItems).where(eq(customerQuoteItems.quoteId, quoteId));
  }

  async createCustomerQuoteItem(insertItem: InsertCustomerQuoteItem): Promise<CustomerQuoteItem> {
    const [result] = await db.insert(customerQuoteItems).values(insertItem).returning();
    return result;
  }

  async updateCustomerQuoteItem(id: string, updates: Partial<InsertCustomerQuoteItem>): Promise<CustomerQuoteItem | undefined> {
    const [result] = await db.update(customerQuoteItems).set(updates).where(eq(customerQuoteItems.id, id)).returning();
    return result;
  }

  async deleteCustomerQuoteItem(id: string): Promise<boolean> {
    const result = await db.delete(customerQuoteItems).where(eq(customerQuoteItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Customer Payments methods
  async getCustomerPayments(): Promise<CustomerPayment[]> {
    return await db.select().from(customerPayments);
  }

  async getCustomerPaymentsByUserId(userId: string): Promise<CustomerPayment[]> {
    // Simple approach: Get user's customers first, then filter payments
    const userCustomers = await db.select().from(customers).where(eq(customers.userId, userId));
    const customerIds = userCustomers.map(c => c.id);
    
    if (customerIds.length === 0) {
      return [];
    }
    
    // Get payments for user's customers
    const payments = await db.select().from(customerPayments);
    return payments.filter(payment => customerIds.includes(payment.customerId));
  }

  async getCustomerPayment(id: string): Promise<CustomerPayment | undefined> {
    const [result] = await db.select().from(customerPayments).where(eq(customerPayments.id, id));
    return result;
  }

  async getCustomerPaymentsByCustomerId(customerId: string): Promise<CustomerPayment[]> {
    return await db.select().from(customerPayments).where(eq(customerPayments.customerId, customerId));
  }

  async createCustomerPayment(insertPayment: InsertCustomerPayment): Promise<CustomerPayment> {
    const [result] = await db.insert(customerPayments).values(insertPayment).returning();
    return result;
  }

  async deleteCustomerPayment(id: string): Promise<boolean> {
    const result = await db.delete(customerPayments).where(eq(customerPayments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Personnel Payments methods
  async getPersonnelPayments(): Promise<PersonnelPayment[]> {
    return await db.select().from(personnelPayments);
  }

  async getPersonnelPaymentsByUserId(userId: string): Promise<PersonnelPayment[]> {
    // Get personnel belonging to this user first
    const userPersonnel = await db.select().from(personnel).where(eq(personnel.userId, userId));
    const personnelIds = userPersonnel.map(p => p.id);
    
    if (personnelIds.length === 0) return [];
    
    return await db.select().from(personnelPayments)
      .where(inArray(personnelPayments.personnelId, personnelIds));
  }

  async getPersonnelPayment(id: string): Promise<PersonnelPayment | undefined> {
    const [result] = await db.select().from(personnelPayments).where(eq(personnelPayments.id, id));
    return result;
  }

  async getPersonnelPaymentsByPersonnelId(personnelId: string): Promise<PersonnelPayment[]> {
    return await db.select().from(personnelPayments).where(eq(personnelPayments.personnelId, personnelId));
  }

  async getPersonnelPaymentsByPersonnelIdAndUserId(personnelId: string, userId: string): Promise<PersonnelPayment[]> {
    // First verify that the personnel belongs to this user
    const person = await db.select().from(personnel)
      .where(and(eq(personnel.id, personnelId), eq(personnel.userId, userId)));
    
    if (person.length === 0) return []; // Personnel doesn't belong to this user
    
    return await db.select().from(personnelPayments).where(eq(personnelPayments.personnelId, personnelId));
  }

  async createPersonnelPayment(insertPayment: InsertPersonnelPayment): Promise<PersonnelPayment> {
    const [result] = await db.insert(personnelPayments).values(insertPayment).returning();
    return result;
  }

  async updatePersonnelPayment(id: string, updates: Partial<InsertPersonnelPayment>): Promise<PersonnelPayment | undefined> {
    const [result] = await db.update(personnelPayments).set(updates).where(eq(personnelPayments.id, id)).returning();
    return result;
  }

  async deletePersonnelPayment(id: string): Promise<boolean> {
    const result = await db.delete(personnelPayments).where(eq(personnelPayments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Contractor Tasks methods
  async getContractorTasks(): Promise<ContractorTask[]> {
    return await db.select().from(contractorTasks);
  }

  async getContractorTasksByContractorId(contractorId: string): Promise<ContractorTask[]> {
    return await db.select().from(contractorTasks).where(eq(contractorTasks.contractorId, contractorId));
  }

  async createContractorTask(insertTask: InsertContractorTask): Promise<ContractorTask> {
    const [result] = await db.insert(contractorTasks).values(insertTask).returning();
    return result;
  }

  async updateContractorTask(id: string, updates: Partial<InsertContractorTask>): Promise<ContractorTask | undefined> {
    const [result] = await db.update(contractorTasks).set(updates).where(eq(contractorTasks.id, id)).returning();
    return result;
  }

  async deleteContractorTask(id: string): Promise<boolean> {
    const result = await db.delete(contractorTasks).where(eq(contractorTasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Contractor Payments methods
  async getContractorPayments(): Promise<ContractorPayment[]> {
    return await db.select().from(contractorPayments);
  }

  async getContractorPayment(id: string): Promise<ContractorPayment | undefined> {
    const [result] = await db.select().from(contractorPayments).where(eq(contractorPayments.id, id));
    return result;
  }

  async getContractorPaymentsByContractorId(contractorId: string): Promise<ContractorPayment[]> {
    return await db.select().from(contractorPayments).where(eq(contractorPayments.contractorId, contractorId));
  }

  async getContractorPaymentsByUserId(userId: string): Promise<ContractorPayment[]> {
    // Get projects belonging to this user first
    const userProjects = await db.select().from(projects).where(eq(projects.userId, userId));
    const projectIds = userProjects.map(p => p.id);
    
    if (projectIds.length === 0) return [];
    
    return await db.select().from(contractorPayments)
      .where(inArray(contractorPayments.contractorId, projectIds));
  }

  async getContractorPaymentsByContractorIdAndUserId(contractorId: string, userId: string): Promise<ContractorPayment[]> {
    // First verify that the project belongs to this user
    const project = await db.select().from(projects)
      .where(and(eq(projects.id, contractorId), eq(projects.userId, userId)));
    
    if (project.length === 0) return []; // Project doesn't belong to this user
    
    return await db.select().from(contractorPayments).where(eq(contractorPayments.contractorId, contractorId));
  }

  async createContractorPayment(insertPayment: InsertContractorPayment): Promise<ContractorPayment> {
    const [result] = await db.insert(contractorPayments).values(insertPayment).returning();
    return result;
  }

  async updateContractorPayment(id: string, updates: Partial<InsertContractorPayment>): Promise<ContractorPayment | undefined> {
    const [result] = await db.update(contractorPayments).set(updates).where(eq(contractorPayments.id, id)).returning();
    return result;
  }

  async deleteContractorPayment(id: string): Promise<boolean> {
    const result = await db.delete(contractorPayments).where(eq(contractorPayments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Company Directory methods
  async getCompanyDirectory(): Promise<CompanyDirectory[]> {
    return await db.select().from(companyDirectory).where(eq(companyDirectory.isActive, true));
  }

  async getProCompanyDirectory(filters?: { search?: string; city?: string; industry?: string; verified?: boolean }): Promise<CompanyDirectory[]> {
    let whereConditions = and(
      eq(companyDirectory.isActive, true),
      eq(companyDirectory.isProVisible, true)
    );

    if (filters) {
      const conditions = [
        eq(companyDirectory.isActive, true),
        eq(companyDirectory.isProVisible, true)
      ];

      if (filters.search) {
        // Search in company name, contact person, or description
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            sql`${companyDirectory.companyName} ILIKE ${searchTerm}`,
            sql`${companyDirectory.contactPerson} ILIKE ${searchTerm}`,
            sql`${companyDirectory.description} ILIKE ${searchTerm}`
          )
        );
      }

      if (filters.city) {
        conditions.push(eq(companyDirectory.city, filters.city));
      }

      if (filters.industry) {
        conditions.push(eq(companyDirectory.industry, filters.industry));
      }

      if (filters.verified !== undefined) {
        conditions.push(eq(companyDirectory.isVerified, filters.verified));
      }

      whereConditions = and(...conditions);
    }

    return await db.select().from(companyDirectory).where(whereConditions);
  }

  async getCompanyDirectoryByUserId(userId: string): Promise<CompanyDirectory[]> {
    return await db.select().from(companyDirectory).where(
      and(eq(companyDirectory.userId, userId), eq(companyDirectory.isActive, true))
    );
  }

  async getCompany(id: string): Promise<CompanyDirectory | undefined> {
    const [result] = await db.select().from(companyDirectory).where(eq(companyDirectory.id, id));
    return result;
  }

  async createCompany(insertCompany: InsertCompanyDirectory, userId: string): Promise<CompanyDirectory> {
    const companyData = {
      ...insertCompany,
      userId,
      isProVisible: true, // Yeni firmalar otomatik olarak PRO Firma Rehberi'nde görünür olsun
      isActive: true
    };
    const [result] = await db.insert(companyDirectory).values(companyData).returning();
    return result;
  }

  async updateCompany(id: string, updates: Partial<InsertCompanyDirectory>): Promise<CompanyDirectory | undefined> {
    const [result] = await db.update(companyDirectory).set(updates).where(eq(companyDirectory.id, id)).returning();
    return result;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.update(companyDirectory).set({ isActive: false }).where(eq(companyDirectory.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Messages methods
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(messages.createdAt);
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          eq(messages.fromUserId, userId),
          eq(messages.toUserId, userId)
        )
      )
      .orderBy(messages.createdAt);
  }

  async getMessagesByConversation(company1Id: string, company2Id: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          and(eq(messages.fromCompanyId, company1Id), eq(messages.toCompanyId, company2Id)),
          and(eq(messages.fromCompanyId, company2Id), eq(messages.toCompanyId, company1Id))
        )
      )
      .orderBy(messages.createdAt);
  }

  async getMessagesByConversationAndUser(company1Id: string, company2Id: string, userId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        and(
          or(
            and(eq(messages.fromCompanyId, company1Id), eq(messages.toCompanyId, company2Id)),
            and(eq(messages.fromCompanyId, company2Id), eq(messages.toCompanyId, company1Id))
          ),
          or(
            eq(messages.fromUserId, userId),
            eq(messages.toUserId, userId)
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(insertMessage).returning();
    return result;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const result = await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Conversations methods
  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(conversations.lastMessageAt);
  }

  async getConversation(company1Id: string, company2Id: string): Promise<Conversation | undefined> {
    const [result] = await db.select().from(conversations)
      .where(
        or(
          and(eq(conversations.company1Id, company1Id), eq(conversations.company2Id, company2Id)),
          and(eq(conversations.company1Id, company2Id), eq(conversations.company2Id, company1Id))
        )
      );
    return result;
  }

  async getConversationById(conversationId: string): Promise<Conversation | undefined> {
    const [result] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    return result;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    // Get conversation first to extract company IDs
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) return [];
    
    return await db.select().from(messages)
      .where(
        or(
          and(eq(messages.fromCompanyId, conversation.company1Id), eq(messages.toCompanyId, conversation.company2Id)),
          and(eq(messages.fromCompanyId, conversation.company2Id), eq(messages.toCompanyId, conversation.company1Id))
        )
      )
      .orderBy(messages.createdAt);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [result] = await db.insert(conversations).values(insertConversation).returning();
    return result;
  }

  // Enhanced messaging methods
  async getOrCreateConversation(company1Id: string, company2Id: string): Promise<Conversation> {
    // Ensure consistent ordering for conversation lookup
    const [firstId, secondId] = [company1Id, company2Id].sort();
    
    let [conversation] = await db.select().from(conversations)
      .where(and(eq(conversations.company1Id, firstId), eq(conversations.company2Id, secondId)));

    if (!conversation) {
      [conversation] = await db.insert(conversations)
        .values({ company1Id: firstId, company2Id: secondId })
        .returning();
    }

    return conversation;
  }

  async getConversationsByCompanyId(companyId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(or(eq(conversations.company1Id, companyId), eq(conversations.company2Id, companyId)));
  }

  async updateConversationLastMessage(conversationId: string, messageId: string): Promise<void> {
    await db.update(conversations)
      .set({ 
        lastMessageId: messageId, 
        lastMessageAt: new Date() 
      })
      .where(eq(conversations.id, conversationId));
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications).values(insertNotification).returning();
    return result;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    return (result.rowCount ?? 0) > 0;
  }

  // Blocking and muting methods
  async createCompanyBlock(blockerCompanyId: string, blockedCompanyId: string): Promise<CompanyBlock> {
    const [result] = await db.insert(companyBlocks)
      .values({ blockerCompanyId, blockedCompanyId })
      .returning();
    return result;
  }

  async removeCompanyBlock(blockerCompanyId: string, blockedCompanyId: string): Promise<boolean> {
    const result = await db.delete(companyBlocks)
      .where(and(
        eq(companyBlocks.blockerCompanyId, blockerCompanyId),
        eq(companyBlocks.blockedCompanyId, blockedCompanyId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async isCompanyBlocked(blockerCompanyId: string, blockedCompanyId: string): Promise<boolean> {
    const [result] = await db.select().from(companyBlocks)
      .where(and(
        eq(companyBlocks.blockerCompanyId, blockerCompanyId),
        eq(companyBlocks.blockedCompanyId, blockedCompanyId)
      ));
    return !!result;
  }

  async createCompanyMute(muterCompanyId: string, mutedCompanyId: string): Promise<CompanyMute> {
    const [result] = await db.insert(companyMutes)
      .values({ muterCompanyId, mutedCompanyId })
      .returning();
    return result;
  }

  async removeCompanyMute(muterCompanyId: string, mutedCompanyId: string): Promise<boolean> {
    const result = await db.delete(companyMutes)
      .where(and(
        eq(companyMutes.muterCompanyId, muterCompanyId),
        eq(companyMutes.mutedCompanyId, mutedCompanyId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async isCompanyMuted(muterCompanyId: string, mutedCompanyId: string): Promise<boolean> {
    const [result] = await db.select().from(companyMutes)
      .where(and(
        eq(companyMutes.muterCompanyId, muterCompanyId),
        eq(companyMutes.mutedCompanyId, mutedCompanyId)
      ));
    return !!result;
  }

  // Abuse reporting methods
  async createAbuseReport(insertReport: InsertAbuseReport): Promise<AbuseReport> {
    const [result] = await db.insert(abuseReports).values(insertReport).returning();
    return result;
  }

  async getAbuseReports(): Promise<AbuseReport[]> {
    return await db.select().from(abuseReports).orderBy(desc(abuseReports.createdAt));
  }

  async resolveAbuseReport(reportId: string, resolvedBy: string): Promise<boolean> {
    const result = await db.update(abuseReports)
      .set({ 
        isResolved: true, 
        resolvedAt: new Date(), 
        resolvedBy 
      })
      .where(eq(abuseReports.id, reportId));
    return (result.rowCount ?? 0) > 0;
  }

  // Company profile verification
  async verifyCompanyProfile(companyId: string): Promise<boolean> {
    const result = await db.update(companyDirectory)
      .set({ 
        isVerified: true, 
        verifiedAt: new Date() 
      })
      .where(eq(companyDirectory.id, companyId));
    return (result.rowCount ?? 0) > 0;
  }

  async updateCompanyProStatus(companyId: string, isProVisible: boolean): Promise<boolean> {
    const result = await db.update(companyDirectory)
      .set({ 
        isProVisible,
        subscriptionStatus: isProVisible ? "PRO" : "FREE"
      })
      .where(eq(companyDirectory.id, companyId));
    return (result.rowCount ?? 0) > 0;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [result] = await db.update(conversations).set(updates).where(eq(conversations.id, id)).returning();
    return result;
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  // Firm Invites
  async createFirmInvite(invite: InsertFirmInvite & { tokenHash: string }): Promise<FirmInvite> {
    const [result] = await db.insert(firmInvites).values(invite).returning();
    return result;
  }

  async getFirmInvitesByToken(tokenHash: string): Promise<FirmInvite | undefined> {
    const [result] = await db.select().from(firmInvites)
      .where(eq(firmInvites.tokenHash, tokenHash));
    return result;
  }

  async getFirmInvitesByFirm(firmId: string): Promise<FirmInvite[]> {
    return await db.select().from(firmInvites)
      .where(eq(firmInvites.firmId, firmId))
      .orderBy(desc(firmInvites.createdAt));
  }

  async acceptFirmInvite(id: string): Promise<boolean> {
    const result = await db.update(firmInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(firmInvites.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Presence
  async updatePresence(presenceLog: InsertPresenceLog): Promise<PresenceLog> {
    const [existing] = await db.select().from(presenceLogs)
      .where(and(
        eq(presenceLogs.firmId, presenceLog.firmId),
        eq(presenceLogs.userId, presenceLog.userId)
      ));

    if (existing) {
      const [result] = await db.update(presenceLogs)
        .set({ 
          lastHeartbeatAt: new Date(),
          clientInfo: presenceLog.clientInfo,
          updatedAt: new Date()
        })
        .where(eq(presenceLogs.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(presenceLogs).values(presenceLog).returning();
      return result;
    }
  }

  async getPresenceByFirmAndUser(firmId: string, userId: string): Promise<PresenceLog | undefined> {
    const [result] = await db.select().from(presenceLogs)
      .where(and(
        eq(presenceLogs.firmId, firmId),
        eq(presenceLogs.userId, userId)
      ));
    return result;
  }

  async getPresenceByFirm(firmId: string): Promise<PresenceLog[]> {
    return await db.select().from(presenceLogs)
      .where(eq(presenceLogs.firmId, firmId));
  }

  // Message Drafts
  async getDraft(threadId: string, authorFirmId: string): Promise<MessageDraft | undefined> {
    const [result] = await db.select().from(messageDrafts)
      .where(and(
        eq(messageDrafts.threadId, threadId),
        eq(messageDrafts.authorFirmId, authorFirmId)
      ));
    return result;
  }

  async upsertDraft(draft: InsertMessageDraft): Promise<MessageDraft> {
    const [existing] = await db.select().from(messageDrafts)
      .where(and(
        eq(messageDrafts.threadId, draft.threadId),
        eq(messageDrafts.authorFirmId, draft.authorFirmId)
      ));

    if (existing) {
      const [result] = await db.update(messageDrafts)
        .set({ body: draft.body, updatedAt: new Date() })
        .where(eq(messageDrafts.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(messageDrafts).values(draft).returning();
      return result;
    }
  }

  async deleteDraft(threadId: string, authorFirmId: string): Promise<boolean> {
    const result = await db.delete(messageDrafts)
      .where(and(
        eq(messageDrafts.threadId, threadId),
        eq(messageDrafts.authorFirmId, authorFirmId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  // Auto Responders
  async getAutoResponder(firmId: string): Promise<AutoResponder | undefined> {
    const [result] = await db.select().from(autoResponders)
      .where(eq(autoResponders.firmId, firmId));
    return result;
  }

  async upsertAutoResponder(responder: InsertAutoResponder): Promise<AutoResponder> {
    const [existing] = await db.select().from(autoResponders)
      .where(eq(autoResponders.firmId, responder.firmId));

    if (existing) {
      const [result] = await db.update(autoResponders)
        .set({ ...responder, updatedAt: new Date() })
        .where(eq(autoResponders.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(autoResponders).values(responder).returning();
      return result;
    }
  }

  async getAutoReplyLog(responderFirmId: string, targetFirmId: string): Promise<Date | undefined> {
    const [result] = await db.select().from(autoReplyLogs)
      .where(and(
        eq(autoReplyLogs.responderFirmId, responderFirmId),
        eq(autoReplyLogs.targetFirmId, targetFirmId)
      ))
      .orderBy(desc(autoReplyLogs.lastReplyAt))
      .limit(1);
    return result?.lastReplyAt;
  }

  async setAutoReplyLog(responderFirmId: string, targetFirmId: string, messageId: string): Promise<void> {
    await db.insert(autoReplyLogs).values({
      responderFirmId,
      targetFirmId,
      messageId,
      lastReplyAt: new Date()
    }).onConflictDoUpdate({
      target: [autoReplyLogs.responderFirmId, autoReplyLogs.targetFirmId],
      set: {
        lastReplyAt: new Date(),
        messageId
      }
    });
  }

  // Direct Threads & Messages
  async getOrCreateDirectThread(firm1Id: string, firm2Id: string): Promise<DirectThread> {
    const [firstId, secondId] = [firm1Id, firm2Id].sort();
    
    let [thread] = await db.select().from(directThreads)
      .where(and(eq(directThreads.firm1Id, firstId), eq(directThreads.firm2Id, secondId)));

    if (!thread) {
      [thread] = await db.insert(directThreads)
        .values({ firm1Id: firstId, firm2Id: secondId })
        .returning();
    }

    return thread;
  }

  async getDirectThreads(firmId: string): Promise<DirectThread[]> {
    return await db.select().from(directThreads)
      .where(or(eq(directThreads.firm1Id, firmId), eq(directThreads.firm2Id, firmId)))
      .orderBy(desc(directThreads.lastMessageAt));
  }

  async getDirectThreadsByUserId(userId: string): Promise<any[]> {
    // Get user's company first
    const userCompanies = await this.getCompanyDirectoryByUserId(userId);
    if (userCompanies.length === 0) {
      return [];
    }
    
    const userCompanyId = userCompanies[0].id;
    const threads = await this.getDirectThreads(userCompanyId);
    
    // Enrich threads with participant information
    const enrichedThreads = await Promise.all(
      threads.map(async (thread) => {
        // Determine other company ID
        const otherCompanyId = thread.firm1Id === userCompanyId ? thread.firm2Id : thread.firm1Id;
        
        // Get other company details
        const otherCompany = await this.getCompany(otherCompanyId);
        
        // Get last message
        const messages = await this.getDirectThreadMessages(thread.id, 0, 1);
        const lastMessage = messages.length > 0 ? messages[0] : null;
        
        return {
          ...thread,
          participants: [{
            userId: "other", // We don't track individual user IDs in DirectThread
            companyId: otherCompanyId,
            company: otherCompany
          }],
          lastMessage,
          lastMessageAt: lastMessage?.createdAt || thread.lastMessageAt
        };
      })
    );
    
    return enrichedThreads;
  }

  async getDirectThreadById(threadId: string): Promise<DirectThread | undefined> {
    const [thread] = await db.select().from(directThreads).where(eq(directThreads.id, threadId));
    return thread;
  }

  async getDirectThreadMessages(threadId: string, offset = 0, limit = 50): Promise<DirectMessage[]> {
    return await db.select().from(directMessages)
      .where(eq(directMessages.threadId, threadId))
      .orderBy(desc(directMessages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage> {
    const [result] = await db.insert(directMessages).values(message).returning();
    
    // Update thread's last message timestamp
    await db.update(directThreads)
      .set({ lastMessageAt: new Date() })
      .where(eq(directThreads.id, message.threadId));

    return result;
  }

  async markDirectMessageAsRead(messageId: string): Promise<boolean> {
    const result = await db.update(directMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(directMessages.id, messageId));
    return (result.rowCount ?? 0) > 0;
  }

  // Image Uploads
  async createImageUpload(upload: InsertImageUpload): Promise<ImageUpload> {
    const [result] = await db.insert(imageUploads).values(upload).returning();
    return result;
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    demoUsers: number;
    todayRegistrations: number;
  }> {
    const allUsers = await db.select().from(users);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const totalUsers = allUsers.length;
    const demoUsers = allUsers.filter(user => user.email.includes('demo')).length;
    const todayRegistrations = allUsers.filter(user => 
      new Date(user.createdAt) >= todayStart
    ).length;
    
    // For now, assume all users are active (we don't track last login in current schema)
    const activeUsers = totalUsers;

    return {
      totalUsers,
      activeUsers,
      demoUsers,
      todayRegistrations
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    demoUsers: number;
    todayRegistrations: number;
  }> {
    const allUsers = await db.select().from(users);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const totalUsers = allUsers.length;
    const demoUsers = allUsers.filter(user => user.email.includes('demo')).length;
    const todayRegistrations = allUsers.filter(user => 
      new Date(user.createdAt) >= todayStart
    ).length;
    
    // For now, assume all users are active (we don't track last login in current schema)
    const activeUsers = totalUsers;

    return {
      totalUsers,
      activeUsers,
      demoUsers,
      todayRegistrations
    };
  }

  // SMS Management
  async getSMSHistory(userId: string): Promise<SMSHistory[]> {
    return await db.select().from(smsHistory)
      .where(eq(smsHistory.userId, userId))
      .orderBy(desc(smsHistory.createdAt));
  }

  async createSMSHistory(userId: string, sms: InsertSMSHistory): Promise<SMSHistory> {
    const [result] = await db.insert(smsHistory).values({
      ...sms,
      userId
    }).returning();
    return result;
  }

  async updateSMSHistory(id: string, updates: Partial<SMSHistory>): Promise<SMSHistory | undefined> {
    const [result] = await db.update(smsHistory)
      .set(updates)
      .where(eq(smsHistory.id, id))
      .returning();
    return result;
  }

  async getSMSTemplates(userId: string): Promise<SMSTemplate[]> {
    return await db.select().from(smsTemplates)
      .where(and(eq(smsTemplates.userId, userId), eq(smsTemplates.isActive, true)))
      .orderBy(desc(smsTemplates.createdAt));
  }

  async createSMSTemplate(userId: string, template: InsertSMSTemplate): Promise<SMSTemplate> {
    const [result] = await db.insert(smsTemplates).values({
      ...template,
      userId
    }).returning();
    return result;
  }

  // Payment Notifications
  async createPaymentNotification(userId: string, notification: InsertPaymentNotification): Promise<PaymentNotification> {
    const [result] = await db.insert(paymentNotifications).values({
      ...notification,
      userId
    }).returning();
    return result;
  }

  async getPaymentNotifications(): Promise<PaymentNotification[]> {
    return await db.select().from(paymentNotifications)
      .orderBy(desc(paymentNotifications.createdAt));
  }

  async getPaymentNotificationsByStatus(status: string): Promise<PaymentNotification[]> {
    return await db.select().from(paymentNotifications)
      .where(eq(paymentNotifications.status, status))
      .orderBy(desc(paymentNotifications.createdAt));
  }

  async getPaymentNotificationsByUser(userId: string): Promise<PaymentNotification[]> {
    return await db.select().from(paymentNotifications)
      .where(eq(paymentNotifications.userId, userId))
      .orderBy(desc(paymentNotifications.createdAt));
  }

  async updatePaymentNotificationStatus(id: string, status: string, adminNote?: string, processedBy?: string): Promise<PaymentNotification | undefined> {
    const [result] = await db.update(paymentNotifications)
      .set({
        status,
        adminNote,
        processedBy,
        processedAt: new Date()
      })
      .where(eq(paymentNotifications.id, id))
      .returning();
    return result;
  }

  // Admin Panel Operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users)
      .orderBy(desc(users.createdAt));
  }

  async getAllUsersForAdmin(): Promise<User[]> {
    return await db.select().from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    await db.update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId));
  }

  async updateUserActiveStatus(userId: string, isActive: boolean): Promise<void> {
    await db.update(users)
      .set({ isActive })
      .where(eq(users.id, userId));
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings)
      .orderBy(desc(systemSettings.createdAt));
  }

  async saveSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    // Check if setting exists
    const existingSetting = await db.select().from(systemSettings)
      .where(eq(systemSettings.key, setting.key))
      .limit(1);

    if (existingSetting.length > 0) {
      // Update existing setting
      const [result] = await db.update(systemSettings)
        .set({ 
          value: setting.value,
          updatedAt: new Date()
        })
        .where(eq(systemSettings.key, setting.key))
        .returning();
      return result;
    } else {
      // Create new setting
      const [result] = await db.insert(systemSettings)
        .values({
          ...setting,
          id: randomUUID()
        })
        .returning();
      return result;
    }
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const [result] = await db.insert(adminLogs).values(log).returning();
    return result;
  }

  async getAdminLogs(limit: number = 100): Promise<AdminLog[]> {
    return await db.select().from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit);
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings)
      .orderBy(systemSettings.category, systemSettings.key);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [result] = await db.select().from(systemSettings)
      .where(eq(systemSettings.key, key));
    return result;
  }

  async upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const [result] = await db.insert(systemSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: setting.value,
          description: setting.description,
          category: setting.category,
          updatedBy: setting.updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [result] = await db.insert(announcements).values(announcement).returning();
    return result;
  }

  async updateAnnouncement(id: string, updates: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [result] = await db.update(announcements)
      .set(updates)
      .where(eq(announcements.id, id))
      .returning();
    return result;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const result = await db.delete(announcements)
      .where(eq(announcements.id, id))
      .returning();
    return result.length > 0;
  }

  async getUserSessions(): Promise<UserSession[]> {
    return await db.select().from(userSessions)
      .orderBy(desc(userSessions.lastActivity));
  }

  async getUserSessionsByUserId(userId: string): Promise<UserSession[]> {
    return await db.select().from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.lastActivity));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [result] = await db.insert(userSessions).values(session).returning();
    return result;
  }

  async deactivateUserSession(id: string): Promise<boolean> {
    const [result] = await db.update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.id, id))
      .returning();
    return result.length > 0;
  }

  async getSystemMetrics(metricType?: string, limit: number = 100): Promise<SystemMetric[]> {
    let query = db.select().from(systemMetrics);
    
    if (metricType) {
      query = query.where(eq(systemMetrics.metricType, metricType));
    }
    
    return await query
      .orderBy(desc(systemMetrics.recordedAt))
      .limit(limit);
  }

  async createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric> {
    const [result] = await db.insert(systemMetrics).values(metric).returning();
    return result;
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalMessages: number;
    totalStorage: number;
    registrationsThisMonth: number;
    messagesThisMonth: number;
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user stats
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;
    const registrationsThisMonth = allUsers.filter(u => 
      new Date(u.createdAt) >= monthStart
    ).length;

    // Get message stats
    const allMessages = await db.select().from(directMessages);
    const totalMessages = allMessages.length;
    const messagesThisMonth = allMessages.filter(m => 
      new Date(m.createdAt) >= monthStart
    ).length;

    // Get storage stats (from image uploads)
    const allUploads = await db.select().from(imageUploads);
    const totalStorage = allUploads.reduce((sum, upload) => sum + upload.fileSize, 0);

    return {
      totalUsers,
      activeUsers: totalUsers, // For now, assume all users are active
      totalMessages,
      totalStorage,
      registrationsThisMonth,
      messagesThisMonth,
    };
  }

  // Session management with PostgreSQL sessions table integration
  async getActiveSessions(): Promise<{
    id: string;
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    lastActivity: string;
    createdAt: string;
    isActive: boolean;
    location?: string;
  }[]> {
    // Mock sessions data for development - real implementation would query sessions table
    const mockSessions = [
      {
        id: randomUUID(),
        userId: "eynffxrvr1e",
        userEmail: "modacizimtasarim@gmail.com",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
        lastActivity: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isActive: true,
        location: "İstanbul, Türkiye"
      },
      {
        id: randomUUID(),
        userId: "user2",
        userEmail: "admin@example.com",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36",
        lastActivity: new Date(Date.now() - 1800000).toISOString(),
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        isActive: false,
        location: "Ankara, Türkiye"
      }
    ];
    return mockSessions;
  }

  async terminateSession(sessionId: string): Promise<boolean> {
    try {
      // Delete from PostgreSQL sessions table
      const result = await db.execute(
        sql`DELETE FROM sessions WHERE sid = ${sessionId}`
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Session termination error:', error);
      return false;
    }
  }

  // SUPER_ADMIN Methods
  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<void> {
    await db.update(users)
      .set({ 
        role: role,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    await db.update(users)
      .set({ 
        status: status,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async terminateAllUserSessions(userId: string): Promise<void> {
    // Mock implementation - would terminate all sessions for specific user
    console.log(`Terminating all sessions for user: ${userId}`);
  }

  async createPasswordResetToken(userId: string): Promise<string> {
    const token = randomUUID();
    // Mock implementation - would create password reset token and send email
    console.log(`Password reset token created for user: ${userId}, token: ${token}`);
    return token;
  }

  async createInvitation(invitation: {
    email: string;
    role: 'USER' | 'ADMIN';
    invitedBy: string;
    expiresAt: Date;
  }): Promise<any> {
    // Mock implementation - would create invitation and send email
    const invitationData = {
      id: randomUUID(),
      ...invitation,
      createdAt: new Date(),
      used: false,
    };
    console.log('Invitation created:', invitationData);
    return invitationData;
  }

  async createSystemSetting(setting: any): Promise<any> {
    // Mock implementation - would save system setting
    const settingData = {
      id: randomUUID(),
      ...setting,
      createdAt: new Date(),
    };
    console.log('System setting created:', settingData);
    return settingData;
  }

  // Admin Notes operations
  async getAdminNotesByUser(targetUserId: string): Promise<AdminNote[]> {
    return await db.select().from(adminNotes)
      .where(eq(adminNotes.targetUserId, targetUserId))
      .orderBy(desc(adminNotes.createdAt));
  }

  async createAdminNote(note: InsertAdminNote): Promise<AdminNote> {
    const [result] = await db.insert(adminNotes).values(note).returning();
    return result;
  }

  async getAdminLogsRecent(): Promise<AdminLog[]> {
    return await db.select().from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(50);
  }

  // Payment notification methods
  async createPaymentNotification(userId: string, notificationData: InsertPaymentNotification): Promise<PaymentNotification> {
    const [result] = await db.insert(paymentNotifications).values({
      ...notificationData,
      userId,
    }).returning();
    return result;
  }

  async getPaymentNotifications(): Promise<PaymentNotification[]> {
    return await db.select().from(paymentNotifications)
      .orderBy(desc(paymentNotifications.createdAt));
  }

  async getPaymentNotificationsByStatus(status: string): Promise<PaymentNotification[]> {
    return await db.select().from(paymentNotifications)
      .where(eq(paymentNotifications.status, status))
      .orderBy(desc(paymentNotifications.createdAt));
  }

  async updatePaymentNotificationStatus(
    id: string, 
    status: string, 
    processedBy?: string, 
    adminNote?: string
  ): Promise<PaymentNotification | undefined> {
    const [result] = await db.update(paymentNotifications)
      .set({
        status,
        processedBy,
        adminNote,
        processedAt: new Date(),
      })
      .where(eq(paymentNotifications.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
