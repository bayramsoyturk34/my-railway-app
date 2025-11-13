import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Multiple paths to check for Railway deployment compatibility
  const possiblePaths = [
    path.resolve(process.cwd(), "client", "dist"), // Railway'de buraya build ediyor
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "build"),
  ];

  console.log("Checking for static files in these paths:");
  
  for (const distPath of possiblePaths) {
    console.log(`- ${distPath}: ${fs.existsSync(distPath) ? "EXISTS" : "NOT FOUND"}`);
    
    if (fs.existsSync(distPath)) {
      console.log(`✅ Using static files from: ${distPath}`);
      
      // Check for index.html
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        app.use(express.static(distPath));
        app.use("*", (_req, res) => {
          res.sendFile(indexPath);
        });
        return;
      } else {
        console.log(`❌ No index.html found in ${distPath}`);
      }
    }
  }

  // If no valid static directory found, create a minimal HTML response
  console.log("⚠️  No static files found, serving minimal HTML response");
  app.use("*", (_req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Application Starting</title>
        </head>
        <body>
          <h1>Application is starting...</h1>
          <p>Static files not found. Build may be in progress.</p>
          <script>
            setTimeout(() => window.location.reload(), 5000);
          </script>
        </body>
      </html>
    `);
  });
}
