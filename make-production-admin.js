// Production admin maker - works with Railway environment
import { Pool } from 'pg';
import crypto from 'crypto';

// Simple hash function (same as in server/auth.ts) 
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function makeProductionAdmin() {
  // Railway production DATABASE_URL'si genellikle şu format:
  // postgresql://postgres:password@host:port/railway
  
  // Railway'den alınan production DATABASE_URL
  const PRODUCTION_DB_URL = process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL;
  
  if (!PRODUCTION_DB_URL) {
    console.log('❌ Production DATABASE_URL not found!');
    console.log('📋 Set it with one of these methods:');
    console.log('   $env:DATABASE_URL="postgresql://user:pass@host:port/db"');
    console.log('   $env:RAILWAY_DATABASE_URL="postgresql://user:pass@host:port/db"');
    console.log('');
    console.log('🔍 Get URL from: https://railway.app → PostgreSQL service → Connect tab');
    return;
  }

  console.log('🔗 Connecting to production database...');
  console.log('📡 Host:', PRODUCTION_DB_URL.split('@')[1]?.split(':')[0] || 'hidden');

  const pool = new Pool({
    connectionString: PRODUCTION_DB_URL,
    ssl: { rejectUnauthorized: false } // Railway requires SSL
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');

    const targetEmail = 'modacizimtasarim@gmail.com';
    const adminPassword = 'admin123';
    const hashedPassword = hashPassword(adminPassword);

    console.log('🔍 Checking if user exists...');
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email, "firstName", "lastName", role, "isAdmin" FROM users WHERE email = $1',
      [targetEmail]
    );

    if (existingUser.rows.length === 0) {
      console.log('👤 User not found, creating new SUPER_ADMIN user...');
      
      // Create new user as SUPER_ADMIN
      const insertResult = await pool.query(`
        INSERT INTO users (
          id, email, password, "firstName", "lastName", role, "isAdmin", 
          "subscriptionType", "subscriptionStatus", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        ) RETURNING *
      `, [
        targetEmail,
        hashedPassword, 
        'Admin',
        'User',
        'SUPER_ADMIN',
        true,
        'PRO',
        'ACTIVE'
      ]);

      const newUser = insertResult.rows[0];
      console.log('🎉 New SUPER_ADMIN created!');
      console.log('📧 Email:', newUser.email);
      console.log('👤 Name:', newUser.firstName, newUser.lastName);
      console.log('🔑 Role:', newUser.role);

    } else {
      console.log('👤 User found, upgrading to SUPER_ADMIN...');
      const user = existingUser.rows[0];
      console.log('📊 Current role:', user.role || 'USER');

      // Update existing user to SUPER_ADMIN
      const updateResult = await pool.query(`
        UPDATE users 
        SET role = $1, "isAdmin" = $2, password = $3, "updatedAt" = NOW() 
        WHERE email = $4 
        RETURNING *
      `, ['SUPER_ADMIN', true, hashedPassword, targetEmail]);

      const updatedUser = updateResult.rows[0];
      console.log('🚀 User upgraded to SUPER_ADMIN!');
      console.log('📧 Email:', updatedUser.email);
      console.log('👤 Name:', updatedUser.firstName, updatedUser.lastName);
      console.log('🔑 New Role:', updatedUser.role);
    }

    console.log('\n✅ Success! Login credentials:');
    console.log('🌐 URL: https://web-production-02170.up.railway.app/login');
    console.log('📧 Email:', targetEmail);
    console.log('🔒 Password:', adminPassword);
    console.log('👑 Role: SUPER_ADMIN');
    console.log('\n🎯 Admin Panel: https://web-production-02170.up.railway.app/admin');

  } catch (error) {
    console.error('💥 Error:', error.message);
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('🔧 Connection refused - check DATABASE_URL format');
    } else if (error.message.includes('password authentication failed')) {
      console.log('🔐 Authentication failed - check DATABASE_URL credentials');
    } else if (error.message.includes('SSL')) {
      console.log('🔒 SSL error - Railway requires SSL connection');
    }
  } finally {
    await pool.end();
  }
}

makeProductionAdmin();