export declare class Usuario {
    id: string;
    email: string;
    passwordHash: string;
    nombreCompleto: string;
    telefono: string;
    fotoPerfilUrl: string;
    biografia: string;
    redesSociales: Record<string, unknown>;
    rol: string;
    estado: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deletedBy: string | null;
}
