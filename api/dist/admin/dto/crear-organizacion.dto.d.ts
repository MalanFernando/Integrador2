export declare class CrearOrganizacionDto {
    nombre: string;
    slug?: string;
    descripcion?: string;
    logoUrl?: string;
    emailContacto: string;
    telefono?: string;
    sitioWeb?: string;
    redesSociales?: Record<string, unknown>;
    estado?: string;
    propietarioId: string;
}
