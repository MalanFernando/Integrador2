import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'hasta_la_vuelta',
}));

export const appConfig = registerAs('app', () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const jwtSecret = process.env.JWT_SECRET;

  if (nodeEnv === 'production' && !jwtSecret) {
    throw new Error('JWT_SECRET is required in production');
  }

  return {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    adminFrontendUrl: process.env.ADMIN_FRONTEND_URL || 'http://localhost:3002',
    jwtSecret: jwtSecret || 'dev-secret-change-in-production',
  };
});
