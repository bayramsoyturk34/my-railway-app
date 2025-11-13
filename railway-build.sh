#!/bin/bash
# Railway build script

echo "Starting Railway build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Type check
echo "Running TypeScript checks..."
npm run check

# Build client
echo "Building client (React)..."
npm run build:client

# Build server
echo "Building server (Node.js)..."  
npm run build:server

# Verify build output
echo "Verifying build output..."
if [ -d "dist/public" ]; then
  echo "✅ Client build found at dist/public"
  ls -la dist/public/
else
  echo "❌ Client build missing!"
  exit 1
fi

if [ -f "dist/index.js" ]; then
  echo "✅ Server build found at dist/index.js"
else
  echo "❌ Server build missing!"
  exit 1
fi

echo "🚀 Railway build completed successfully!"