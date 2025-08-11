import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Improved session management with cleanup and session validation
const authenticatedUsers = new Map<string, { user: any; expires: Date }>();

// Session cleanup every 30 minutes
setInterval(() => {
  const now = new Date();
  for (const [sessionId, sessionData] of authenticatedUsers.entries()) {
    if (sessionData.expires < now) {
      authenticatedUsers.delete(sessionId);
      console.log("Expired session removed:", sessionId);
    }
  }
}, 30 * 60 * 1000);

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
      
      // Generate session with expiration (7 days)
      const sessionId = Math.random().toString(36).substring(2, 15);
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      authenticatedUsers.set(sessionId, { user, expires });
      
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
      
      // Generate session with expiration (7 days)
      const sessionId = Math.random().toString(36).substring(2, 15);
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      authenticatedUsers.set(sessionId, { user, expires });
      
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

    const sessionData = authenticatedUsers.get(sessionId);
    
    if (!sessionData) {
      console.log("Session not found in memory");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if session has expired
    if (sessionData.expires < new Date()) {
      console.log("Session expired");
      authenticatedUsers.delete(sessionId);
      return res.status(401).json({ message: "Session expired" });
    }

    console.log("Auth successful for user:", sessionData.user.id);
    res.json(sessionData.user);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.cookies.session;
    
    if (sessionId) {
      authenticatedUsers.delete(sessionId);
      console.log("Session removed:", sessionId);
      console.log("Remaining sessions:", authenticatedUsers.size);
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

  const sessionData = authenticatedUsers.get(sessionId);
  
  if (!sessionData) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if session has expired
  if (sessionData.expires < new Date()) {
    authenticatedUsers.delete(sessionId);
    return res.status(401).json({ message: "Session expired" });
  }

  (req as any).user = sessionData.user;
  next();
};