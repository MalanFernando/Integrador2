"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_js_1 = require("./app.module.js");
const http_exception_filter_js_1 = require("./common/filters/http-exception.filter.js");
const transform_interceptor_js_1 = require("./common/interceptors/transform.interceptor.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    app.setGlobalPrefix('api');
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Hasta la Vuelta API')
        .setDescription('API de la plataforma de eventos Hasta la Vuelta')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_js_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_js_1.TransformInterceptor());
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:3001',
            process.env.ADMIN_FRONTEND_URL || 'http://localhost:3002',
        ],
        credentials: true,
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}/api`);
}
void bootstrap();
//# sourceMappingURL=main.js.map