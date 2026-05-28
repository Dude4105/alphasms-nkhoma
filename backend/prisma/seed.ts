import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for existing admin accounts...');
  
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!adminExists) {
    console.log('No admin account found. Seeding admin account...');
    
    const passwordHash = await bcrypt.hash('pass1234', 10);
    
    const permissions = [
      'Dashboard',
      'Students',
      'Teachers',
      'Classes',
      'Subjects',
      'Enrollment',
      'Finance',
      'Boarding',
      'Password Resets',
      'School Feeds',
      'Settings',
      'Edit Admin Access',
      'Delete Admin',
    ];

    const admin = await prisma.user.create({
      data: {
        email: 'admin@alphasmis.com',
        passwordHash,
        role: Role.ADMIN,
        adminProfile: {
          create: {
            firstName: 'system',
            lastName: 'admin',
            phone: '+265990070065',
            permissions,
          },
        },
      },
    });
    
    console.log(`Admin account seeded successfully: ${admin.email}`);
  } else {
    console.log('Admin account already exists. Skipping seeding.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
