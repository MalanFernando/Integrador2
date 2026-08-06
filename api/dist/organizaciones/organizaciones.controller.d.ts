import { OrganizacionesService } from './organizaciones.service.js';
import { CreateOrganizacionDto } from './dto/create-organizacion.dto.js';
import { UpdateOrganizacionDto } from './dto/update-organizacion.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { CreateEstablecimientoDto } from './dto/create-establecimiento.dto.js';
import { UpdateEstablecimientoDto } from './dto/update-establecimiento.dto.js';
export declare class OrganizacionesController {
    private readonly organizacionesService;
    constructor(organizacionesService: OrganizacionesService);
    list(): Promise<import("./entities/organizacion.entity.js").Organizacion[]>;
    detail(slug: string): Promise<{
        miembros: import("./entities/miembro-organizacion.entity.js").MiembroOrganizacion[];
        establecimientos: import("./entities/establecimiento.entity.js").Establecimiento[];
        id: string;
        propietarioId: string;
        propietario: import("../usuarios/entities/usuario.entity.js").Usuario;
        nombre: string;
        slug: string;
        descripcion: string | null;
        logoUrl: string | null;
        emailContacto: string;
        telefono: string | null;
        sitioWeb: string | null;
        redesSociales: Record<string, unknown>;
        calificacionPromedio: string;
        estado: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    create(user: {
        id: string;
    }, dto: CreateOrganizacionDto): Promise<import("./entities/organizacion.entity.js").Organizacion>;
    update(user: {
        id: string;
        rol: string;
    }, id: string, dto: UpdateOrganizacionDto): Promise<import("./entities/organizacion.entity.js").Organizacion>;
    addMember(user: {
        id: string;
        rol: string;
    }, id: string, dto: AddMemberDto): Promise<import("./entities/miembro-organizacion.entity.js").MiembroOrganizacion>;
    updateMember(user: {
        id: string;
        rol: string;
    }, id: string, miembroId: string, dto: UpdateMemberDto): Promise<import("./entities/miembro-organizacion.entity.js").MiembroOrganizacion>;
    removeMember(user: {
        id: string;
        rol: string;
    }, id: string, miembroId: string): Promise<{
        message: string;
    }>;
    createEstablecimiento(user: {
        id: string;
        rol: string;
    }, id: string, dto: CreateEstablecimientoDto): Promise<import("./entities/establecimiento.entity.js").Establecimiento>;
    listEstablecimientos(estado?: string): Promise<import("./entities/establecimiento.entity.js").Establecimiento[]>;
    findEstablecimiento(id: string): Promise<import("./entities/establecimiento.entity.js").Establecimiento>;
    updateEstablecimiento(user: {
        id: string;
        rol: string;
    }, id: string, dto: UpdateEstablecimientoDto): Promise<import("./entities/establecimiento.entity.js").Establecimiento>;
}
