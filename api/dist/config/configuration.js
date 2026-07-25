"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'hasta_la_vuelta',
}));
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
}));
//# sourceMappingURL=configuration.js.map