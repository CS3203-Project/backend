import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testAdminCreation() {
  try {
    console.log('🔄 Testing Admin Creation API...\n');

    // Check current admin count
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    console.log(`📊 Current admin count: ${adminCount}`);

    // Get all users to show current state
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n👥 Current Users:');
    if (users.length === 0) {
      console.log('   No users found');
    } else {
      users.forEach((user, index) => {
        const roleIcon = user.role === 'ADMIN' ? '👑' : user.role === 'PROVIDER' ? '🔧' : '👤';
        const verifiedIcon = user.isEmailVerified ? '✅' : '❌';
        console.log(`   ${index + 1}. ${roleIcon} ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`      Role: ${user.role} | Verified: ${verifiedIcon} | ID: ${user.id}`);
      });
    }

    console.log('\n🚀 Available Admin Creation Endpoints:');
    console.log('');
    
    if (adminCount === 0) {
      console.log('🔓 Initial Admin Creation (No authentication required):');
      console.log('   POST /api/admin/initial-admin');
      console.log('   Body: {');
      console.log('     "firstName": "Admin",');
      console.log('     "lastName": "User",');
      console.log('     "email": "admin@example.com",');
      console.log('     "password": "admin123"');
      console.log('   }');
      console.log('');
      console.log('   📝 This endpoint only works when NO admin users exist');
      console.log('   📝 The created user will have role="ADMIN" and isEmailVerified=true');
      console.log('');
    } else {
      console.log('🔒 Initial admin endpoint is DISABLED (admin already exists)');
      console.log('');
    }

    console.log('🔐 Regular Admin Creation (Admin authentication required):');
    console.log('   POST /api/users/admin');
    console.log('   Headers: { Authorization: "Bearer ADMIN_JWT_TOKEN" }');
    console.log('   Body: {');
    console.log('     "firstName": "New",');
    console.log('     "lastName": "Admin",');
    console.log('     "email": "newadmin@example.com",');
    console.log('     "password": "newadmin123"');
    console.log('   }');
    console.log('');
    console.log('   📝 This endpoint requires existing admin authentication');
    console.log('   📝 Only users with role="ADMIN" can create new admins');

    console.log('\n📋 Response Format:');
    console.log('{');
    console.log('  "message": "Admin user created successfully",');
    console.log('  "admin": {');
    console.log('    "id": "...",');
    console.log('    "email": "admin@example.com",');
    console.log('    "firstName": "Admin",');
    console.log('    "lastName": "User",');
    console.log('    "role": "ADMIN",');
    console.log('    "isEmailVerified": true,');
    console.log('    "createdAt": "2025-08-21T..."');
    console.log('  }');
    console.log('}');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminCreation();
