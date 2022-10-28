type ResearchStatus = 'CREATED' | 'IN_WORK' | 'REVIEW' | 'DONE'

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
    status: ResearchStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export interface IDicom {
    id: string;
    fileName: string;
    size: number;
    isUploaded: boolean;
}