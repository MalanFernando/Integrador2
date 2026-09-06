import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleUser {
  email: string;
  nombre: string;
  apellido: string;
  fotoPerfilUrl: string;
  googleId: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3000/api/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      name?: { givenName?: string; familyName?: string };
      emails?: Array<{ value: string }>;
      photos?: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): void {
    const user: GoogleUser = {
      email: profile.emails?.[0]?.value ?? '',
      nombre: profile.name?.givenName ?? '',
      apellido: profile.name?.familyName ?? '',
      fotoPerfilUrl: profile.photos?.[0]?.value ?? '',
      googleId: profile.id,
    };
    done(null, user);
  }
}
