# Railway Deployment Guide

## Prerequisites
- [Railway](https://railway.app) account
- GitHub repository with your code
- This project pushed to GitHub

## Step 1: Prepare Repository
1. Commit all changes:
   ```bash
   git add .
   git commit -m "Railway deployment ready"
   git push origin main
   ```

## Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

## Step 3: Add PostgreSQL Database
1. In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically generate `DATABASE_URL`
3. No manual database configuration needed!

## Step 4: Configure Environment Variables
Go to your project → Settings → Variables and add:

### Required Variables:
```
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
NODE_ENV=production
```

### Optional Variables:
```
CORS_ORIGIN=https://your-domain.com
```

### Auto-Generated (by Railway):
- `DATABASE_URL` - Automatically provided by PostgreSQL service
- `PORT` - Automatically set by Railway
- `RAILWAY_*` - Railway system variables

## Step 5: Deploy
1. Railway will automatically build and deploy
2. Monitor logs in Railway dashboard
3. Your app will be available at `https://your-project.railway.app`

## Build Process
Railway will:
1. Install dependencies (`npm install`)
2. Run type check (`npm run check`)
3. Build project (`npm run build`)
4. Start server (`npm start`)

## Database Migration
Database tables will be created automatically when the app starts.
Drizzle ORM will handle schema synchronization.

## Monitoring
- Check Railway dashboard for logs
- Monitor database connections
- Use Railway metrics for performance

## Troubleshooting
- Check Railway logs if deployment fails
- Verify environment variables are set
- Ensure PostgreSQL service is running
- Check build logs for TypeScript errors

## Local Production Test
Test production build locally:
```bash
npm run build
npm start
```

## Support
- Railway docs: https://docs.railway.app
- Railway community: https://railway.app/discord