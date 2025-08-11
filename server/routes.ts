import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { z } from "zod";
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
  insertPersonnelPaymentSchema
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
  app.get("/api/contractor-payments", async (req, res) => {
    try {
      const payments = await storage.getContractorPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor payments" });
    }
  });

  app.get("/api/contractor-payments/contractor/:contractorId", async (req, res) => {
    try {
      const { contractorId } = req.params;
      const payments = await storage.getContractorPaymentsByContractorId(contractorId);
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

  app.put("/api/contractor-payments/:id", async (req, res) => {
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
  app.get("/api/personnel-payments", async (req, res) => {
    try {
      const payments = await storage.getPersonnelPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personnel payments" });
    }
  });

  app.get("/api/personnel-payments/personnel/:personnelId", async (req, res) => {
    try {
      const { personnelId } = req.params;
      const payments = await storage.getPersonnelPaymentsByPersonnelId(personnelId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personnel payments" });
    }
  });

  app.post("/api/personnel-payments", async (req, res) => {
    try {
      console.log("Personnel payment request body:", req.body);
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        paymentDate: new Date(req.body.paymentDate)
      };
      const validatedData = insertPersonnelPaymentSchema.parse(processedBody);
      const payment = await storage.createPersonnelPayment(validatedData);
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

  // Contractor Payments routes
  app.get("/api/contractor-payments", async (req, res) => {
    try {
      const payments = await storage.getContractorPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor payments" });
    }
  });

  app.get("/api/contractor-payments/contractor/:contractorId", async (req, res) => {
    try {
      const { contractorId } = req.params;
      const payments = await storage.getContractorPaymentsByContractorId(contractorId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractor payments" });
    }
  });

  app.post("/api/contractor-payments", async (req, res) => {
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
      const userId = (req as any).user.id;
      const companies = await storage.getCompanyDirectoryByUserId(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching company directory:", error);
      res.status(500).json({ error: "Failed to fetch company directory" });
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

  // Messages routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:company1Id/:company2Id", async (req, res) => {
    try {
      console.log(`Fetching messages between ${req.params.company1Id} and ${req.params.company2Id}`);
      const messages = await storage.getMessagesByConversation(req.params.company1Id, req.params.company2Id);
      console.log(`Found ${messages.length} messages`);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ error: "Failed to fetch conversation messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const { insertMessageSchema } = await import("@shared/schema");
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
