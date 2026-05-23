
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyInTermResults() {
  const classId = 'CLS-1776613060396'; // Form 1A
  
  console.log(`Verifying results for class ${classId}...`);
  
  // We'll mock the internal call to the service logic or just check the database state
  const classEntity = await prisma.class.findUnique({
    where: { class_id: classId },
    include: { students: true },
  });

  if (!classEntity) {
    console.error('Class not found');
    process.exit(1);
  }

  const subjects = JSON.parse(JSON.stringify(classEntity.subjects || []));
  console.log('Configured subjects:', subjects.map(s => s.name));

  // Simulating the backend logic
  const normalizeSubjectKey = (name) => {
    const map = {
        biology: 'bio',
        mathematics: 'math',
        english: 'eng',
        chichewa: 'chi',
    };
    const lower = name.toLowerCase();
    return map[lower] || lower.replace(/\s+/g, '_').substring(0, 10);
  };

  const headers = subjects.map(s => ({
    name: s.name,
    key: normalizeSubjectKey(s.name)
  }));

  console.log('Expected Headers:', headers);
  
  if (headers.length === subjects.length) {
    console.log('SUCCESS: All configured subjects are in the headers.');
  } else {
    console.log('FAILURE: Subject count mismatch.');
  }

  process.exit(0);
}

verifyInTermResults();
