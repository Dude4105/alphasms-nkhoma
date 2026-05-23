import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create an Admin user
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alphabetsmis.com' },
    update: {},
    create: {
      email: 'admin@alphabetsmis.com',
      passwordHash: adminPass,
      role: Role.ADMIN,
      adminProfile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
        }
      }
    },
  });

  // Create a Class
  const class1A = await prisma.class.upsert({
    where: { class_id: 'C-1A' },
    update: {},
    create: {
      class_id: 'C-1A',
      name: 'Form 1A',
    },
  });

  // Create a Hostel and Owner
  const ownerPass = await bcrypt.hash('owner123', 10);
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@alphabetsmis.com' },
    update: {},
    create: {
      email: 'owner@alphabetsmis.com',
      passwordHash: ownerPass,
      role: Role.HOSTEL_OWNER,
      hostelOwner: {
        create: {
          hostels: {
            create: [
              {
                hostel_id: 'H-01',
                name: 'Sunrise Hostel',
                capacity: 50,
              }
            ]
          }
        }
      }
    },
  });
  
  const hostel = await prisma.hostel.findUnique({ where: { hostel_id: 'H-01' } });

  // Create a Student
  const studentPass = await bcrypt.hash('student123', 10);
  const studentUser = await prisma.user.upsert({
    where: { email: 'student1@alphabetsmis.com' },
    update: {},
    create: {
      email: 'student1@alphabetsmis.com',
      passwordHash: studentPass,
      role: Role.STUDENT,
      student: {
        create: {
          student_id: 'S-2024-001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'student1@alphabetsmis.com',
          classId: class1A.id,
          hostelId: hostel?.id,
        }
      }
    },
    include: { student: true }
  });

  if (studentUser.student) {
    const termStr = '1'; // normally would pull from SystemSetting
    const academicYear = '2025'; // adjust if needed
    
    // Check if results exist
    const existingResultCount = await prisma.result.count({
        where: { studentId: studentUser.student.id }
    });

    if (existingResultCount === 0) {
        await prisma.result.createMany({
            data: [
                { studentId: studentUser.student.id, subjectKey: 'bio', score: 85, term: 1, academicYear },
                { studentId: studentUser.student.id, subjectKey: 'math', score: 78, term: 1, academicYear },
                { studentId: studentUser.student.id, subjectKey: 'eng', score: 88, term: 1, academicYear },
                { studentId: studentUser.student.id, subjectKey: 'chi', score: 82, term: 1, academicYear },
                { studentId: studentUser.student.id, subjectKey: 'phys', score: 80, term: 1, academicYear }
            ]
        });
        console.log('Dummy results seeded.');
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
