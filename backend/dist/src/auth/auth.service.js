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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async hashData(data) {
        return bcrypt.hash(data, 10);
    }
    async getTokens(userId, email, role) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, email, role }, {
                secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
                expiresIn: '15m',
            }),
            this.jwtService.signAsync({ sub: userId, email, role }, {
                secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
                expiresIn: '7d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hash = await this.hashData(refreshToken);
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: hash },
        });
    }
    async login(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            ...tokens,
        };
    }
    async register(email, pass, role) {
        const passwordHash = await this.hashData(pass);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
            },
        });
        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRefreshToken: { not: null },
            },
            data: {
                hashedRefreshToken: null,
            },
        });
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.hashedRefreshToken) {
            throw new common_1.ForbiddenException('Access Denied');
        }
        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!refreshTokenMatches) {
            throw new common_1.ForbiddenException('Access Denied');
        }
        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                message: 'If that email is registered, a reset link has been sent.',
            };
        }
        await this.prisma.passwordResetRequest.create({
            data: {
                email,
                status: 'PENDING',
            },
        });
        return {
            message: 'If that email is registered, a reset link has been sent.',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map