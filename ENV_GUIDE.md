# Environment Files Guide

This project uses different environment files for different environments:

## Files

- `.env.example` - Template file with all available environment variables
- `.env.development` - Development environment configuration
- `.env.production` - Production environment configuration (template)
- `.env` - Your local environment file (git-ignored)

## Setup

### Local Development

1. Copy `.env.development` to `.env`:
   ```bash
   cp .env.development .env
   ```

2. Update database credentials and other settings as needed.

### Production (Railway)

1. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `SESSION_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `COOKIE_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `CORS_ORIGIN` - Your production domain(s)

2. Railway automatically provides `DATABASE_URL` for PostgreSQL.

## CORS Configuration

The `CORS_ORIGIN` environment variable accepts:

- **Single origin**: `https://yourdomain.com`
- **Multiple origins**: `https://yourdomain.com,https://app.yourdomain.com`
- **Wildcard patterns**: `https://*.railway.app,https://yourdomain.com`

## Security Notes

- Never commit `.env` files to git
- Use strong, randomly generated secrets in production
- Always set `NODE_ENV=production` in production
- Restrict CORS origins to your actual domains
