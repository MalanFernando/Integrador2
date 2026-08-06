import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: {
        user: {
            id: string;
        };
    }): Promise<Omit<import("../usuarios/entities/usuario.entity.js").Usuario, "passwordHash">>;
}
