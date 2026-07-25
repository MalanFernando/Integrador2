import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthService {
    private readonly usuariosService;
    private readonly jwtService;
    constructor(usuariosService: UsuariosService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            nombreCompleto: string;
            rol: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            nombreCompleto: string;
            rol: string;
        };
    }>;
    private generateToken;
}
