import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
export interface JwtPayload {
    sub: string;
    email: string;
    rol: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usuariosService;
    constructor(configService: ConfigService, usuariosService: UsuariosService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        rol: string;
    }>;
}
export {};
