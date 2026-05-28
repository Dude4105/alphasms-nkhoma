"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HostelsService = class HostelsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = query.search
            ? {
                OR: [
                    { name: { contains: query.search } },
                    { hostel_id: { contains: query.search } },
                ],
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.hostel.findMany({
                where,
                skip,
                take: limit,
                include: {
                    owner: {
                        select: {
                            user: {
                                select: {
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: { students: true },
                    },
                },
            }),
            this.prisma.hostel.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
                limit,
            },
        };
    }
    async findOne(id) {
        return this.prisma.hostel.findUnique({
            where: { id },
            include: {
                students: {
                    select: {
                        id: true,
                        student_id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                owner: {
                    select: {
                        user: {
                            select: {
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getStats() {
        const totalCapacityResult = await this.prisma.hostel.aggregate({
            _sum: { capacity: true },
        });
        const currentlyBoarding = await this.prisma.student.count({
            where: {
                hostelId: { not: null },
            },
        });
        const totalCapacity = totalCapacityResult._sum.capacity || 0;
        const occupancyRate = totalCapacity
            ? Math.round((currentlyBoarding / totalCapacity) * 100)
            : 0;
        return {
            totalCapacity,
            currentlyBoarding,
            occupancyRate: `${occupancyRate}%`,
            maintenanceRooms: 0,
        };
    }
    async create(data) {
        const hostel_id = `HOS-${Math.floor(100 + Math.random() * 900)}`;
        return this.prisma.hostel.create({
            data: {
                hostel_id,
                name: data.name,
                type: data.type,
                capacity: Number(data.capacity),
                warden: data.warden,
                wardenPhone: data.wardenPhone,
                wardenEmail: data.wardenEmail,
                ownerId: 1,
            },
        });
    }
    async update(id, data) {
        const hostel = await this.prisma.hostel.findUnique({ where: { id } });
        if (!hostel) {
            throw new common_1.NotFoundException(`Hostel with ID ${id} not found`);
        }
        return this.prisma.hostel.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
                warden: data.warden,
                wardenPhone: data.wardenPhone,
                wardenEmail: data.wardenEmail,
            },
        });
    }
    async remove(id) {
        const hostel = await this.prisma.hostel.findUnique({ where: { id } });
        if (!hostel) {
            throw new common_1.NotFoundException(`Hostel with ID ${id} not found`);
        }
        return this.prisma.hostel.delete({
            where: { id },
        });
    }
};
exports.HostelsService = HostelsService;
exports.HostelsService = HostelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HostelsService);
//# sourceMappingURL=hostels.service.js.map