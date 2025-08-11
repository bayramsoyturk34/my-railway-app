import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { sessions } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";

// Database-based session management
const createSession = async (userId: string): Promise<string> => {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await db.insert(sessions).values({
    sid: sessionId,
    sess: { userId, expires: expires.toISOString() },
    expire: expires
  });
  
  return sessionId;
};

const getSession = async (sessionId: string): Promise<any | null> => {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.sid, sessionId), lt(new Date(), sessions.expire)));
    
    if (!session) return null;
    
    const sessionData = session.sess as any;
    return sessionData.userId ? await storage.getUser(sessionData.userId) : null;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
};

const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await db.delete(sessions).where(eq(sessions.sid, sessionId));
  } catch (error) {
    console.error("Delete session error:", error);
  }
};

// Clean up expired sessions every hour
setInterval(async () => {
  try {
    const deletedCount = await db.delete(sessions).where(lt(sessions.expire, new Date()));
    console.log("Cleaned up expired sessions:", deletedCount);
  } catch (error) {
    console.error("Session cleanup error:", error);
  }
}, 60 * 60 * 1000);

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
      
      // Generate database session
      const sessionId = await createSession(user.id);
      
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
      
      // Generate database session
      const sessionId = await createSession(user.id);
      
      console.log("User logged in:", user.email, "Session:", sessionId);
      
      res.json({ success: true, user, sessionId });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Giriş başarısız" });
    }
  });

  // Check auth endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Try to get session ID from Authorization header
      const authHeader = req.headers.authorization;
      const sessionId = authHeader?.replace('Bearer ', '') || req.cookies.session;
      
      console.log("Auth check - Session ID:", sessionId);
      
      if (!sessionId) {
        console.log("No session ID found");
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await getSession(sessionId);
      
      if (!user) {
        console.log("Session not found or expired");
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("Auth successful for user:", user.id);
      res.json(user);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.cookies.session;
      
      if (sessionId) {
        await deleteSession(sessionId);
        console.log("Session removed from database:", sessionId);
      }
      
      res.clearCookie('session');
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.json({ success: true }); // Still return success even if cleanup fails
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionId = authHeader?.replace('Bearer ', '') || req.cookies.session;
    
    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getSession(sessionId);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};