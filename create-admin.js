// Local test script to create admin user
import crypto from 'crypto';

// Simple hash function (same as in server/auth.ts)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function createTestAdmin() {
  console.log('🔧 Creating test admin user script...');
  
  const testUser = {
    email: 'modacizimtasarim@gmail.com',
    firstName: 'Admin',
    lastName: 'User', 
    password: 'admin123', // Test password
    role: 'SUPER_ADMIN',
    isAdmin: true
  };

  const hashedPassword = hashPassword(testUser.password);
  
  console.log('📋 Test Admin User Details:');
  console.log('Email:', testUser.email);
  console.log('Password:', testUser.password);
  console.log('Password Hash:', hashedPassword);
  console.log('Role:', testUser.role);
  console.log('isAdmin:', testUser.isAdmin);

  // SQL to insert/update user
  const sql = `
-- Make user admin (PostgreSQL)
INSERT INTO users (
  id, email, password, "firstName", "lastName", role, "isAdmin", 
  "subscriptionType", "subscriptionStatus", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '${testUser.email}',
  '${hashedPassword}',
  '${testUser.firstName}',
  '${testUser.lastName}',
  '${testUser.role}',
  ${testUser.isAdmin},
  'PRO',
  'ACTIVE',
  NOW(),
  NOW()
) 
ON CONFLICT (email) 
DO UPDATE SET 
  role = EXCLUDED.role,
  "isAdmin" = EXCLUDED."isAdmin",
  "updatedAt" = NOW();
`;

  console.log('\n📝 SQL Query to execute in Railway PostgreSQL:');
  console.log('============================================');
  console.log(sql);
  console.log('============================================');
  
  console.log('\n🚀 How to execute:');
  console.log('1. Go to Railway Dashboard → PostgreSQL service');
  console.log('2. Click "Query" tab');
  console.log('3. Copy-paste the SQL above');
  console.log('4. Execute the query');
  console.log('5. User will become SUPER_ADMIN');
  
  console.log('\n✅ Login credentials after SQL execution:');
  console.log('Email:', testUser.email);
  console.log('Password:', testUser.password);
  console.log('Role: SUPER_ADMIN');
}

createTestAdmin();