import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Simple in-memory auth store (resets on server restart)
const authenticatedUsers = new Map<string, any>();

export async function setupAuth(app: Express) {
  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Tüm alanlar gereklidir" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Bu email adresi zaten kullanılıyor" });
      }
      
      // Create new user
      const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        password, // In production, hash this password
        firstName,
        lastName,
        profileImageUrl: null,
      };

      const user = await storage.upsertUser(newUser);
      
      // Generate session
      const sessionId = Math.random().toString(36).substring(2, 15);
      authenticatedUsers.set(sessionId, user);
      
      console.log("User registered:", user.email, "Session:", sessionId);
      
      res.json({ success: true, user, sessionId });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Kayıt başarısız" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, isDemo } = req.body;
      
      let user;
      
      if (isDemo) {
        // Demo user login
        const demoUser = {
          id: "demo-user-1",
          email: "demo@puantajpro.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
        };
        user = await storage.upsertUser(demoUser);
      } else {
        // Regular user login
        if (!email || !password) {
          return res.status(400).json({ message: "Email ve şifre gereklidir" });
        }
        
        user = await storage.getUserByEmail(email);
        if (!user || user.password !== password) {
          return res.status(401).json({ message: "Geçersiz email veya şifre" });
        }
      }
      
      // Generate session
      const sessionId = Math.random().toString(36).substring(2, 15);
      authenticatedUsers.set(sessionId, user);
      
      console.log("User logged in:", user.email, "Session:", sessionId);
      console.log("Active sessions:", authenticatedUsers.size);
      
      res.json({ success: true, user, sessionId });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Giriş başarısız" });
    }
  });

  // Check auth endpoint
  app.get("/api/auth/user", (req, res) => {
    // Try to get session ID from Authorization header
    const authHeader = req.headers.authorization;
    const sessionId = authHeader?.replace('Bearer ', '') || req.cookies.session;
    
    console.log("Auth check - Session ID:", sessionId);
    console.log("Auth check - Available sessions:", Array.from(authenticatedUsers.keys()));
    
    if (!sessionId) {
      console.log("No session ID found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = authenticatedUsers.get(sessionId);
    
    if (!user) {
      console.log("Session not found in memory");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Auth successful for user:", user.id);
    res.json(user);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.cookies.session;
    
    if (sessionId) {
      authenticatedUsers.delete(sessionId);
      console.log("Session removed:", sessionId);
    }
    
    res.clearCookie('session');
    res.json({ success: true });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const sessionId = authHeader?.replace('Bearer ', '') || req.cookies.session;
  
  if (!sessionId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = authenticatedUsers.get(sessionId);
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  (req as any).user = user;
  next();
};