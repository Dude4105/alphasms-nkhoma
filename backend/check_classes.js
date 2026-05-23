
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClasses() {
  const classes = await prisma.class.findMany();
  console.log('Classes and their subjects:');
  classes.forEach(c => {
    console.log(`Class: ${c.name} (${c.class_id})`);
    console.log('Subjects:', JSON.stringify(c.subjects, null, 2));
    console.log('---');
  });
  process.exit(0);
}

checkClasses();
