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
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertReportSchema
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
      const projects = await storage.getProjects();
      const contractors = await storage.getContractors();

      const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const givenProjects = projects.filter(p => p.type === "given");
      const receivedProjects = projects.filter(p => p.type === "received");

      const summary = {
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        givenProjects: {
          total: givenProjects.reduce((sum, p) => sum + parseFloat(p.amount), 0),
          active: givenProjects.filter(p => p.status === "active").length,
          passive: givenProjects.filter(p => p.status === "passive").length,
        },
        receivedProjects: {
          total: receivedProjects.reduce((sum, p) => sum + parseFloat(p.amount), 0),
          active: receivedProjects.filter(p => p.status === "active").length,
          completed: receivedProjects.filter(p => p.status === "completed").length,
        },
        contractors: {
          total: contractors.reduce((sum, c) => sum + parseFloat(c.totalAmount), 0),
          active: contractors.filter(c => c.status === "active").length,
          completed: contractors.filter(c => c.status === "completed").length,
        }
      };

      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate financial summary" });
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

  // Analytics dashboard endpoint
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      const projects = await storage.getProjects();
      const personnel = await storage.getPersonnel();
      const timesheets = await storage.getTimesheets();

      // Generate mock data for charts (in real implementation, calculate from actual data)
      const monthlyRevenue = [
        { month: "Ocak", income: 45000, expenses: 32000 },
        { month: "Şubat", income: 52000, expenses: 38000 },
        { month: "Mart", income: 48000, expenses: 35000 },
        { month: "Nisan", income: 61000, expenses: 42000 },
        { month: "Mayıs", income: 55000, expenses: 40000 },
        { month: "Haziran", income: 58000, expenses: 41000 },
      ];

      const projectsByStatus = [
        { status: "Aktif", count: projects.filter(p => p.status === "active").length || 5 },
        { status: "Pasif", count: projects.filter(p => p.status === "passive").length || 2 },
        { status: "Tamamlandı", count: projects.filter(p => p.status === "completed").length || 8 },
      ];

      const personnelActivity = personnel.map(p => ({
        name: p.name.split(' ')[0],
        hours: Math.floor(Math.random() * 160) + 40 // Random hours between 40-200
      }));

      const dailyActivity = [
        { date: "01-08", timesheets: 5, transactions: 3 },
        { date: "02-08", timesheets: 7, transactions: 2 },
        { date: "03-08", timesheets: 4, transactions: 6 },
        { date: "04-08", timesheets: 8, transactions: 4 },
        { date: "05-08", timesheets: 6, transactions: 5 },
        { date: "06-08", timesheets: 9, transactions: 3 },
        { date: "07-08", timesheets: timesheets.length, transactions: transactions.length },
      ];

      const chartData = {
        monthlyRevenue,
        projectsByStatus,
        personnelActivity: personnelActivity.length > 0 ? personnelActivity : [
          { name: "Personel", hours: 0 }
        ],
        dailyActivity,
      };

      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
