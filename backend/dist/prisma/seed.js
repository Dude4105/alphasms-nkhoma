"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const adminPass = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@alphabetsmis.com' },
        update: {},
        create: {
            email: 'admin@alphabetsmis.com',
            passwordHash: adminPass,
            role: client_1.Role.ADMIN,
            adminProfile: {
                create: {
                    firstName: 'System',
                    lastName: 'Administrator',
                }
            }
        },
    });
    const class1A = await prisma.class.upsert({
        where: { class_id: 'C-1A' },
        update: {},
        create: {
            class_id: 'C-1A',
            name: 'Form 1A',
        },
    });
    const ownerPass = await bcrypt.hash('owner123', 10);
    const ownerUser = await prisma.user.upsert({
        where: { email: 'owner@alphabetsmis.com' },
        update: {},
        create: {
            email: 'owner@alphabetsmis.com',
            passwordHash: ownerPass,
            role: client_1.Role.HOSTEL_OWNER,
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
    const studentPass = await bcrypt.hash('student123', 10);
    const studentUser = await prisma.user.upsert({
        where: { email: 'student1@alphabetsmis.com' },
        update: {},
        create: {
            email: 'student1@alphabetsmis.com',
            passwordHash: studentPass,
            role: client_1.Role.STUDENT,
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
        const termStr = '1';
        const academicYear = '2025';
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
//# sourceMappingURL=seed.js.map