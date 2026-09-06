import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { AuthMailerService } from './auth-mailer.service.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';

@Module({
  imports: [
    UsuariosModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: 86400,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([PasswordResetToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, AuthMailerService],
  exports: [AuthService],
})
export class AuthModule {}
