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
    //TODO Field are not final
    id: string,
    fileName: string,
    size: number,
    status: ResearchStatus
    createdAt: Date;
    updatedAt: Date;
}
