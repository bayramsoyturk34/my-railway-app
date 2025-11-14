import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { sessions } from "@shared/schema";
import { eq, and, lt, gt } from "drizzle-orm";
import multer from "multer";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// JWT helper functions
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "30d",
  });
};

const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as { userId: string };
  } catch {
    return null;
  }
};

// Hash password helper
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Database-based session management
const createSession = async (userId: string): Promise<string> => {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await db.insert(sessions).values({
    sid: sessionId,
    sess: { userId, expires: expires.toISOString() },
    expire: expires
  });
  
  return sessionId;
};

export const getSession = async (sessionId: string): Promise<any | null> => {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.sid, sessionId), gt(sessions.expire, new Date())));
    
    if (!session) return null;
    
    const sessionData = session.sess as any;
    const user = sessionData.userId ? await storage.getUser(sessionData.userId) : null;
    
    // Check if user is suspended and invalidate session
    if (user && user.status === 'SUSPENDED') {
      await deleteSession(sessionId);
      console.log("Session invalidated for suspended user:", user.email);
      return null;
    }
    
    return user;
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
      const { email, password, firstName, lastName, companyName, phone, city, industry } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Tüm alanlar gereklidir" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Bu email adresi zaten kullanılıyor" });
      }
      
      // Create new user with DEMO subscription
      const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        password: hashPassword(password), // Hash the password
        firstName,
        lastName,
        profileImageUrl: null,
        subscriptionType: "DEMO",
        subscriptionStatus: "ACTIVE",
      };

      const user = await storage.upsertUser(newUser);
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      // Set HTTP-only cookie for JWT token
      res.cookie('auth_token', token, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        sameSite: 'lax'
      });
      
      console.log("User registered:", user.email);
      
      res.json({ 
        success: true, 
        user: { ...user, password: undefined }, 
        token,
        sessionId: token // Add sessionId for client compatibility
      });
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
        // Demo user login - fast and simple with DEMO subscription
        const demoUser = {
          id: "demo-user-1",
          email: "demo@puantajpro.com",
          firstName: "Demo",
          lastName: "User",
          password: hashPassword("demo123"), // Default demo password
          profileImageUrl: null,
          subscriptionType: "DEMO",
          subscriptionStatus: "ACTIVE",
        };
        user = await storage.upsertUser(demoUser);
      } else {
        // Regular user login
        if (!email || !password) {
          return res.status(400).json({ message: "Email ve şifre gereklidir" });
        }
        
        user = await storage.getUserByEmail(email);
        if (!user || user.password !== hashPassword(password)) {
          return res.status(401).json({ message: "Geçersiz email veya şifre" });
        }
        
        // Check if user is suspended
        if (user.status === 'SUSPENDED') {
          return res.status(403).json({ message: "Hesabınız askıya alınmıştır. Lütfen sistem yöneticisiyle iletişime geçin." });
        }
      }
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      // Set HTTP-only cookie for JWT token
      res.cookie('auth_token', token, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        sameSite: 'lax'
      });
      
      console.log("🔐 Login successful for:", user.email);
      
      res.json({ 
        success: true, 
        user: { ...user, password: undefined }, 
        token,
        sessionId: token // Add sessionId for client compatibility
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Giriş başarısız" });
    }
  });

  // Check auth endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Try to get token from Authorization header or cookie
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '') || req.cookies['auth_token'];
      
      console.log("🔐 Auth debug - Token present:", !!token);
      
      if (!token) {
        console.log("🔐 Auth debug - No token found");
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify JWT token
      const decoded = verifyToken(token);
      if (!decoded) {
        console.log("🔐 Auth debug - Invalid token");
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get user from database
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        console.log("🔐 Auth debug - User not found for token");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log("🔐 Auth debug - User found:", !!user);
      console.log("🔐 Auth debug - Authentication successful for user:", user.id);

      // Auto-create company profile if user doesn't have one
      try {
        const userCompanies = await storage.getCompanyDirectoryByUserId(user.id);
        if (userCompanies.length === 0) {
          // Create default company profile for user
          const defaultCompany = {
            companyName: `${user.firstName} ${user.lastName}`,
            contactPerson: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: "",
            address: "",
            description: "Otomatik oluşturulan firma profili",
            sector: "",
            website: "",
            hasPROAccess: false,
            isVerified: false,
            isBlocked: false,
            isActive: true
          };
          
          await storage.createCompany(defaultCompany, user.id);

        }
      } catch (error) {
        console.error("Error auto-creating company profile:", error);
        // Don't fail authentication if company creation fails
      }


      res.json(user);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      let sessionId = req.headers.authorization?.replace('Bearer ', '') || req.cookies['session'];
      
      // Handle signed cookies format: s:sessionId.signature
      if (sessionId && sessionId.startsWith('s:')) {
        sessionId = sessionId.substring(2).split('.')[0];
      }
      

      
      if (sessionId) {
        await deleteSession(sessionId);

      }
      
      // Clear all cookies
      res.clearCookie('session', { path: '/' });
      res.clearCookie('connect.sid', { path: '/' });
      
      // Add cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      

      res.json({ success: true, message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.json({ success: true }); // Still return success even if cleanup fails
    }
  });

  // Update user profile
  app.put("/api/auth/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { firstName, lastName, email } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        email,
        updatedAt: new Date()
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password
  app.post("/api/auth/change-password", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: "Mevcut şifre yanlış" });
      }
      
      // Update password
      await storage.updateUser(userId, {
        password: newPassword,
        updatedAt: new Date()
      });
      
      res.json({ message: "Şifre başarıyla değiştirildi" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Profile image upload with multer middleware
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      console.log('File upload - mimetype:', file.mimetype);
      console.log('File upload - originalname:', file.originalname);
      
      // Accept common image formats
      if (file.mimetype === 'image/jpeg' || 
          file.mimetype === 'image/jpg' || 
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/gif' ||
          file.mimetype === 'image/webp') {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  app.post("/api/auth/upload-profile-image", isAuthenticated, upload.single('profileImage'), async (req, res) => {
    try {
      const userId = (req as any).user.id;
      
      if (!req.file) {
        return res.status(400).json({ message: "Dosya seçilmedi" });
      }
      
      // Convert image to base64 data URL for storage
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      console.log('Image converted to base64, length:', base64Image.length);
      
      // Update user's profile image URL in database
      await storage.updateUser(userId, {
        profileImageUrl: base64Image,
        updatedAt: new Date()
      });
      
      res.json({ 
        success: true, 
        profileImageUrl: base64Image,
        message: "Profil fotoğrafı başarıyla güncellendi" 
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      if (error instanceof Error && error.message.includes('formatları')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Fotoğraf yüklenirken hata oluştu" });
      }
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || req.cookies['auth_token'];
    
    if (!token) {
      console.log("🔐 Auth debug - No token found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("🔐 Auth debug - Invalid token");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user from database
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      console.log("🔐 Auth debug - User not found for token");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user is suspended
    if (user.status === 'SUSPENDED') {
      console.log("🔐 Auth debug - User is suspended");
      return res.status(403).json({ message: "Account suspended" });
    }

    // Authentication successful
    console.log("🔐 Auth debug - Authentication successful for user:", user.id);
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};