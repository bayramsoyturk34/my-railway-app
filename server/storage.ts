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
  type User, type UpsertUser,
  personnel, projects, timesheets, transactions, notes, contractors, customers,
  customerTasks, customerQuotes, customerQuoteItems, customerPayments, contractorTasks, contractorPayments, personnelPayments,
  companyDirectory, messages, conversations, users
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations for authentication
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Personnel
  getPersonnel(): Promise<Personnel[]>;
  getPersonnelById(id: string): Promise<Personnel | undefined>;
  createPersonnel(personnel: InsertPersonnel): Promise<Personnel>;
  updatePersonnel(id: string, personnel: Partial<InsertPersonnel>): Promise<Personnel | undefined>;
  deletePersonnel(id: string): Promise<boolean>;

  // Projects
  getProjects(): Promise<Project[]>;
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
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  // Customer Tasks
  getCustomerTasks(): Promise<CustomerTask[]>;
  getCustomerTasksByCustomerId(customerId: string): Promise<CustomerTask[]>;
  createCustomerTask(task: InsertCustomerTask): Promise<CustomerTask>;
  updateCustomerTask(id: string, task: Partial<InsertCustomerTask>): Promise<CustomerTask | undefined>;
  deleteCustomerTask(id: string): Promise<boolean>;

  // Customer Quotes
  getCustomerQuotes(): Promise<CustomerQuote[]>;
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
  // Personnel methods
  async getPersonnel(): Promise<Personnel[]> {
    return await db.select().from(personnel);
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

  async getPersonnelPayment(id: string): Promise<PersonnelPayment | undefined> {
    const [result] = await db.select().from(personnelPayments).where(eq(personnelPayments.id, id));
    return result;
  }

  async getPersonnelPaymentsByPersonnelId(personnelId: string): Promise<PersonnelPayment[]> {
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

  async getCompany(id: string): Promise<CompanyDirectory | undefined> {
    const [result] = await db.select().from(companyDirectory).where(eq(companyDirectory.id, id));
    return result;
  }

  async createCompany(insertCompany: InsertCompanyDirectory): Promise<CompanyDirectory> {
    const [result] = await db.insert(companyDirectory).values(insertCompany).returning();
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

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [result] = await db.insert(conversations).values(insertConversation).returning();
    return result;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [result] = await db.update(conversations).set(updates).where(eq(conversations.id, id)).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
