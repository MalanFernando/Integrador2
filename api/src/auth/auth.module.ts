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
import { EmailVerificationCode } from './entities/email-verification-code.entity.js';
import { MailerModule } from './mailer.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module.js';

@Module({
  imports: [
    UsuariosModule,
    OrganizacionesModule,
    MailerModule,
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
    TypeOrmModule.forFeature([PasswordResetToken, EmailVerificationCode]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: GoogleStrategy,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID', '');
        const clientSecret = configService.get<string>(
          'GOOGLE_CLIENT_SECRET',
          '',
        );
        if (!clientID || !clientSecret) {
          return undefined;
        }
        return new GoogleStrategy(configService);
      },
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
