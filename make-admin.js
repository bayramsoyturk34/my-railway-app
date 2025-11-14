// Script to make a user SUPER_ADMIN
const { Pool } = require('pg');

// Railway production database URL (update this with actual URL from Railway dashboard)
const DATABASE_URL = process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Please set RAILWAY_DATABASE_URL environment variable.');
  console.log('📝 Get it from: Railway Dashboard → PostgreSQL service → Connect tab');
  process.exit(1);
}

async function makeUserAdmin(email) {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Searching for user:', email);
    
    // Find the user
    const userResult = await pool.query(
      'SELECT id, email, "firstName", "lastName", role, "isAdmin" FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User not found:', email);
      console.log('📋 Available users:');
      
      const allUsers = await pool.query('SELECT email, "firstName", "lastName", role FROM users ORDER BY "createdAt"');
      allUsers.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.firstName || 'N/A'} ${user.lastName || 'N/A'}) - Role: ${user.role || 'USER'}`);
      });
      
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('✅ User found:', user.email);
    console.log('📊 Current role:', user.role || 'USER');
    console.log('🔧 Current isAdmin:', user.isAdmin);

    // Update user to SUPER_ADMIN
    const updateResult = await pool.query(
      'UPDATE users SET role = $1, "isAdmin" = $2, "updatedAt" = NOW() WHERE email = $3 RETURNING *',
      ['SUPER_ADMIN', true, email]
    );

    if (updateResult.rows.length > 0) {
      const updatedUser = updateResult.rows[0];
      console.log('🎉 Successfully updated user to SUPER_ADMIN!');
      console.log('📧 Email:', updatedUser.email);
      console.log('👤 Name:', updatedUser.firstName, updatedUser.lastName);
      console.log('🔑 New Role:', updatedUser.role);
      console.log('⚡ Admin Status:', updatedUser.isAdmin);
      console.log('📅 Updated at:', updatedUser.updatedAt);
      
      console.log('\n🚀 User can now access admin panel at: /admin');
    } else {
      console.log('❌ Failed to update user');
    }

  } catch (error) {
    console.error('💥 Database error:', error.message);
    console.error('🔧 Connection string format should be: postgresql://user:pass@host:port/dbname');
  } finally {
    await pool.end();
  }
}

// Get email from command line argument
const targetEmail = process.argv[2];

if (!targetEmail) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js modacizimtasarim@gmail.com');
  process.exit(1);
}

makeUserAdmin(targetEmail);