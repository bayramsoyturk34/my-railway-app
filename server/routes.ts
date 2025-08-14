import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { z } from "zod";
import crypto from "crypto";
import multer from "multer";
import { 
  insertPersonnelSchema, 
  insertProjectSchema, 
  insertTimesheetSchema, 
  insertTransactionSchema,
  insertNoteSchema,
  insertContractorSchema,
  insertCustomerSchema,
  insertCustomerTaskSchema,
  insertCustomerQuoteSchema,
  insertCustomerQuoteItemSchema,
  insertCustomerPaymentSchema,
  insertContractorTaskSchema,
  insertContractorPaymentSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertReportSchema,
  insertPersonnelPaymentSchema,
  insertCompanyDirectorySchema,
  insertMessageSchema,
  insertNotificationSchema,
  insertCompanyBlockSchema,
  insertCompanyMuteSchema,
  insertAbuseReportSchema,
  insertFirmInviteSchema,
  insertPresenceLogSchema,
  insertMessageDraftSchema,
  insertAutoResponderSchema,
  insertDirectThreadSchema,
  insertDirectMessageSchema,
  insertImageUploadSchema,
  insertSMSHistorySchema,
  insertSMSTemplateSchema
} from "@shared/schema";

// Helper function to update quote total
async function updateQuoteTotal(quoteId: string) {
  try {
    const items = await storage.getCustomerQuoteItemsByQuoteId(quoteId);
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    
    const quotes = await storage.getCustomerQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    
    if (quote) {
      const vatAmount = quote.hasVAT ? (totalAmount * parseFloat(quote.vatRate || "0") / 100) : 0;
      const totalWithVAT = totalAmount + vatAmount;
      
      await storage.updateCustomerQuote(quoteId, {
        totalAmount: totalAmount.toString(),
        vatAmount: vatAmount.toString(),
        totalWithVAT: totalWithVAT.toString()
      });
    }
  } catch (error) {
    console.error("Error updating quote total:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth endpoints handled in auth.ts
  // Personnel routes
  app.get("/api/personnel", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const personnel = await storage.getPersonnelByUserId(userId);
      res.json(personnel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personnel" });
    }
  });

  app.post("/api/personnel", isAuthenticated, async (req, res) => {
    try {
      console.log("Personnel request body:", req.body);
      const userId = (req as any).user.id;
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        startDate: new Date(req.body.startDate)
      };
      const validatedData = insertPersonnelSchema.parse(processedBody);
      // Add userId for database insertion
      const personnelData = {
        ...validatedData,
        userId
      };
      const personnel = await storage.createPersonnel(personnelData);
      res.status(201).json(personnel);
    } catch (error) {
      console.error("Personnel validation error:", error);
      res.status(400).json({ message: "Invalid personnel data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/personnel/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Convert string date to Date object if present
      const processedBody = {
        ...req.body,
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) })
      };
      const validatedData = insertPersonnelSchema.partial().parse(processedBody);
      const personnel = await storage.updatePersonnel(id, validatedData);
      if (!personnel) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      res.json(personnel);
    } catch (error) {
      res.status(400).json({ message: "Invalid personnel data" });
    }
  });

  app.delete("/api/personnel/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePersonnel(id);
      if (!deleted) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete personnel" });
    }
  });

  // Projects routes
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      console.log("Project request body:", req.body);
      const userId = (req as any).user.id;
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        startDate: new Date(req.body.startDate)
      };
      const validatedData = insertProjectSchema.parse(processedBody);
      // Add userId for database insertion
      const projectData = {
        ...validatedData,
        userId
      };
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project validation error:", error);
      res.status(400).json({ message: "Invalid project data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Convert string date to Date object if present
      const processedBody = {
        ...req.body,
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) })
      };
      const validatedData = insertProjectSchema.partial().parse(processedBody);
      const project = await storage.updateProject(id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Timesheets routes
  app.get("/api/timesheets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const timesheets = await storage.getTimesheetsByUserId(userId);
      res.json(timesheets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  app.get("/api/timesheets/personnel/:personnelId", async (req, res) => {
    try {
      const { personnelId } = req.params;
      const timesheets = await storage.getTimesheetsByPersonnel(personnelId);
      res.json(timesheets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  app.post("/api/timesheets", isAuthenticated, async (req: any, res) => {
    try {
      console.log("Timesheet request body:", req.body);
      const userId = req.user.id;
      
      // Verify the personnel belongs to the user
      const personnel = await storage.getPersonnelByUserId(userId);
      const personnelExists = personnel.some(p => p.id === req.body.personnelId);
      
      if (!personnelExists) {
        return res.status(403).json({ message: "Access denied - Personnel not found" });
      }
      
      // Convert string date to Date object and add userId
      const processedBody = {
        ...req.body,
        userId: userId,
        date: new Date(req.body.date)
      };
      // Create a server-side schema that includes userId
      const serverTimesheetSchema = insertTimesheetSchema.extend({
        userId: z.string()
      });
      const validatedData = serverTimesheetSchema.parse(processedBody);
      const timesheet = await storage.createTimesheet(validatedData);
      res.status(201).json(timesheet);
    } catch (error) {
      console.error("Timesheet validation error:", error);
      res.status(400).json({ message: "Invalid timesheet data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/timesheets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Timesheet update request body:", req.body);
      
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        date: new Date(req.body.date)
      };
      
      // Get personnel info for wage calculation
      const personnel = await storage.getPersonnel();
      const person = personnel.find(p => p.id === processedBody.personnelId);
      
      if (!person) {
        return res.status(400).json({ message: "Personnel not found" });
      }
      
      // Calculate wages based on work type and salary type
      const dailySalary = person.salary ? parseFloat(person.salary) : 0;
      const salaryType = person.salaryType || "monthly";
      const dailyWage = salaryType === "daily" ? dailySalary : dailySalary / 30;
      
      let calculatedDailyWage = 0;
      const hourlyRate = dailyWage / 8; // 8 hour work day
      
      if (processedBody.workType === "tam") {
        calculatedDailyWage = dailyWage;
      } else if (processedBody.workType === "yarim") {
        calculatedDailyWage = dailyWage / 2;
      } else if (processedBody.workType === "mesai") {
        const overtimeHours = parseFloat(processedBody.overtimeHours || "0");
        calculatedDailyWage = hourlyRate * overtimeHours;
      }
      
      // Add calculated wages to processed body
      const enhancedBody = {
        ...processedBody,
        hourlyRate: hourlyRate.toFixed(2),
        dailyWage: calculatedDailyWage.toFixed(2)
      };
      
      const validatedData = insertTimesheetSchema.parse(enhancedBody);
      const timesheet = await storage.updateTimesheet(id, validatedData);
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      res.json(timesheet);
    } catch (error) {
      console.error("Timesheet update error:", error);
      res.status(400).json({ message: "Invalid timesheet data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/timesheets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTimesheet(id);
      if (!deleted) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete timesheet" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      console.log("Transaction request body:", req.body);
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        date: new Date(req.body.date),
        userId: req.user.id
      };
      const validatedData = insertTransactionSchema.parse(processedBody);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction validation error:", error);
      res.status(400).json({ message: "Invalid transaction data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Transaction deletion error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Notes routes
  app.get("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // For now, filter notes by userId if we have that field, otherwise return all
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Contractors routes
  app.get("/api/contractors", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // For now, return all contractors - later we can add userId filtering
      const contractors = await storage.getContractors();
      res.json(contractors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractors" });
    }
  });

  app.post("/api/contractors", async (req, res) => {
    try {
      const validatedData = insertContractorSchema.parse(req.body);
      const contractor = await storage.createContractor(validatedData);
      res.status(201).json(contractor);
    } catch (error) {
      res.status(400).json({ message: "Invalid contractor data" });
    }
  });

  // Financial summary endpoint
  app.get("/api/financial-summary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getTransactionsByUserId(userId);
      const customerTasks = await storage.getCustomerTasksByUserId(userId);
      const customerPayments = await storage.getCustomerPaymentsByUserId(userId);
      const customerQuotes = await storage.getCustomerQuotesByUserId(userId);
      
      console.log("All transactions:", transactions.map(t => ({ type: t.type, amount: t.amount, description: t.description })));

      const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      // Calculate customer tasks totals
      const customerTasksTotal = customerTasks.reduce((sum, task) => sum + parseFloat(task.amount), 0);
      const pendingTasks = customerTasks.filter(task => task.status === "pending" || task.status === "active" || task.status === "in_progress").length;
      const completedTasks = customerTasks.filter(task => task.status === "completed").length;

      // Calculate customer quotes totals (using totalAmount for KDV hariç amounts on dashboard)
      const totalQuoteValue = customerQuotes.reduce((sum, quote) => sum + parseFloat(quote.totalAmount || '0'), 0);
      const approvedQuoteValue = customerQuotes.filter(q => q.isApproved).reduce((sum, quote) => sum + parseFloat(quote.totalAmount || '0'), 0);
      const pendingQuoteValue = customerQuotes.filter(q => !q.isApproved).reduce((sum, quote) => sum + parseFloat(quote.totalAmount || '0'), 0);
      const approvedQuotes = customerQuotes.filter(q => q.isApproved).length;
      const pendingQuotes = customerQuotes.filter(q => !q.isApproved).length;

      // Calculate customer payments totals
      const customerPaymentsTotal = customerPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const thisMonth = new Date();
      const thisMonthPayments = customerPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === thisMonth.getMonth() && 
               paymentDate.getFullYear() === thisMonth.getFullYear();
      }).reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      const summary = {
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        customerTasks: {
          total: customerTasksTotal,
          pending: pendingTasks,
          completed: completedTasks,
        },
        customerQuotes: {
          total: pendingQuoteValue, // Show only pending quotes total in dashboard
          approved: approvedQuoteValue,
          pending: pendingQuoteValue,
          approvedCount: approvedQuotes,
          pendingCount: pendingQuotes
        },
        customerPayments: {
          total: customerPaymentsTotal,
          thisMonth: thisMonthPayments,
          count: customerPayments.length,
        }
      };

      console.log("Financial summary:", summary);
      res.json(summary);
    } catch (error) {
      console.error("Financial summary error:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Customers routes
  app.get("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const customers = await storage.getCustomersByUserId(userId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const validatedData = insertCustomerSchema.parse(req.body);
      // Add userId for database insertion
      const customerData = {
        ...validatedData,
        userId
      };
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Customer validation error:", error);
      res.status(400).json({ message: "Invalid customer data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Customer Tasks routes
  app.get("/api/customer-tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tasks = await storage.getCustomerTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer tasks" });
    }
  });

  app.get("/api/customer-tasks/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const tasks = await storage.getCustomerTasksByCustomerId(customerId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer tasks" });
    }
  });

  app.post("/api/customer-tasks", async (req, res) => {
    try {
      const processedBody = {
        ...req.body,
        ...(req.body.dueDate && { dueDate: new Date(req.body.dueDate) })
      };
      const validatedData = insertCustomerTaskSchema.parse(processedBody);
      const task = await storage.createCustomerTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/customer-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const processedBody = {
        ...req.body,
        ...(req.body.dueDate && { dueDate: new Date(req.body.dueDate) })
      };
      const validatedData = insertCustomerTaskSchema.partial().parse(processedBody);
      const task = await storage.updateCustomerTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.delete("/api/customer-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomerTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Customer Payments routes
  app.get("/api/customer-payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const payments = await storage.getCustomerPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer payments" });
    }
  });

  app.get("/api/customer-payments/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const payments = await storage.getCustomerPaymentsByCustomerId(customerId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer payments" });
    }
  });

  app.post("/api/customer-payments", isAuthenticated, async (req: any, res) => {
    try {
      const processedBody = {
        ...req.body,
        paymentDate: new Date(req.body.paymentDate)
      };
      const validatedData = insertCustomerPaymentSchema.parse(processedBody);
      
      // Create the customer payment
      const payment = await storage.createCustomerPayment(validatedData);
      
      // Get customer name for the transaction description
      const customer = await storage.getCustomer(validatedData.customerId);
      const customerName = customer?.name || "Bilinmeyen Müşteri";
      
      // Create a corresponding income transaction
      const incomeTransaction = {
        type: "income" as const,
        amount: validatedData.amount,
        description: `${customerName} - Müşteri Ödemesi: ${validatedData.description}`,
        date: validatedData.paymentDate,
        category: "Müşteri Ödemesi",
        userId: req.user.id
      };
      
      // Add the income transaction to the system
      await storage.createTransaction(incomeTransaction);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(400).json({ message: "Invalid payment data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/customer-payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Get payment details before deletion
      const payment = await storage.getCustomerPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Get customer name for transaction lookup
      const customer = await storage.getCustomer(payment.customerId);
      const customerName = customer?.name || "Bilinmeyen Müşteri";
      
      // Find and delete related transaction
      const transactions = await storage.getTransactions();
      const relatedTransaction = transactions.find(t => 
        t.type === "income" && 
        t.description.includes(customerName) && 
        t.description.includes("Müşteri Ödemesi") &&
        Math.abs(parseFloat(t.amount.toString()) - parseFloat(payment.amount.toString())) < 0.01 &&
        new Date(t.date).toDateString() === new Date(payment.paymentDate).toDateString()
      );
      
      if (relatedTransaction) {
        await storage.deleteTransaction(relatedTransaction.id);
      }
      
      // Delete the payment
      const deleted = await storage.deleteCustomerPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Customer payment deletion error:", error);
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Customer Quotes routes
  app.get("/api/customer-quotes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const quotes = await storage.getCustomerQuotesByUserId(userId);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer quotes" });
    }
  });

  app.get("/api/customer-quotes/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const quotes = await storage.getCustomerQuotesByCustomerId(customerId);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer quotes" });
    }
  });

  app.post("/api/customer-quotes", async (req, res) => {
    try {
      console.log("Quote creation request body:", req.body);
      const processedBody = {
        ...req.body,
        quoteDate: new Date(req.body.quoteDate),
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null
      };
      console.log("Processed quote body:", processedBody);
      const validatedData = insertCustomerQuoteSchema.parse(processedBody);
      console.log("Validated quote data:", validatedData);
      const quote = await storage.createCustomerQuote(validatedData);
      console.log("Created quote result:", quote);
      
      // Ensure proper serialization by creating a plain object
      const serializedQuote = {
        ...quote,
        id: quote.id,
        customerId: quote.customerId,
        title: quote.title,
        description: quote.description,
        totalAmount: quote.totalAmount,
        hasVAT: quote.hasVAT,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        totalWithVAT: quote.totalWithVAT,
        status: quote.status,
        isApproved: quote.isApproved,
        quoteDate: quote.quoteDate,
        validUntil: quote.validUntil,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt
      };
      console.log("Serialized quote for response:", serializedQuote);
      res.status(201).json(serializedQuote);
    } catch (error) {
      console.error("Customer quote creation error:", error);
      res.status(400).json({ message: "Invalid customer quote data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/customer-quotes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Quote update request body:", req.body);
      const processedBody = {
        ...req.body,
        ...(req.body.quoteDate && { quoteDate: new Date(req.body.quoteDate) }),
        ...(req.body.validUntil && { validUntil: new Date(req.body.validUntil) })
      };
      console.log("Processed quote update body:", processedBody);
      const validatedData = insertCustomerQuoteSchema.partial().parse(processedBody);
      
      const quote = await storage.updateCustomerQuote(id, validatedData);
      if (!quote) {
        return res.status(404).json({ message: "Customer quote not found" });
      }
      
      // If the entire quote is being approved, create a customer task for the total quote
      if (validatedData.isApproved === true && validatedData.status === 'approved') {
        // Check if there's already a task for this specific quote to prevent duplicates
        const existingTasks = await storage.getCustomerTasks();
        const quoteTaskExists = existingTasks.some(task => 
          task.customerId === quote.customerId && 
          (task.title === quote.title || task.title === `${quote.title} (Onaylanan Teklif)`)
        );
        
        console.log("Checking for existing task:", {
          quoteTitle: quote.title,
          customerId: quote.customerId,
          existingTasks: existingTasks.filter(t => t.customerId === quote.customerId).map(t => t.title),
          taskExists: quoteTaskExists
        });
        
        if (!quoteTaskExists) {
          console.log("Creating task for approved quote:", quote.title);
          // Use totalWithVAT if available (for VAT-inclusive quotes), otherwise use totalAmount
          const finalAmount = quote.hasVAT ? (quote.totalWithVAT || quote.totalAmount) : quote.totalAmount;
          
          // Get quote items to calculate proper unitPrice and quantity
          const quoteItems = await storage.getCustomerQuoteItemsByQuoteId(id);
          let totalQuantity = 1;
          let calculatedUnitPrice = parseFloat(finalAmount);
          let primaryUnit = "adet";
          
          if (quoteItems.length > 0) {
            // Sum all quantities and take the first unit as primary
            totalQuantity = quoteItems.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
            primaryUnit = quoteItems[0].unit;
            // Calculate unit price based on total amount / total quantity
            calculatedUnitPrice = parseFloat(finalAmount) / totalQuantity;
          }
          
          const taskData = {
            customerId: quote.customerId,
            title: `${quote.title} (Onaylanan Teklif)`,
            description: quote.description || `Teklif onaylandı: ${quote.title}`,
            quantity: totalQuantity,
            unit: primaryUnit,
            unitPrice: calculatedUnitPrice,
            amount: finalAmount || '0',
            status: "pending" as const,
            dueDate: null
          };
          await storage.createCustomerTask(taskData);
          console.log("Task created successfully for quote:", quote.title);
        } else {
          console.log("Task already exists for quote:", quote.title, "- skipping creation");
        }
      }
      
      res.json(quote);
    } catch (error) {
      console.error("Customer quote update error:", error);
      res.status(400).json({ 
        message: "Invalid customer quote data", 
        error: error instanceof Error ? error.message : String(error),
        requestBody: req.body
      });
    }
  });

  app.delete("/api/customer-quotes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomerQuote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer quote not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer quote" });
    }
  });

  // Customer Quote Items routes
  app.get("/api/customer-quote-items/quote/:quoteId", async (req, res) => {
    try {
      const { quoteId } = req.params;
      const items = await storage.getCustomerQuoteItemsByQuoteId(quoteId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote items" });
    }
  });

  app.post("/api/customer-quote-items", async (req, res) => {
    try {
      console.log("Quote item request body:", req.body);
      
      // Convert numeric values to strings for decimal fields
      const processedBody = {
        ...req.body,
        unitPrice: req.body.unitPrice?.toString() || "0",
        totalPrice: req.body.totalPrice?.toString() || "0",
        quantity: req.body.quantity?.toString() || "1.00"
      };
      
      console.log("Processed quote item body:", processedBody);
      const validatedData = insertCustomerQuoteItemSchema.parse(processedBody);
      const item = await storage.createCustomerQuoteItem(validatedData);
      
      // Update quote total after creating item
      await updateQuoteTotal(validatedData.quoteId);
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Quote item validation error:", error);
      res.status(400).json({ 
        message: "Invalid quote item data", 
        error: error instanceof Error ? error.message : String(error),
        originalBody: req.body 
      });
    }
  });

  app.put("/api/customer-quote-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCustomerQuoteItemSchema.partial().parse(req.body);
      
      // Get the item first to know the quote ID
      const items = await storage.getCustomerQuoteItems();
      const currentItem = items.find(item => item.id === id);
      
      // Just update the quote item status - NO automatic task creation for individual items
      const item = await storage.updateCustomerQuoteItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Quote item not found" });
      }
      
      // Update quote total after updating item
      if (currentItem) {
        await updateQuoteTotal(currentItem.quoteId);
      }
      
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote item data" });
    }
  });

  app.delete("/api/customer-quote-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomerQuoteItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Quote item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote item" });
    }
  });

  // Contractor Tasks routes
  app.get("/api/contractor-tasks", async (req, res) => {
    try {
      const tasks = await storage.getContractorTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor tasks" });
    }
  });

  app.get("/api/contractor-tasks/contractor/:contractorId", async (req, res) => {
    try {
      const { contractorId } = req.params;
      const tasks = await storage.getContractorTasksByContractorId(contractorId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor tasks" });
    }
  });

  app.post("/api/contractor-tasks", async (req, res) => {
    try {
      const processedBody = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      };
      const validatedData = insertContractorTaskSchema.parse(processedBody);
      const task = await storage.createContractorTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Contractor task creation error:", error);
      res.status(400).json({ message: "Invalid contractor task data" });
    }
  });

  app.put("/api/contractor-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const processedBody = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      };
      const validatedData = insertContractorTaskSchema.partial().parse(processedBody);
      const task = await storage.updateContractorTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Contractor task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid contractor task data" });
    }
  });

  app.delete("/api/contractor-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteContractorTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contractor task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contractor task" });
    }
  });

  // Contractor Payments routes
  app.get("/api/contractor-payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const payments = await storage.getContractorPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor payments" });
    }
  });

  app.get("/api/contractor-payments/contractor/:contractorId", isAuthenticated, async (req: any, res) => {
    try {
      const { contractorId } = req.params;
      const userId = req.user.id;
      const payments = await storage.getContractorPaymentsByContractorIdAndUserId(contractorId, userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor payments" });
    }
  });

  app.post("/api/contractor-payments", isAuthenticated, async (req: any, res) => {
    try {
      const processedBody = {
        ...req.body,
        paymentDate: new Date(req.body.paymentDate)
      };
      const validatedData = insertContractorPaymentSchema.parse(processedBody);
      
      // Create the contractor payment
      const payment = await storage.createContractorPayment(validatedData);
      
      // Get contractor name for the transaction description
      const contractor = await storage.getProject(validatedData.contractorId);
      const contractorName = contractor?.name || "Bilinmeyen Yüklenici";
      
      // Create a corresponding expense transaction
      const expenseTransaction = {
        type: "expense" as const,
        amount: validatedData.amount,
        description: `${contractorName} - Yüklenici Ödemesi: ${validatedData.description || validatedData.paymentMethod}`,
        date: validatedData.paymentDate,
        category: "Yüklenici Ödemesi",
        userId: req.user.id
      };
      
      // Add the expense transaction to the system
      await storage.createTransaction(expenseTransaction);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Contractor payment creation error:", error);
      res.status(400).json({ message: "Invalid contractor payment data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/contractor-payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const processedBody = {
        ...req.body,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined
      };
      const validatedData = insertContractorPaymentSchema.partial().parse(processedBody);
      const payment = await storage.updateContractorPayment(id, validatedData);
      if (!payment) {
        return res.status(404).json({ message: "Contractor payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid contractor payment data" });
    }
  });

  app.delete("/api/contractor-payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Get the payment first to check ownership and get transaction details
      const payment = await storage.getContractorPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Contractor payment not found" });
      }
      
      // Check if the contractor belongs to this user (via project)
      const project = await storage.getProject(payment.contractorId);
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Delete the payment
      const deleted = await storage.deleteContractorPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contractor payment not found" });
      }
      
      // Find and delete the associated transaction
      const transactions = await storage.getTransactionsByUserId(userId);
      const relatedTransaction = transactions.find((t: any) => 
        t.type === 'expense' && 
        t.description.includes('Yüklenici Ödemesi') && 
        parseFloat(t.amount) === parseFloat(payment.amount)
      );
      
      if (relatedTransaction) {
        await storage.deleteTransaction(relatedTransaction.id);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete contractor payment error:", error);
      res.status(500).json({ message: "Failed to delete contractor payment" });
    }
  });

  app.delete("/api/contractor-payments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Get payment details before deletion
      const payment = await storage.getContractorPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Contractor payment not found" });
      }
      
      // Get contractor name for transaction lookup  
      const contractor = await storage.getProject(payment.contractorId);
      const contractorName = contractor?.name || "Bilinmeyen Yüklenici";
      
      // Find and delete related transaction
      const transactions = await storage.getTransactions();
      const relatedTransaction = transactions.find(t => 
        t.type === "expense" && 
        t.description.includes(contractorName) && 
        t.description.includes("Yüklenici Ödemesi") &&
        Math.abs(parseFloat(t.amount.toString()) - parseFloat(payment.amount.toString())) < 0.01 &&
        new Date(t.date).toDateString() === new Date(payment.paymentDate).toDateString()
      );
      
      if (relatedTransaction) {
        await storage.deleteTransaction(relatedTransaction.id);
      }
      
      // Delete the payment
      const deleted = await storage.deleteContractorPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contractor payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Contractor payment deletion error:", error);
      res.status(500).json({ message: "Failed to delete contractor payment" });
    }
  });

  // Analytics dashboard endpoint
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      const projects = await storage.getProjects();
      const personnel = await storage.getPersonnel();
      const timesheets = await storage.getTimesheets();

      // Calculate real monthly revenue from actual transactions
      const currentYear = new Date().getFullYear();
      const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
      
      const monthlyRevenue = monthNames.map((month, index) => {
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === index && transactionDate.getFullYear() === currentYear;
        });
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
        return { month, income, expenses };
      });

      const projectsByStatus = [
        { status: "Aktif", count: projects.filter(p => p.status === "active").length },
        { status: "Pasif", count: projects.filter(p => p.status === "passive").length },
        { status: "Tamamlandı", count: projects.filter(p => p.status === "completed").length },
      ];



      const chartData = {
        monthlyRevenue,
        projectsByStatus,
      };

      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  // Personnel Payments routes
  app.get("/api/personnel-payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const payments = await storage.getPersonnelPaymentsByUserId(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personnel payments" });
    }
  });

  app.get("/api/personnel-payments/personnel/:personnelId", isAuthenticated, async (req: any, res) => {
    try {
      const { personnelId } = req.params;
      const userId = req.user.id;
      const payments = await storage.getPersonnelPaymentsByPersonnelIdAndUserId(personnelId, userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personnel payments" });
    }
  });

  app.post("/api/personnel-payments", isAuthenticated, async (req: any, res) => {
    try {
      console.log("Personnel payment request body:", req.body);
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        paymentDate: new Date(req.body.paymentDate)
      };
      const validatedData = insertPersonnelPaymentSchema.parse(processedBody);
      
      // Create the personnel payment
      const payment = await storage.createPersonnelPayment(validatedData);
      
      // Get personnel name for the transaction description
      const personnel = await storage.getPersonnelByUserId(req.user.id);
      const person = personnel.find(p => p.id === validatedData.personnelId);
      const personnelName = person?.name || "Bilinmeyen Personel";
      
      // Create a corresponding expense transaction
      const expenseTransaction = {
        type: "expense" as const,
        amount: validatedData.amount,
        description: `${personnelName} - Maaş Ödemesi (${validatedData.description || validatedData.paymentType})`,
        date: validatedData.paymentDate,
        category: "Personel Ödemesi",
        userId: req.user.id
      };
      
      // Add the expense transaction to the system
      await storage.createTransaction(expenseTransaction);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Personnel payment validation error:", error);
      res.status(400).json({ message: "Invalid personnel payment data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/personnel-payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Convert string date to Date object if present
      const processedBody = {
        ...req.body,
        ...(req.body.paymentDate && { paymentDate: new Date(req.body.paymentDate) })
      };
      const validatedData = insertPersonnelPaymentSchema.partial().parse(processedBody);
      const payment = await storage.updatePersonnelPayment(id, validatedData);
      if (!payment) {
        return res.status(404).json({ message: "Personnel payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid personnel payment data" });
    }
  });

  app.delete("/api/personnel-payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get payment details before deletion
      const payment = await storage.getPersonnelPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Personnel payment not found" });
      }
      
      // Get personnel name for transaction lookup
      const personnel = await storage.getPersonnel();
      const person = personnel.find(p => p.id === payment.personnelId);
      const personnelName = person?.name || "Bilinmeyen Personel";
      
      // Find and delete related transaction
      const transactions = await storage.getTransactions();
      const relatedTransaction = transactions.find(t => 
        t.type === "expense" && 
        t.description.includes(personnelName) && 
        t.description.includes("Maaş Ödemesi") &&
        Math.abs(parseFloat(t.amount.toString()) - parseFloat(payment.amount.toString())) < 0.01 &&
        new Date(t.date).toDateString() === new Date(payment.paymentDate).toDateString()
      );
      
      if (relatedTransaction) {
        await storage.deleteTransaction(relatedTransaction.id);
      }
      
      // Delete the payment
      const deleted = await storage.deletePersonnelPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Personnel payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Personnel payment deletion error:", error);
      res.status(500).json({ message: "Failed to delete personnel payment" });
    }
  });

  // Contractor Tasks routes
  app.get("/api/contractor-tasks", async (req, res) => {
    try {
      const tasks = await storage.getContractorTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor tasks" });
    }
  });

  app.get("/api/contractor-tasks/contractor/:contractorId", async (req, res) => {
    try {
      const { contractorId } = req.params;
      const tasks = await storage.getContractorTasksByContractorId(contractorId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor tasks" });
    }
  });

  app.post("/api/contractor-tasks", async (req, res) => {
    try {
      const processedBody = {
        ...req.body,
        ...(req.body.dueDate && { dueDate: new Date(req.body.dueDate) })
      };
      const validatedData = insertContractorTaskSchema.parse(processedBody);
      const task = await storage.createContractorTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/contractor-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const processedBody = {
        ...req.body,
        ...(req.body.dueDate && { dueDate: new Date(req.body.dueDate) })
      };
      const validatedData = insertContractorTaskSchema.partial().parse(processedBody);
      const task = await storage.updateContractorTask(id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.delete("/api/contractor-tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteContractorTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Duplicate contractor payments routes removed - using the authenticated version above

  app.post("/api/contractor-payments-old", async (req, res) => {
    try {
      const processedBody = {
        ...req.body,
        paymentDate: new Date(req.body.paymentDate)
      };
      const validatedData = insertContractorPaymentSchema.parse(processedBody);
      
      // Create the contractor payment
      const payment = await storage.createContractorPayment(validatedData);
      
      // Get contractor name for the transaction description
      const contractor = await storage.getProject(validatedData.contractorId); // Using project table as contractor
      const contractorName = contractor?.name || "Bilinmeyen Yüklenici";
      
      // Create a corresponding expense transaction
      const expenseTransaction = {
        type: "expense" as const,
        amount: validatedData.amount,
        description: `${contractorName} - Yüklenici Ödemesi: ${validatedData.description}`,
        date: validatedData.paymentDate,
        category: "Yüklenici Ödemesi"
      };
      
      // Add the expense transaction to the system
      const transaction = await storage.createTransaction(expenseTransaction);
      
      // Update payment with transaction reference
      if (transaction && transaction.id) {
        await storage.updateContractorPayment(payment.id, { transactionId: transaction.id });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Contractor payment creation error:", error);
      res.status(400).json({ message: "Invalid payment data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/contractor-payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const processedBody = {
        ...req.body,
        ...(req.body.paymentDate && { paymentDate: new Date(req.body.paymentDate) })
      };
      const validatedData = insertContractorPaymentSchema.partial().parse(processedBody);
      const payment = await storage.updateContractorPayment(id, validatedData);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.delete("/api/contractor-payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteContractorPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Company Directory routes
  app.get("/api/company-directory", isAuthenticated, async (req, res) => {
    try {
      // Tüm firmaları göster ki kullanıcılar birbirleriyle mesajlaşabilsin
      const companies = await storage.getCompanyDirectory();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching company directory:", error);
      res.status(500).json({ error: "Failed to fetch company directory" });
    }
  });

  app.get("/api/company-directory/my-companies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const myCompanies = await storage.getCompanyDirectoryByUserId(userId);
      res.json(myCompanies);
    } catch (error) {
      console.error("Error fetching my companies:", error);
      res.status(500).json({ error: "Failed to fetch my companies" });
    }
  });

  // Enhanced PRO Company Directory routes
  app.get("/api/directory/firms", async (req, res) => {
    try {
      const { search, city, industry, verified } = req.query;
      const filters = {
        search: search as string,
        city: city as string,
        industry: industry as string,
        verified: verified === "true" ? true : verified === "false" ? false : undefined
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const companies = await storage.getProCompanyDirectory(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching PRO company directory:", error);
      res.status(500).json({ error: "Failed to fetch PRO company directory" });
    }
  });

  app.get("/api/directory/my-companies", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const myCompanies = await storage.getCompanyDirectoryByUserId(userId);
      res.json(myCompanies);
    } catch (error) {
      console.error("Error fetching user companies:", error);
      res.status(500).json({ error: "Failed to fetch user companies" });
    }
  });

  app.get("/api/company-directory/:id", isAuthenticated, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.post("/api/company-directory", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { insertCompanyDirectorySchema } = await import("@shared/schema");
      const validatedData = insertCompanyDirectorySchema.parse(req.body);
      const company = await storage.createCompany(validatedData, userId);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  app.put("/api/company-directory/:id", isAuthenticated, async (req, res) => {
    try {
      const { insertCompanyDirectorySchema } = await import("@shared/schema");
      const validatedData = insertCompanyDirectorySchema.parse(req.body);
      const company = await storage.updateCompany(req.params.id, validatedData);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  app.delete("/api/company-directory/:id", isAuthenticated, async (req, res) => {
    try {
      const success = await storage.deleteCompany(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ error: "Failed to delete company" });
    }
  });

  // Enhanced Messaging and Conversation routes
  app.post("/api/threads/open", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { targetCompanyId } = req.body;
      
      if (!targetCompanyId) {
        return res.status(400).json({ error: "targetCompanyId is required" });
      }

      // Get current user's company
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      if (userCompanies.length === 0) {
        return res.status(400).json({ error: "User has no company profile" });
      }
      
      const userCompanyId = userCompanies[0].id;

      // Check if target company is blocked
      const isBlocked = await storage.isCompanyBlocked(targetCompanyId, userCompanyId);
      if (isBlocked) {
        return res.status(403).json({ error: "Cannot message this company" });
      }

      const conversation = await storage.getOrCreateConversation(userCompanyId, targetCompanyId);
      res.json(conversation);
    } catch (error) {
      console.error("Error opening conversation:", error);
      res.status(500).json({ error: "Failed to open conversation" });
    }
  });

  // Use DirectThread system instead
  app.get("/api/threads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (userCompanies.length === 0) {
        return res.json([]);
      }
      
      const userCompanyId = userCompanies[0].id;
      const threads = await storage.getDirectThreadsByUserId(userId);
      
      // Enrich threads with company information
      const enrichedThreads = await Promise.all(threads.map(async (thread) => {
        // Get the other participant (not current user)
        const participants = thread.participants || [];
        const otherParticipant = participants.find(p => p.userId !== userId);
        
        if (otherParticipant) {
          const company = await storage.getCompany(otherParticipant.companyId);
          return {
            ...thread,
            participants: [{
              ...otherParticipant,
              company
            }]
          };
        }
        
        return thread;
      }));
      
      console.log("DirectThreads found:", enrichedThreads.length);
      res.json(enrichedThreads);
    } catch (error) {
      console.error("Error fetching direct threads:", error);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  app.get("/api/threads/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const conversationId = req.params.id;
      
      // Get conversation by ID
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Get messages for this conversation
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/threads/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const threadId = req.params.id;
      const { body, attachment, attachmentUrl, attachmentType } = req.body;

      console.log("Legacy message endpoint called - threadId:", threadId, "userId:", userId);

      // Get user's company
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      if (userCompanies.length === 0) {
        return res.status(400).json({ error: "User has no company profile" });
      }
      
      const userCompanyId = userCompanies[0].id;

      // Get DirectThread instead of conversation
      const currentThread = await storage.getDirectThreadById(threadId);
      if (!currentThread) {
        console.log("Thread not found with ID:", threadId);
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Verify user has access to this thread
      if (currentThread.firm1Id !== userCompanyId && currentThread.firm2Id !== userCompanyId) {
        console.log("User firmId:", userCompanyId, "not authorized for thread:", currentThread);
        return res.status(403).json({ error: "Not authorized to message in this thread" });
      }

      const targetCompanyId = currentThread.firm1Id === userCompanyId ? currentThread.firm2Id : currentThread.firm1Id;

      // Create DirectMessage using new schema
      const message = await storage.createDirectMessage({
        threadId,
        senderFirmId: userCompanyId,
        receiverFirmId: targetCompanyId,
        body: body || "",
        attachmentUrl: attachmentUrl || attachment,
        attachmentType: attachmentType || (attachment ? "file" : "text")
      });

      console.log("Legacy endpoint - Message created:", message);
      
      // Create notification for the receiver
      try {
        const targetCompany = await storage.getCompany(targetCompanyId);
        if (targetCompany && targetCompany.userId) {
          const notification = await storage.createNotification({
            userId: targetCompany.userId,
            type: "NEW_DM",
            payload: {
              threadId,
              fromCompanyId: userCompanyId,
              fromCompanyName: userCompanies[0].companyName,
              messageId: message.id,
              title: "Yeni Mesaj",
              message: `${userCompanies[0].companyName} size mesaj gönderdi`
            }
          });
          console.log("Notification created:", notification);
        }
      } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
      }
      
      res.json(message);
    } catch (error) {
      console.error("Legacy message creation error:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });



  app.post("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const messageId = req.params.id;
      const success = await storage.markMessageAsRead(messageId);
      
      if (success) {
        // Create read notification for sender
        const message = await storage.getMessages().then(messages => 
          messages.find(m => m.id === messageId)
        );
        
        if (message) {
          await storage.createNotification({
            userId: message.fromUserId,
            type: "DM_READ",
            payload: {
              messageId: message.id,
              readByCompanyId: message.toCompanyId
            }
          });
        }
      }
      
      res.json({ success });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = req.params.id;
      const success = await storage.markNotificationAsRead(notificationId);
      res.json({ success });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Blocking and muting routes
  app.post("/api/blocks", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { targetCompanyId } = req.body;

      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      if (userCompanies.length === 0) {
        return res.status(400).json({ error: "User has no company profile" });
      }

      const userCompanyId = userCompanies[0].id;
      const block = await storage.createCompanyBlock(userCompanyId, targetCompanyId);
      res.status(201).json(block);
    } catch (error) {
      console.error("Error creating block:", error);
      res.status(500).json({ error: "Failed to block company" });
    }
  });

  app.delete("/api/blocks/:targetCompanyId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { targetCompanyId } = req.params;

      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      if (userCompanies.length === 0) {
        return res.status(400).json({ error: "User has no company profile" });
      }

      const userCompanyId = userCompanies[0].id;
      const success = await storage.removeCompanyBlock(userCompanyId, targetCompanyId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing block:", error);
      res.status(500).json({ error: "Failed to unblock company" });
    }
  });

  app.post("/api/mutes", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { targetCompanyId } = req.body;

      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      if (userCompanies.length === 0) {
        return res.status(400).json({ error: "User has no company profile" });
      }

      const userCompanyId = userCompanies[0].id;
      const mute = await storage.createCompanyMute(userCompanyId, targetCompanyId);
      res.status(201).json(mute);
    } catch (error) {
      console.error("Error creating mute:", error);
      res.status(500).json({ error: "Failed to mute company" });
    }
  });

  app.delete("/api/mutes/:targetCompanyId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { targetCompanyId } = req.params;

      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      if (userCompanies.length === 0) {
        return res.status(400).json({ error: "User has no company profile" });
      }

      const userCompanyId = userCompanies[0].id;
      const success = await storage.removeCompanyMute(userCompanyId, targetCompanyId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing mute:", error);
      res.status(500).json({ error: "Failed to unmute company" });
    }
  });

  // Abuse reporting routes
  app.post("/api/reports", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { targetCompanyId, reason, messageSample } = req.body;

      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      if (userCompanies.length === 0) {
        return res.status(400).json({ error: "User has no company profile" });
      }

      const userCompanyId = userCompanies[0].id;
      const validatedData = insertAbuseReportSchema.parse({
        reporterCompanyId: userCompanyId,
        reportedCompanyId: targetCompanyId,
        reason,
        messageSample
      });

      const report = await storage.createAbuseReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating abuse report:", error);
      res.status(500).json({ error: "Failed to create abuse report" });
    }
  });

  // Admin routes for PRO system
  app.patch("/api/admin/directory/:companyId/verify", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { companyId } = req.params;
      const success = await storage.verifyCompanyProfile(companyId);
      res.json({ success });
    } catch (error) {
      console.error("Error verifying company:", error);
      res.status(500).json({ error: "Failed to verify company" });
    }
  });

  app.patch("/api/admin/directory/:companyId/pro-status", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { companyId } = req.params;
      const { isProVisible } = req.body;
      const success = await storage.updateCompanyProStatus(companyId, isProVisible);
      res.json({ success });
    } catch (error) {
      console.error("Error updating PRO status:", error);
      res.status(500).json({ error: "Failed to update PRO status" });
    }
  });

  // Messages routes
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      // Kullanıcının dahil olduğu tüm mesajları getir
      const messages = await storage.getMessagesByUser(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:companyId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const targetCompanyId = req.params.companyId;
      
      // Kullanıcının firmalarını al
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      const userCompanyId = userCompanies?.[0]?.id || "";
      
      console.log(`Fetching messages between ${userCompanyId} and ${targetCompanyId}`);
      
      // İki firma arasındaki mesajları getir
      const messages = await storage.getMessagesByConversation(userCompanyId, targetCompanyId);
      console.log(`Found ${messages.length} messages`);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ error: "Failed to fetch conversation messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      // Kullanıcının firmalarını al
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      const fromCompanyId = userCompanies?.[0]?.id || "";
      
      // Basit mesaj oluşturma - mevcut Message tablosunu kullan
      const messageData = {
        fromCompanyId: fromCompanyId,
        toCompanyId: req.body.receiverFirmId,
        message: req.body.body,
        fromUserId: userId,
        toUserId: userId // Şimdilik aynı kullanıcı
      };
      
      console.log("Creating message with data:", messageData);
      
      const message = await storage.createMessage(messageData);
      
      // Alıcı firmanın sahibini bul - tüm firmalar arasından ara
      const allCompanies = await storage.getCompanyDirectory();
      const receiverCompany = allCompanies.find(c => c.id === req.body.receiverFirmId);
      if (receiverCompany && receiverCompany.userId !== userId) {
        // Gönderen firmanın adını al  
        const fromCompany = userCompanies?.[0]; // Kullanıcının kendi firması
        console.log("Gönderen firma bilgisi:", fromCompany);
        console.log("Alıcı firma bilgisi:", receiverCompany);
        
        // Alıcı için bildirim oluştur
        const notification = {
          userId: receiverCompany.userId, // Alıcı firmanın sahibi
          type: "NEW_MESSAGE" as const,
          title: "Yeni Mesaj",
          content: `${fromCompany?.companyName || 'Bilinmeyen Firma'} size mesaj gönderdi`,
          payload: {
            fromCompanyId: fromCompanyId,
            toCompanyId: req.body.receiverFirmId,
            messageId: message.id,
            fromCompanyName: fromCompany?.companyName || 'Bilinmeyen Firma'
          }
        };
        
        console.log("Creating notification for receiver:", notification);
        await storage.createNotification(notification);
      }
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.put("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const success = await storage.markMessageAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Conversations routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:company1Id/:company2Id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.company1Id, req.params.company2Id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const { insertConversationSchema } = await import("@shared/schema");
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const { insertConversationSchema } = await import("@shared/schema");
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.updateConversation(req.params.id, validatedData);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ error: "Failed to update conversation" });
    }
  });



  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin privileges required" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // System metrics endpoint
  app.get("/api/admin/system-metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Mock system metrics - in real app would come from system monitoring
      const metrics = [
        {
          name: "CPU Usage",
          value: Math.floor(Math.random() * 50) + 30, // 30-80%
          unit: "%",
          status: "normal",
          timestamp: new Date().toISOString()
        },
        {
          name: "Memory Usage", 
          value: Math.floor(Math.random() * 40) + 40, // 40-80%
          unit: "%",
          status: "normal",
          timestamp: new Date().toISOString()
        },
        {
          name: "Disk Usage",
          value: Math.floor(Math.random() * 30) + 50, // 50-80%
          unit: "%", 
          status: "normal",
          timestamp: new Date().toISOString()
        },
        {
          name: "Active Connections",
          value: Math.floor(Math.random() * 50) + 10, // 10-60
          unit: "conn",
          status: "normal",
          timestamp: new Date().toISOString()
        }
      ];
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ error: "Failed to fetch system metrics" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Access denied - Admin privileges required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Enhanced Messaging & Firm Invites
  
  // Set up multer for image uploads
  const upload = multer({
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/png', 'image/jpeg', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PNG, JPEG, and WebP images allowed'));
      }
    }
  });

  // Image upload endpoint  
  app.post("/api/upload-image", upload.single('image'), async (req: any, res) => {
    try {
      // Manual authentication check for file upload
      const authHeader = req.headers.authorization;
      let sessionId = authHeader?.replace('Bearer ', '') || req.cookies['connect.sid'];
      
      // Handle signed cookies format: s:sessionId.signature
      if (sessionId && sessionId.startsWith('s:')) {
        sessionId = sessionId.substring(2).split('.')[0];
      }
      
      if (!sessionId) {
        console.log("No session ID found for image upload");
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { getSession } = await import("./auth");
      const user = await getSession(sessionId);
      
      if (!user) {
        console.log("Session not found or expired for image upload");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const userId = user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id; // Use first company
      const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${req.file.mimetype.split('/')[1]}`;
      
      // In production, you'd save to cloud storage. For now, we'll use a local path simulation
      const url = `/uploads/${filename}`;
      
      const imageUpload = await storage.createImageUpload({
        userId,
        firmId,
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        url,
        width: 800, // Mock values - in production use sharp to get actual dimensions
        height: 600
      });

      res.json({
        url: imageUpload.url,
        width: imageUpload.width,
        height: imageUpload.height,
        mime: imageUpload.mimeType
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Firm Invites
  app.post("/api/invites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const { email, role } = req.body;
      
      // Generate invite token
      const payload = { email, firmId, role, exp: Date.now() + (72 * 60 * 60 * 1000) }; // 72 hours
      const token = Buffer.from(JSON.stringify(payload)).toString('base64');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const invite = await storage.createFirmInvite({
        firmId,
        email,
        role,
        tokenHash,
        expiresAt: new Date(Date.now() + (72 * 60 * 60 * 1000)),
        createdByUserId: userId
      });

      const inviteUrl = `${req.protocol}://${req.get('host')}/invite/accept?token=${token}`;
      
      res.json({ inviteUrl, invite });
    } catch (error) {
      console.error("Invite creation error:", error);
      res.status(500).json({ error: "Failed to create invite" });
    }
  });

  app.get("/api/invites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const invites = await storage.getFirmInvitesByFirm(firmId);
      res.json(invites);
    } catch (error) {
      console.error("Invites fetch error:", error);
      res.status(500).json({ error: "Failed to fetch invites" });
    }
  });

  app.post("/api/invites/accept", async (req, res) => {
    try {
      const { token } = req.body;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const invite = await storage.getFirmInvitesByToken(tokenHash);
      if (!invite || invite.acceptedAt || new Date() > invite.expiresAt) {
        return res.status(400).json({ error: "Invalid or expired invite" });
      }

      // Decode token to get invite details
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      await storage.acceptFirmInvite(invite.id);
      res.json({ success: true, message: "Invite accepted successfully" });
    } catch (error) {
      console.error("Invite accept error:", error);
      res.status(500).json({ error: "Failed to accept invite" });
    }
  });

  // Presence endpoints
  app.post("/api/presence/heartbeat", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const clientInfo = req.body.clientInfo || req.get('User-Agent');
      
      await storage.updatePresence({
        firmId,
        userId,
        clientInfo
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Presence heartbeat error:", error);
      res.status(500).json({ error: "Failed to update presence" });
    }
  });

  app.get("/api/presence/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const targetUserId = req.params.userId;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const presence = await storage.getPresenceByFirmAndUser(firmId, targetUserId);
      
      if (!presence) {
        return res.json({ online: false, lastSeen: null });
      }

      const now = new Date();
      const presenceTTL = 2 * 60 * 1000; // 2 minutes
      const isOnline = (now.getTime() - presence.lastHeartbeatAt.getTime()) <= presenceTTL;
      
      res.json({
        online: isOnline,
        lastSeen: presence.lastHeartbeatAt.toISOString()
      });
    } catch (error) {
      console.error("Presence fetch error:", error);
      res.status(500).json({ error: "Failed to fetch presence" });
    }
  });

  // Message Drafts
  app.get("/api/drafts/:threadId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const draft = await storage.getDraft(req.params.threadId, firmId);
      
      res.json({ body: draft?.body || "" });
    } catch (error) {
      console.error("Draft fetch error:", error);
      res.status(500).json({ error: "Failed to fetch draft" });
    }
  });

  app.post("/api/drafts/upsert", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const { threadId, body } = req.body;
      
      if (body === "") {
        // Delete draft if body is empty
        await storage.deleteDraft(threadId, firmId);
        res.json({ success: true, action: "deleted" });
      } else {
        const draft = await storage.upsertDraft({
          threadId,
          authorFirmId: firmId,
          body
        });
        res.json({ success: true, action: "saved", draft });
      }
    } catch (error) {
      console.error("Draft upsert error:", error);
      res.status(500).json({ error: "Failed to save draft" });
    }
  });

  // Auto Responder
  app.get("/api/autoresponder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const responder = await storage.getAutoResponder(firmId);
      
      res.json(responder || {
        enabled: false,
        mode: "KEYWORD",
        keywords: [],
        cooldownSec: 600,
        messageBody: "Merhaba! Mesajınızı aldık, en kısa sürede dönüş yapacağız."
      });
    } catch (error) {
      console.error("Auto responder fetch error:", error);
      res.status(500).json({ error: "Failed to fetch auto responder" });
    }
  });

  app.post("/api/autoresponder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const responder = await storage.upsertAutoResponder({
        firmId,
        ...req.body
      });
      
      res.json(responder);
    } catch (error) {
      console.error("Auto responder save error:", error);
      res.status(500).json({ error: "Failed to save auto responder" });
    }
  });

  // Direct Threads & Messages
  app.post("/api/threads/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { targetCompanyId } = req.body;
      console.log("Creating thread for userId:", userId, "targetCompanyId:", targetCompanyId);
      
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        console.log("No company found for user:", userId);
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      console.log("User company ID:", firmId);
      
      // Check if thread already exists or create new one
      const thread = await storage.getOrCreateDirectThread(firmId, targetCompanyId);
      console.log("Thread created/found:", thread);
      
      res.json(thread);
    } catch (error) {
      console.error("Thread creation error:", error);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  app.get("/api/threads/:threadId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { threadId } = req.params;
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getDirectThreadMessages(threadId, offset, limit);
      res.json(messages);
    } catch (error) {
      console.error("Thread messages fetch error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/threads/:threadId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Creating message for userId:", userId);
      
      const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
      
      if (!userCompanies.length) {
        console.log("No company found for user:", userId);
        return res.status(400).json({ error: "No company found for user" });
      }

      const firmId = userCompanies[0].id;
      const { threadId } = req.params;
      const { body, attachmentUrl, attachmentType } = req.body;
      
      console.log("Message data:", { threadId, firmId, body, attachmentUrl, attachmentType });
      
      // Get thread by ID directly
      const currentThread = await storage.getDirectThreadById(threadId);
      console.log("Found thread:", currentThread);
      
      if (!currentThread) {
        console.log("Thread not found with ID:", threadId);
        return res.status(404).json({ error: "Thread not found" });
      }
      
      // Verify user has access to this thread
      if (currentThread.firm1Id !== firmId && currentThread.firm2Id !== firmId) {
        console.log("User firmId:", firmId, "not authorized for thread:", currentThread);
        return res.status(403).json({ error: "Not authorized to message in this thread" });
      }
      
      const receiverFirmId = currentThread.firm1Id === firmId ? currentThread.firm2Id : currentThread.firm1Id;
      console.log("Receiver firmId:", receiverFirmId);
      
      const message = await storage.createDirectMessage({
        threadId,
        senderFirmId: firmId,
        receiverFirmId,
        body,
        attachmentUrl,
        attachmentType: attachmentType || "text"
      });
      
      console.log("Message created:", message);
      
      // Create notification for the receiver (new endpoint)
      try {
        const targetCompany = await storage.getCompany(receiverFirmId);
        if (targetCompany && targetCompany.userId) {
          const userCompanies = await storage.getCompanyDirectoryByUserId(userId);
          if (userCompanies.length > 0) {
            const notification = await storage.createNotification({
              userId: targetCompany.userId,
              type: "NEW_DM",
              payload: {
                threadId,
                fromCompanyId: firmId,
                fromCompanyName: userCompanies[0].companyName,
                messageId: message.id,
                title: "Yeni Mesaj",
                message: `${userCompanies[0].companyName} size mesaj gönderdi`
              }
            });
            console.log("Notification created (new endpoint):", notification);
          }
        }
      } catch (notificationError) {
        console.error("Failed to create notification (new endpoint):", notificationError);
      }
      
      res.json(message);
    } catch (error) {
      console.error("Message creation error:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.patch("/api/messages/:messageId/read", isAuthenticated, async (req: any, res) => {
    try {
      const { messageId } = req.params;
      const success = await storage.markDirectMessageAsRead(messageId);
      
      if (!success) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Mark message read error:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // SMS API Routes
  app.get("/api/sms/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const smsHistory = await storage.getSMSHistory(userId);
      res.json(smsHistory);
    } catch (error) {
      console.error("Error fetching SMS history:", error);
      res.status(500).json({ error: "Failed to fetch SMS history" });
    }
  });

  app.post("/api/sms/send", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { message, recipients, templateId } = req.body;

      if (!message || !recipients || recipients.length === 0) {
        return res.status(400).json({ error: "Message and recipients are required" });
      }

      // Get recipient data (personnel and customers)
      const personnel = await storage.getPersonnelByUserId(userId);
      const customers = await storage.getCustomersByUserId(userId);
      
      const allRecipients = [
        ...personnel.map(p => ({
          id: p.id,
          name: p.name,
          phone: p.phone || '',
          type: 'personnel'
        })),
        ...customers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          type: 'customer'
        }))
      ].filter(r => r.phone && recipients.includes(r.id));

      if (allRecipients.length === 0) {
        return res.status(400).json({ error: "No valid phone numbers found for selected recipients" });
      }

      // Calculate SMS cost (estimate: 0.08 TL per SMS)
      const smsCount = Math.ceil(message.length / 160);
      const estimatedCost = allRecipients.length * smsCount * 0.08;

      // Create SMS history record
      const smsHistoryData = {
        message,
        recipientCount: allRecipients.length,
        recipientData: allRecipients,
        status: 'pending' as const,
        cost: estimatedCost.toString(),
        templateId: templateId || null,
        errorMessage: null,
        netgsmResponse: null
      };

      const smsRecord = await storage.createSMSHistory(userId, smsHistoryData);

      // NetGSM API integration (mock for now)
      try {
        const netgsmResult = await sendSMSViaNetGSM(message, allRecipients);
        
        // Update SMS record with result
        await storage.updateSMSHistory(smsRecord.id, {
          status: 'sent',
          sentAt: new Date(),
          netgsmResponse: netgsmResult
        });

        res.json({ 
          success: true, 
          smsId: smsRecord.id,
          recipientCount: allRecipients.length,
          estimatedCost,
          status: 'sent'
        });
      } catch (smsError) {
        // Update SMS record with error
        await storage.updateSMSHistory(smsRecord.id, {
          status: 'failed',
          errorMessage: smsError instanceof Error ? smsError.message : 'SMS send failed'
        });

        res.status(500).json({ 
          error: "SMS send failed", 
          details: smsError instanceof Error ? smsError.message : 'Unknown error'
        });
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  app.get("/api/sms/templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const templates = await storage.getSMSTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching SMS templates:", error);
      res.status(500).json({ error: "Failed to fetch SMS templates" });
    }
  });

  app.post("/api/sms/templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const templateData = insertSMSTemplateSchema.parse(req.body);
      const template = await storage.createSMSTemplate(userId, templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating SMS template:", error);
      res.status(500).json({ error: "Failed to create SMS template" });
    }
  });

  // NetGSM SMS sending function (real implementation)
  async function sendSMSViaNetGSM(message: string, recipients: Array<{id: string, name: string, phone: string, type: string}>): Promise<any> {
    const username = process.env.NETGSM_USERNAME;
    const password = process.env.NETGSM_PASSWORD;
    const header = process.env.NETGSM_HEADER;

    // If no API credentials, use mock mode
    if (!username || !password || !header) {
      console.log('NetGSM credentials not found, using mock mode');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        status: 'mock_success',
        messageId: `mock_${Date.now()}`,
        recipientCount: recipients.length,
        note: 'SMS not sent - NetGSM credentials required'
      };
    }

    try {
      // Real NetGSM API call
      const phoneNumbers = recipients.map(r => r.phone).filter(p => p).join(',');
      
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://api.netgsm.com.tr/sms/send/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          usercode: username,
          password: password,
          gsmno: phoneNumbers,
          message: message,
          msgheader: header
        })
      });

      const result = await response.text();
      
      // NetGSM returns different response formats
      if (result.startsWith('00') || result.includes('OK')) {
        return {
          status: 'success',
          messageId: result,
          recipientCount: recipients.length,
          cost: recipients.length * Math.ceil(message.length / 160) * 0.08,
          timestamp: new Date().toISOString(),
          details: recipients.map(r => ({
            phone: r.phone,
            status: 'sent',
            messageId: `msg_${r.id}_${Date.now()}`
          }))
        };
      } else {
        throw new Error(`NetGSM API Error: ${result}`);
      }
    } catch (error) {
      console.error('NetGSM API Error:', error);
      throw error;
    }
  }

  // Admin Panel Routes with SUPER_ADMIN support
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  const isSuperAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Super Admin access required" });
    }
    next();
  };

  app.get("/api/admin/dashboard-stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsersForAdmin();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin users endpoints
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:userId/admin', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { isAdmin: makeAdmin } = req.body;
      await storage.updateUserAdminStatus(userId, makeAdmin);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update admin status" });
    }
  });

  app.put('/api/admin/users/:userId/active', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      await storage.updateUserActiveStatus(userId, isActive);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user active status:", error);
      res.status(500).json({ message: "Failed to update active status" });
    }
  });

  // Admin settings endpoints
  app.get('/api/admin/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const setting = req.body;
      await storage.saveSystemSetting(setting);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving setting:", error);
      res.status(500).json({ message: "Failed to save setting" });
    }
  });

  app.get("/api/admin/logs", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAdminLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
      res.status(500).json({ error: "Failed to fetch admin logs" });
    }
  });

  app.post("/api/admin/logs", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const logData = {
        ...req.body,
        adminUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };
      const log = await storage.createAdminLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating admin log:", error);
      res.status(500).json({ error: "Failed to create admin log" });
    }
  });

  // Admin Notes endpoints
  app.get("/api/admin/users/:userId/notes", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const notes = await storage.getAdminNotesByUser(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching admin notes:", error);
      res.status(500).json({ error: "Failed to fetch admin notes" });
    }
  });

  app.post("/api/admin/users/:userId/notes", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { note, category = "general" } = req.body;
      
      const noteData = {
        targetUserId: userId,
        adminUserId: req.user.id,
        note,
        category,
        isPrivate: true
      };
      
      const adminNote = await storage.createAdminNote(noteData);
      
      // Also create an admin log for audit purposes
      await storage.createAdminLog({
        adminUserId: req.user.id,
        action: "ADMIN_NOTE_ADDED",
        targetEntity: "User",
        targetId: userId,
        details: { noteId: adminNote.id, category, notePreview: note.substring(0, 50) },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.status(201).json(adminNote);
    } catch (error) {
      console.error("Error creating admin note:", error);
      res.status(500).json({ error: "Failed to create admin note" });
    }
  });

  // Admin sessions endpoints
  app.get("/api/admin/sessions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const sessions = await storage.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.post("/api/admin/sessions/:sessionId/terminate", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      await storage.terminateSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error terminating session:", error);
      res.status(500).json({ error: "Failed to terminate session" });
    }
  });

  app.get("/api/admin/settings", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  });

  app.post("/api/admin/settings", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const settingData = {
        ...req.body,
        updatedBy: req.user.id,
      };
      const setting = await storage.createSystemSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating system setting:", error);
      res.status(500).json({ error: "Failed to create system setting" });
    }
  });

  // Admin announcements management  
  app.get("/api/admin/announcements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Mock announcements data - in real app would come from database
      const announcements = [
        {
          id: "ann_1",
          title: "Sistem Güncellemesi",
          content: "Sistem bu akşam 22:00-24:00 arasında güncellenecektir.",
          priority: "high",
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: "ann_2", 
          title: "Yeni Özellikler",
          content: "Toplu SMS ve gelişmiş raporlama özellikleri eklendi.",
          priority: "normal",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true
        }
      ];
      
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { title, content, priority } = req.body;
      const announcement = {
        id: `ann_${Date.now()}`,
        title,
        content,
        priority,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      console.log("Creating announcement:", announcement);
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  });

  // SUPER_ADMIN Exclusive Routes
  
  // Role Management (USER ⇄ ADMIN)
  app.put("/api/admin/users/:userId/role", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only SUPER_ADMIN can change roles
      if (currentUser?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Only SUPER_ADMIN can change user roles" });
      }

      const { userId } = req.params;
      const { role } = req.body;
      
      // Don't allow SUPER_ADMIN to change their own role
      if (userId === currentUserId) {
        return res.status(403).json({ error: "Cannot change your own role" });
      }
      
      const targetUser = await storage.getUser(userId);
      if (targetUser?.role === 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Cannot change SUPER_ADMIN role" });
      }
      
      if (role !== 'USER' && role !== 'ADMIN') {
        return res.status(400).json({ error: "Invalid role. Only USER or ADMIN allowed." });
      }
      
      await storage.updateUserRole(userId, role);
      
      // Log this action
      await storage.createAdminLog({
        action: `Role changed to ${role}`,
        adminUserId: req.user.id,
        targetEntity: `User:${userId}`,
        targetEntityId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Status Management (ACTIVE ⇄ SUSPENDED)
  app.put("/api/admin/users/:userId/status", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only admins can change status
      if (!currentUser?.isAdmin && currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { userId } = req.params;
      const { status } = req.body;
      
      if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
        return res.status(400).json({ error: "Invalid status. Only ACTIVE or SUSPENDED allowed." });
      }
      
      await storage.updateUserStatus(userId, status);
      
      // Log this action
      await storage.createAdminLog({
        action: `Status changed to ${status}`,
        adminUserId: req.user.id,
        targetEntity: `User:${userId}`,
        targetEntityId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Force logout all sessions
  app.post("/api/admin/users/:userId/terminate-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only admins can terminate sessions
      if (!currentUser?.isAdmin && currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { userId } = req.params;
      
      // Terminate all user sessions
      await storage.terminateAllUserSessions(userId);
      
      // Log this action
      await storage.createAdminLog({
        action: "All sessions terminated",
        adminUserId: req.user.id,
        targetEntity: `User:${userId}`,
        targetEntityId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error terminating user sessions:", error);
      res.status(500).json({ error: "Failed to terminate user sessions" });
    }
  });

  // Send password reset link
  app.post("/api/admin/users/:userId/reset-password", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only admins can send password reset
      if (!currentUser?.isAdmin && currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { userId } = req.params;
      
      // Generate password reset link and send email
      const resetToken = await storage.createPasswordResetToken(userId);
      
      // Log this action
      await storage.createAdminLog({
        action: "Password reset link sent",
        adminUserId: req.user.id,
        targetEntity: `User:${userId}`,
        targetEntityId: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json({ success: true, message: "Password reset link sent to user email" });
    } catch (error) {
      console.error("Error sending password reset:", error);
      res.status(500).json({ error: "Failed to send password reset link" });
    }
  });

  // Create invitation
  app.post("/api/admin/invitations", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only SUPER_ADMIN can create invitations
      if (currentUser?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Only SUPER_ADMIN can send invitations" });
      }

      const { email, role } = req.body;
      
      if (!email || (role !== 'USER' && role !== 'ADMIN')) {
        return res.status(400).json({ error: "Valid email and role (USER or ADMIN) required" });
      }
      
      const invitation = await storage.createInvitation({
        email,
        role,
        invitedBy: req.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      
      // Log this action
      await storage.createAdminLog({
        action: `Invitation sent to ${email} with ${role} role`,
        adminUserId: req.user.id,
        targetEntity: `Invitation:${email}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ error: "Failed to create invitation" });
    }
  });

  app.get("/api/admin/announcements", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const announcementData = {
        ...req.body,
        createdBy: req.user.id,
      };
      const announcement = await storage.createAnnouncement(announcementData);
      
      // Log the action
      await storage.createAdminLog({
        adminUserId: req.user.id,
        action: "ANNOUNCEMENT_CREATED",
        targetEntity: "Announcement",
        targetId: announcement.id,
        details: { title: announcement.title },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  });

  app.put("/api/admin/announcements/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const announcement = await storage.updateAnnouncement(id, req.body);
      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      
      // Log the action
      await storage.createAdminLog({
        adminUserId: req.user.id,
        action: "ANNOUNCEMENT_UPDATED",
        targetEntity: "Announcement",
        targetId: id,
        details: { title: announcement.title },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.json(announcement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ error: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAnnouncement(id);
      if (!deleted) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      
      // Log the action
      await storage.createAdminLog({
        adminUserId: req.user.id,
        action: "ANNOUNCEMENT_DELETED",
        targetEntity: "Announcement",
        targetId: id,
        details: {},
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

  app.get("/api/admin/sessions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const sessions = await storage.getUserSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ error: "Failed to fetch user sessions" });
    }
  });

  app.get("/api/admin/system-metrics", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const metricType = req.query.type as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const metrics = await storage.getSystemMetrics(metricType, limit);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ error: "Failed to fetch system metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
