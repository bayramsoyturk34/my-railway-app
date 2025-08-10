import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Simple in-memory auth store (resets on server restart)
const authenticatedUsers = new Map<string, any>();

export async function setupAuth(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Create demo user
      const demoUser = {
        id: "demo-user-1",
        email: "demo@puantajpro.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
      };

      // Store user in database
      const user = await storage.upsertUser(demoUser);
      
      // Generate simple session ID
      const sessionId = Math.random().toString(36).substring(2, 15);
      
      // Store in memory
      authenticatedUsers.set(sessionId, user);
      
      console.log("User logged in:", user.id, "Session:", sessionId);
      console.log("Active sessions:", authenticatedUsers.size);
      
      // Set cookie with explicit domain
      res.cookie('session', sessionId, {
        httpOnly: false, // Allow JS access for debugging
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
        domain: undefined // Let browser determine domain
      });
      
      console.log("Cookie set with session ID:", sessionId);
      
      res.json({ success: true, user, sessionId });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Check auth endpoint
  app.get("/api/auth/user", (req, res) => {
    console.log("All cookies:", req.cookies);
    const sessionId = req.cookies.session;
    
    console.log("Auth check - Session ID from cookie:", sessionId);
    console.log("Auth check - Available sessions:", Array.from(authenticatedUsers.keys()));
    
    if (!sessionId) {
      console.log("No session cookie");
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
  const sessionId = req.cookies.session;
  
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