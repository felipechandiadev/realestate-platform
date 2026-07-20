export type AdministratorStatus = "ACTIVE" | "INVITED" | "INACTIVE" | "SUSPENDED";




export interface AdministratorType  {
    id: string;
    username: string;
    email: string;
    status: AdministratorStatus;
    role: string;
    permissions: string[];
    personalInfo: {
        phone?: string;
        lastName?: string;
        avatarUrl?: string | null;
        firstName?: string;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    lastLogin: string;

}