import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax', // Important for cross-origin requests
      maxAge: sessionTtl,
    },
  });
}

export async function setupSimpleAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Simple login endpoint - for demo purposes
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Create a demo user for testing
      const demoUser = {
        id: "demo-user-1",
        email: "demo@puantajpro.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
      };

      // Store user in database
      const user = await storage.upsertUser(demoUser);
      
      // Set session
      (req.session as any).user = user;
      
      // Force session save
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log("Session saved for user:", user.id);
      console.log("Session ID:", req.sessionID);
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log("Auth check - Session ID:", req.sessionID);
  console.log("Auth check - Session data:", req.session);
  
  const sessionUser = (req.session as any)?.user;
  
  if (!sessionUser) {
    console.log("No session user found");
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("Session user found:", sessionUser.id);
  
  // Add user to request
  (req as any).user = sessionUser;
  next();
};