"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const defaultPermissions = [
    'Dashboard',
    'Students',
    'Teachers',
    'Classes',
    'Subjects',
    'Enrollment',
    'Finance',
    'Boarding',
    'Password Resets',
    'Settings',
];
async function main() {
    const admins = await prisma.adminProfile.findMany();
    for (const admin of admins) {
        if (!admin.permissions) {
            await prisma.adminProfile.update({
                where: { id: admin.id },
                data: { permissions: defaultPermissions },
            });
            console.log(`Updated admin ${admin.firstName} ${admin.lastName} with full permissions.`);
        }
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=update-admins.js.map