"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_js_1 = require("./app.module.js");
const http_exception_filter_js_1 = require("./common/filters/http-exception.filter.js");
const transform_interceptor_js_1 = require("./common/interceptors/transform.interceptor.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_js_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_js_1.TransformInterceptor());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map