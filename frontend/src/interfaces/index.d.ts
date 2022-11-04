import {Annotation} from "@cornerstonejs/tools/dist/esm/types";

export interface ICategory {
    id: string;
    title: string;
}

export interface IUser {
    id: string;
    email: string;
    lastName: string;
    firstName: string;
    middleName: string;
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
    status: string;
    dicoms: Array<IDicom>
    parentResearchId: string;
    assigneeUserId: string;
    markup: null | RawMarkup;
    autoMarkup: null | Array<Array<Array<{ x: number, y: number }>>>
}

export interface IResearchFilterVariables {
    name?: string;
    createdAt?: [Dayjs, Dayjs];
    status?: string;
  }

export interface IDicom {
    id: string;
    downloadingUrl: string;
    researchId: string;
    name: string;
    createdAt: string;
    isUploaded: boolean;
}

export interface RawMarkup {
    [userId: string]: {username: string, markup: Array<Annotation>}
}

export interface IMarkup {
    [userId: string]: {
        userInfo: {
            firstName: string,
            lastName: string
        },
        annotations: Array<Annotation>
    }
}