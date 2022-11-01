export interface ICategory {
    id: string;
    title: string;
}

export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    password: string;
    role: string;
    refreshToken?: string;
    description: string;
}

export interface IResearch {
    id: string;
    name: string;
    description: string;
    createdByUserId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export interface IDicom {
    id: string;
    downloadingUrl: string;
    researchId: string;
    name: string;
    createdAt: string;
    isUploaded: boolean;
}