import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPersonnelSchema, 
  insertProjectSchema, 
  insertTimesheetSchema, 
  insertTransactionSchema,
  insertNoteSchema,
  insertContractorSchema,
  insertCustomerSchema,
  insertCustomerTaskSchema,
  insertCustomerPaymentSchema,
  insertContractorTaskSchema,
  insertContractorPaymentSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertReportSchema,
  insertPersonnelPaymentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Personnel routes
  app.get("/api/personnel", async (req, res) => {
    try {
      const personnel = await storage.getPersonnel();
      res.json(personnel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personnel" });
    }
  });

  app.post("/api/personnel", async (req, res) => {
    try {
      console.log("Personnel request body:", req.body);
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        startDate: new Date(req.body.startDate)
      };
      const validatedData = insertPersonnelSchema.parse(processedBody);
      const personnel = await storage.createPersonnel(validatedData);
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
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      console.log("Project request body:", req.body);
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        startDate: new Date(req.body.startDate)
      };
      const validatedData = insertProjectSchema.parse(processedBody);
      const project = await storage.createProject(validatedData);
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
  app.get("/api/timesheets", async (req, res) => {
    try {
      const timesheets = await storage.getTimesheets();
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

  app.post("/api/timesheets", async (req, res) => {
    try {
      console.log("Timesheet request body:", req.body);
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        date: new Date(req.body.date)
      };
      const validatedData = insertTimesheetSchema.parse(processedBody);
      const timesheet = await storage.createTimesheet(validatedData);
      res.status(201).json(timesheet);
    } catch (error) {
      console.error("Timesheet validation error:", error);
      res.status(400).json({ message: "Invalid timesheet data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      console.log("Transaction request body:", req.body);
      // Convert string date to Date object
      const processedBody = {
        ...req.body,
        date: new Date(req.body.date)
      };
      const validatedData = insertTransactionSchema.parse(processedBody);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction validation error:", error);
      res.status(400).json({ message: "Invalid transaction data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
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
  app.get("/api/contractors", async (req, res) => {
    try {
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
  app.get("/api/financial-summary", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      const customerTasks = await storage.getCustomerTasks();
      const customerPayments = await storage.getCustomerPayments();
      
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
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
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
  app.get("/api/customer-tasks", async (req, res) => {
    try {
      const tasks = await storage.getCustomerTasks();
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
  app.get("/api/customer-payments", async (req, res) => {
    try {
      const payments = await storage.getCustomerPayments();
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

  app.post("/api/customer-payments", async (req, res) => {
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
        category: "Müşteri Ödemesi"
      };
      
      // Add the income transaction to the system
      await storage.createTransaction(incomeTransaction);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(400).json({ message: "Invalid payment data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/customer-payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomerPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment" });
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
      const contractor = await storage.getProject(validatedData.contractorId);
      const contractorName = contractor?.name || "Bilinmeyen Yüklenici";
      
      // Create a corresponding expense transaction
      const expenseTransaction = {
        type: "expense" as const,
        amount: validatedData.amount,
        description: `${contractorName} - Yüklenici Ödemesi: ${validatedData.description || validatedData.paymentMethod}`,
        date: validatedData.paymentDate,
        category: "Yüklenici Ödemesi"
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

  app.delete("/api/contractor-payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteContractorPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Contractor payment not found" });
      }
      res.status(204).send();
    } catch (error) {
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
      const deleted = await storage.deletePersonnelPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Personnel payment not found" });
      }
      res.status(204).send();
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
