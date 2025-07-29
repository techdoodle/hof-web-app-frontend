export interface User {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    playerCategory: string | null;
    preferredTeam: any;
    city: any;
    gender: string | null;
    onboardingComplete: boolean;
    createdAt: string;
    updatedAt: string;
}