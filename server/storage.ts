import { 
  type Personnel, type InsertPersonnel,
  type Project, type InsertProject,
  type Timesheet, type InsertTimesheet,
  type Transaction, type InsertTransaction,
  type Note, type InsertNote,
  type Contractor, type InsertContractor,
  type Customer, type InsertCustomer,
  type CustomerTask, type InsertCustomerTask,
  type CustomerPayment, type InsertCustomerPayment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
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

  // Customer Payments
  getCustomerPayments(): Promise<CustomerPayment[]>;
  getCustomerPaymentsByCustomerId(customerId: string): Promise<CustomerPayment[]>;
  createCustomerPayment(payment: InsertCustomerPayment): Promise<CustomerPayment>;
  deleteCustomerPayment(id: string): Promise<boolean>;
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
  private customerPayments: Map<string, CustomerPayment> = new Map();

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
    const task: CustomerTask = {
      ...insertTask,
      id,
      createdAt: new Date(),
      description: insertTask.description || null,
      dueDate: insertTask.dueDate || null,
      status: insertTask.status || "pending",
    };
    this.customerTasks.set(id, task);
    return task;
  }

  async updateCustomerTask(id: string, updates: Partial<InsertCustomerTask>): Promise<CustomerTask | undefined> {
    const task = this.customerTasks.get(id);
    if (!task) return undefined;

    const updated = { ...task, ...updates };
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
}

export const storage = new MemStorage();
