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
exports.FeedsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedsService = class FeedsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 10;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.schoolFeed.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.schoolFeed.count(),
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
        const feed = await this.prisma.schoolFeed.findUnique({ where: { id } });
        if (!feed)
            throw new common_1.NotFoundException('Feed not found');
        return feed;
    }
    async create(data) {
        return this.prisma.schoolFeed.create({
            data,
        });
    }
    async update(id, data) {
        const feed = await this.prisma.schoolFeed.findUnique({ where: { id } });
        if (!feed)
            throw new common_1.NotFoundException('Feed not found');
        return this.prisma.schoolFeed.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        const feed = await this.prisma.schoolFeed.findUnique({ where: { id } });
        if (!feed)
            throw new common_1.NotFoundException('Feed not found');
        return this.prisma.schoolFeed.delete({
            where: { id },
        });
    }
};
exports.FeedsService = FeedsService;
exports.FeedsService = FeedsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedsService);
//# sourceMappingURL=feeds.service.js.map