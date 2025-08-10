import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "puantaj-secret-key";

export async function setupSimpleAuth(app: Express) {
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
      
      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log("JWT token created for user:", user.id);
      
      // Set HTTP-only cookie with token
      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: false, // false for development
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('auth-token');
    res.json({ success: true });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies['auth-token'];
    
    if (!token) {
      console.log("No auth token found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      console.log("User not found for token");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("JWT auth successful for user:", user.id);
    
    // Add user to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.log("JWT verification failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};