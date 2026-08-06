import { Usuario } from '../../usuarios/entities/usuario.entity.js';
export declare class Notificacion {
    id: string;
    usuarioId: string;
    usuario: Usuario;
    tipo: string;
    titulo: string;
    mensaje: string;
    datosJson: Record<string, unknown>;
    leida: boolean;
    createdAt: Date;
}
