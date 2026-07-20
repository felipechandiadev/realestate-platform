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
        firstName?: string;
        company?: string;
        nationality?: string;
        maritalStatus?: string;
        avatarUrl?: string | null;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    lastLogin: string;

}