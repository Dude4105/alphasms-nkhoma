"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostelsModule = void 0;
const common_1 = require("@nestjs/common");
const hostels_controller_1 = require("./hostels.controller");
const hostels_service_1 = require("./hostels.service");
let HostelsModule = class HostelsModule {
};
exports.HostelsModule = HostelsModule;
exports.HostelsModule = HostelsModule = __decorate([
    (0, common_1.Module)({
        controllers: [hostels_controller_1.HostelsController],
        providers: [hostels_service_1.HostelsService],
    })
], HostelsModule);
//# sourceMappingURL=hostels.module.js.map